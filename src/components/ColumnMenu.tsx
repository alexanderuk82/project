import { useState } from 'react';
import { Column, useBoardStore } from '../store/board-store';
import { X, Edit2, Trash2, MoveVertical } from 'lucide-react';

interface ColumnMenuProps {
  column: Column;
  onClose: () => void;
}

export function ColumnMenu({ column, onClose }: ColumnMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPositionMenu, setShowPositionMenu] = useState(false);
  const [newName, setNewName] = useState(column.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateColumnName = useBoardStore((state) => state.updateColumnName);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);
  const updateColumnPosition = useBoardStore((state) => state.updateColumnPosition);
  const columns = useBoardStore((state) => state.columns);

  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const handleRename = async () => {
    if (newName.trim() && newName !== column.name) {
      await updateColumnName(column.status, newName.trim());
      onClose();
    }
  };

  const handleDelete = async () => {
    await deleteColumn(column.status);
    onClose();
  };

  const handlePositionChange = async (newPosition: number) => {
    await updateColumnPosition(column.status, newPosition);
    onClose();
  };

  if (showDeleteConfirm) {
    return (
      <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-72">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-red-600">Delete Column</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete this column? All tasks in this column will be permanently deleted.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-72">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-700">Rename Column</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new name"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  if (showPositionMenu && isMobile) {
    return (
      <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 w-72">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-700">Move Column</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {sortedColumns.map((col, index) => (
            <button
              key={col.status}
              onClick={() => handlePositionChange(index)}
              className={`w-full px-4 py-2 text-left rounded-lg ${
                col.status === column.status
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="font-medium">{`Position ${index + 1}`}</div>
              <div className="text-sm opacity-75">
                {col.status === column.status ? 'Current position' : `Move here`}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 w-48">
      <button
        onClick={() => setIsEditing(true)}
        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        <span>Rename</span>
      </button>
      {isMobile && (
        <button
          onClick={() => setShowPositionMenu(true)}
          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <MoveVertical className="w-4 h-4" />
          <span>Move</span>
        </button>
      )}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );
}