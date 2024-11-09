import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { Status, Task, useBoardStore } from '../store/board-store';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { CreateTaskModal } from './CreateTaskModal';
import { ColumnMenu } from './ColumnMenu';
import { CreateColumnModal } from './CreateColumnModal';
import { statusColorMap } from '../lib/constants';

interface ColumnProps {
  status?: Status;
}

export function Column({ status }: ColumnProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [isMobile] = useState(window.matchMedia('(max-width: 768px)').matches);
  
  const { tasks, isOnline, error, columns } = useBoardStore((state) => ({
    tasks: status ? state.tasks.filter((task) => task.status === status) : [],
    isOnline: state.isOnline,
    error: state.error,
    columns: state.columns,
  }));

  const column = status ? columns.find(col => col.status === status) : null;

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: status || 'new-column',
    data: {
      type: 'column',
      status,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (!status) {
    return (
      <div className="w-[350px] min-w-[280px] h-full flex-shrink-0">
        <div className="h-full flex items-center justify-center">
          <button 
            onClick={() => setShowCreateColumn(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <PlusCircle className="w-8 h-8" />
          </button>
        </div>
        {showCreateColumn && (
          <CreateColumnModal onClose={() => setShowCreateColumn(false)} />
        )}
      </div>
    );
  }

  if (!column) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-[350px] min-w-[280px] h-full flex flex-col gap-4 flex-shrink-0"
    >
      <div
        {...attributes}
        {...listeners}
        className={`${column.color} rounded-xl p-4 flex items-center justify-between border border-gray-200/50 shadow-sm relative`}
      >
        <div className="flex items-center gap-2 flex-1">
          <h2 className="font-semibold text-gray-700">{column.name}</h2>
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-white px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200/50 shadow-sm min-w-[2rem] text-center">
            {tasks.length}
          </span>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {showMenu && (
          <ColumnMenu
            column={column}
            onClose={() => setShowMenu(false)}
          />
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto relative">
        <SortableContext items={tasks.map(task => task.id)}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      {isMobile ? (
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors justify-center bg-white/50 p-2 rounded-lg"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add task</span>
        </button>
      ) : (
        isFormOpen ? (
          <TaskForm status={status} onClose={() => setIsFormOpen(false)} />
        ) : (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add task</span>
          </button>
        )
      )}

      {isMobile && isFormOpen && (
        <CreateTaskModal
          status={status}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}