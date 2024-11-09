import { create } from 'zustand';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  orderBy,
  getDocs,
  writeBatch,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';
import { useAuthStore } from './auth-store';

export type Status = string;

export type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: Date;
  userId: string;
};

export type Column = {
  id: string;
  status: Status;
  name: string;
  color: string;
  position: number;
  userId: string;
};

type BoardStore = {
  tasks: Task[];
  columns: Column[];
  isOnline: boolean;
  error: string | null;
  initialized: boolean;
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'status' | 'userId'>>) => Promise<void>;
  moveTask: (taskId: string, status: Status) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  deleteColumn: (status: Status) => Promise<void>;
  updateColumnName: (status: Status, newName: string) => Promise<void>;
  updateColumnPosition: (status: Status, newPosition: number) => Promise<void>;
  reorderColumns: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  addColumn: (column: { name: string; color: string }) => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
  setError: (error: string | null) => void;
  initializeBoard: () => Promise<void>;
};

const defaultColumns: Omit<Column, 'id' | 'userId'>[] = [
  { status: 'todo', name: 'To Do', color: 'bg-blue-50/50', position: 0 },
  { status: 'doing', name: 'Doing', color: 'bg-purple-50/50', position: 1 },
  { status: 'progress', name: 'In Progress', color: 'bg-yellow-50/50', position: 2 },
  { status: 'feedback', name: 'Feedback', color: 'bg-orange-50/50', position: 3 },
  { status: 'done', name: 'Done', color: 'bg-green-50/50', position: 4 },
];

export const useBoardStore = create<BoardStore>((set, get) => {
  let unsubscribeTasks: (() => void) | null = null;
  let unsubscribeColumns: (() => void) | null = null;

  const setupListeners = async (userId: string) => {
    try {
      set({ loading: true });

      // Initialize columns if they don't exist
      const columnsRef = collection(db, 'columns');
      const columnsQuery = query(columnsRef, orderBy('position'));
      const columnsSnapshot = await getDocs(columnsQuery);

      if (columnsSnapshot.empty) {
        const batch = writeBatch(db);
        defaultColumns.forEach((column) => {
          const docRef = doc(columnsRef);
          batch.set(docRef, { 
            ...column,
            id: docRef.id,
            userId,
          });
        });
        await batch.commit();
      }

      // Listen for tasks changes
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'));
      
      unsubscribeTasks = onSnapshot(
        tasksQuery,
        (snapshot) => {
          const tasks = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
            }))
            .filter((task) => task.userId === userId) as Task[];

          set((state) => ({ 
            ...state, 
            tasks,
            error: null,
          }));
        },
        (error) => {
          console.error('Tasks subscription error:', error);
          set({ error: error.message, loading: false });
          toast.error('Error loading tasks');
        }
      );

      // Listen for columns changes
      unsubscribeColumns = onSnapshot(
        columnsQuery,
        (snapshot) => {
          const columns = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((column) => column.userId === userId) as Column[];
          
          set((state) => ({ 
            ...state, 
            columns: columns.length ? columns : [],
            loading: false,
            initialized: true,
            error: null
          }));
        },
        (error) => {
          console.error('Columns subscription error:', error);
          set({ error: error.message, loading: false });
          toast.error('Error loading columns');
        }
      );
    } catch (error: any) {
      console.error('Setup error:', error);
      set({ error: error.message, loading: false });
      toast.error('Error setting up board');
    }
  };

  return {
    tasks: [],
    columns: [],
    isOnline: navigator.onLine,
    error: null,
    initialized: false,
    loading: true,

    initializeBoard: async () => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      // Cleanup previous listeners
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeColumns) unsubscribeColumns();

      // Setup new listeners
      await setupListeners(user.uid);
    },

    addTask: async (task) => {
      try {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');

        set({ error: null });
        await addDoc(collection(db, 'tasks'), {
          ...task,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        toast.success('Task added successfully');
      } catch (error: any) {
        console.error('Error adding task:', error);
        set({ error: error.message });
        toast.error('Failed to add task');
      }
    },

    updateTask: async (taskId, updates) => {
      try {
        set({ error: null });
        await updateDoc(doc(db, 'tasks', taskId), updates);
        toast.success('Task updated successfully');
      } catch (error: any) {
        console.error('Error updating task:', error);
        set({ error: error.message });
        toast.error('Failed to update task');
      }
    },

    deleteTask: async (taskId) => {
      try {
        set({ error: null });
        await deleteDoc(doc(db, 'tasks', taskId));
        toast.success('Task deleted successfully');
      } catch (error: any) {
        console.error('Error deleting task:', error);
        set({ error: error.message });
        toast.error('Failed to delete task');
      }
    },

    moveTask: async (taskId, status) => {
      try {
        set({ error: null });
        await updateDoc(doc(db, 'tasks', taskId), { status });
      } catch (error: any) {
        console.error('Error moving task:', error);
        set({ error: error.message });
        toast.error('Failed to move task');
      }
    },

    deleteColumn: async (status) => {
      try {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');

        set({ error: null });
        const batch = writeBatch(db);
        
        // Delete all tasks in the column
        const tasksToDelete = get().tasks.filter(task => task.status === status);
        tasksToDelete.forEach(task => {
          batch.delete(doc(db, 'tasks', task.id));
        });

        // Find and delete the column
        const columnToDelete = get().columns.find(col => col.status === status);
        if (columnToDelete) {
          batch.delete(doc(db, 'columns', columnToDelete.id));
        }
        
        // Update positions of remaining columns
        const remainingColumns = get().columns
          .filter(col => col.status !== status)
          .sort((a, b) => a.position - b.position);

        remainingColumns.forEach((col, index) => {
          batch.update(doc(db, 'columns', col.id), { position: index });
        });
        
        await batch.commit();
        toast.success('Column deleted successfully');
      } catch (error: any) {
        console.error('Error deleting column:', error);
        set({ error: error.message });
        toast.error('Failed to delete column');
      }
    },

    updateColumnName: async (status, newName) => {
      try {
        set({ error: null });
        const column = get().columns.find(col => col.status === status);
        if (column) {
          await updateDoc(doc(db, 'columns', column.id), { name: newName });
          toast.success('Column renamed successfully');
        }
      } catch (error: any) {
        console.error('Error updating column name:', error);
        set({ error: error.message });
        toast.error('Failed to rename column');
      }
    },

    updateColumnPosition: async (status, newPosition) => {
      try {
        set({ error: null });
        const batch = writeBatch(db);
        const columns = [...get().columns].sort((a, b) => a.position - b.position);
        const oldPosition = columns.findIndex(col => col.status === status);
        
        if (oldPosition === newPosition) return;

        // Update positions
        if (oldPosition < newPosition) {
          // Moving right
          for (let i = oldPosition + 1; i <= newPosition; i++) {
            batch.update(doc(db, 'columns', columns[i].id), { 
              position: columns[i].position - 1 
            });
          }
        } else {
          // Moving left
          for (let i = newPosition; i < oldPosition; i++) {
            batch.update(doc(db, 'columns', columns[i].id), { 
              position: columns[i].position + 1 
            });
          }
        }

        const column = columns.find(col => col.status === status);
        if (column) {
          batch.update(doc(db, 'columns', column.id), { position: newPosition });
        }
        
        await batch.commit();
        toast.success('Column position updated');
      } catch (error: any) {
        console.error('Error updating column position:', error);
        set({ error: error.message });
        toast.error('Failed to update column position');
      }
    },

    reorderColumns: async (sourceIndex: number, destinationIndex: number) => {
      try {
        set({ error: null });
        const batch = writeBatch(db);
        const columns = [...get().columns].sort((a, b) => a.position - b.position);
        
        if (sourceIndex === destinationIndex) return;

        const [movedColumn] = columns.splice(sourceIndex, 1);
        columns.splice(destinationIndex, 0, movedColumn);

        // Update all positions
        columns.forEach((column, index) => {
          batch.update(doc(db, 'columns', column.id), { position: index });
        });

        await batch.commit();
      } catch (error: any) {
        console.error('Error reordering columns:', error);
        set({ error: error.message });
        toast.error('Failed to reorder columns');
      }
    },

    addColumn: async ({ name, color }) => {
      try {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');

        set({ error: null });
        const columns = get().columns;
        const status = name.toLowerCase().replace(/\s+/g, '-');
        const position = columns.length;
        const docRef = doc(collection(db, 'columns'));

        await setDoc(docRef, {
          id: docRef.id,
          status,
          name,
          color,
          position,
          userId: user.uid,
        });
        toast.success('Column added successfully');
      } catch (error: any) {
        console.error('Error adding column:', error);
        set({ error: error.message });
        toast.error('Failed to add column');
      }
    },

    setOnlineStatus: (status) => set({ isOnline: status }),
    setError: (error) => set({ error }),
  };
});