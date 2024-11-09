import { Task, useBoardStore } from '../store/board-store';

interface DeleteModalProps {
  task: Task;
  onClose: () => void;
}

export function DeleteModal({ task, onClose }: DeleteModalProps) {
  const deleteTask = useBoardStore((state) => state.deleteTask);

  const handleDelete = async () => {
    await deleteTask(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-red-200 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Delete Task</h2>
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this task?
          </p>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">{task.title}</p>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Status: <span className="font-medium">{task.status}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}