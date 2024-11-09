import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { GanttChartSquare, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Column } from './components/Column';
import { TaskCard } from './components/TaskCard';
import { NetworkStatus } from './components/NetworkStatus';
import { Status, Task, useBoardStore } from './store/board-store';
import { AuthGuard } from './components/AuthGuard';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth-store';

function KanbanBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const signOut = useAuthStore((state) => state.signOut);
  const user = useAuthStore((state) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const moveTask = useBoardStore((state) => state.moveTask);
  const columns = useBoardStore((state) => state.columns);
  const initializeBoard = useBoardStore((state) => state.initializeBoard);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'task';
    const isOverATask = over.data.current?.type === 'task';

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      const overTask = over.data.current?.task as Task;
      moveTask(activeId as string, overTask.status);
    }

    if (isActiveATask && !isOverATask) {
      moveTask(activeId as string, overId as Status);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    if (!containerRef.current) return;
    setIsDragging(false);
    containerRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-800">
                <GanttChartSquare className="w-8 h-8" />
                <h1 className="text-2xl font-semibold">Modern Kanban Board</h1>
              </div>
              <button
                onClick={signOut}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-700">
                Welcome back, {userName}!
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-700">
                Welcome back, {userName}!
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-800">
              <GanttChartSquare className="w-8 h-8" />
              <h1 className="text-2xl font-semibold">Modern Kanban Board</h1>
            </div>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div 
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            className="flex gap-6 h-[calc(100vh-12rem)] select-none cursor-grab overflow-x-auto scrollbar-hide overscroll-x-contain touch-pan-x"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x pan-y pinch-zoom',
            }}
          >
            <SortableContext items={columns}>
              {columns.map((column) => (
                <Column key={column.status} status={column.status} />
              ))}
              <Column />
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>
        </DndContext>

        <NetworkStatus />
      </div>
    </div>
  );
}

export function App() {
  return (
    <>
      <Toaster position="bottom-center" />
      <AuthGuard>
        <KanbanBoard />
      </AuthGuard>
    </>
  );
}

export default App;