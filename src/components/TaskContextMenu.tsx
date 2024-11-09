import { X, Trash2, Move, Edit } from 'lucide-react';
import { useState } from 'react';
import { Task, Status, useBoardStore } from '../store/board-store';
import { DeleteTaskModal } from './DeleteTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { statusColorMap } from '../lib/constants';

interface TaskContextMenuProps {
  task: Task;
  onClose: () => void;
  isMobile: boolean;
}

export function TaskContextMenu({ task, onClose, isMobile }: TaskContextMenuProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const columns = useBoardStore((state) => state.columns);
  const moveTask = useBoardStore((state) => state.moveTask);

  const handleStatusChange = async (newStatus: Status) => {
    await moveTask(task.id, newStatus);
    onClose();
  };

  if (showDeleteModal) {
    return <DeleteTaskModal task={task} onClose={() => {
      setShowDeleteModal(false);
      onClose();
    }} />;
  }

  if (showEditModal) {
    return <EditTaskModal task={task} onClose={() => {
      setShowEditModal(false);
      onClose();
    }} />;
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[100000]">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className={`absolute bottom-0 left-0 right-0 ${statusColorMap[task.status]} rounded-t-xl animate-in slide-in-from-bottom-4`}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{task.title}</h3>
              <button onClick={onClose} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <Move className="w-5 h-5" />
                <span className="font-medium">Move to...</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {columns.map((column) => (
                  <button
                    key={column.status}
                    onClick={() => handleStatusChange(column.status)}
                    className={`p-3 rounded-lg text-left ${
                      task.status === column.status
                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="font-medium">{column.name}</div>
                    <div className="text-sm opacity-75">
                      {task.status === column.status ? 'Current status' : `Move here`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-center gap-2 p-3 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit className="w-5 h-5" />
                <span>Edit task</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
                <span>Remove this task</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
      <button
        onClick={() => setShowEditModal(true)}
        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Edit className="w-4 h-4" />
        <span>Edit</span>
      </button>
      <button
        onClick={() => setShowDeleteModal(true)}
        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );
}