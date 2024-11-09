import { X } from 'lucide-react';
import { useState } from 'react';
import { useBoardStore } from '../store/board-store';
import toast from 'react-hot-toast';

interface CreateColumnModalProps {
  onClose: () => void;
}

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-50/50' },
  { name: 'Purple', value: 'bg-purple-50/50' },
  { name: 'Yellow', value: 'bg-yellow-50/50' },
  { name: 'Orange', value: 'bg-orange-50/50' },
  { name: 'Green', value: 'bg-green-50/50' },
  { name: 'Red', value: 'bg-red-50/50' },
  { name: 'Pink', value: 'bg-pink-50/50' },
  { name: 'Indigo', value: 'bg-indigo-50/50' },
];

export function CreateColumnModal({ onClose }: CreateColumnModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0].value);
  const addColumn = useBoardStore((state) => state.addColumn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await addColumn({
        name: name.trim(),
        color,
      });
      
      toast.success('Column created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create column');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Create New Column</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Column Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter column name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Column Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={`h-12 rounded-lg ${option.value} border-2 transition-all ${
                    color === option.value
                      ? 'border-blue-500 scale-105'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}