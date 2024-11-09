import { X } from 'lucide-react';
import { Task, useBoardStore } from '../store/board-store';
import { statusColorMap } from '../lib/constants';

interface DeleteTaskModalProps {
  task: Task;
  onClose: () => void;
}

export function DeleteTaskModal({ task, onClose }: DeleteTaskModalProps) {
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const columns = useBoardStore((state) => state.columns);
  const column = columns.find(col => col.status === task.status);

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100000]">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-4 flex items-center justify-center">
        <div className={`${statusColorMap[task.status]} border-2 border-red-200 rounded-xl p-4 sm:p-6 max-w-md w-full shadow-xl animate-in slide-in-from-bottom-4`}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-900">Delete Task</h3>
            <button
              onClick={onClose}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="mb-4">
              <h4 className="font-medium text-red-800 mb-1">Task Title</h4>
              <p className="text-red-700 break-words">{task.title}</p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-red-800 mb-1">Description</h4>
              <p className="text-red-700 break-words">{task.description || 'No description'}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-red-800 mb-1">Current Status</h4>
              <p className="text-red-700">{column?.name || task.status}</p>
            </div>
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}