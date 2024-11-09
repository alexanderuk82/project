import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Task } from '../store/board-store';
import { TaskContextMenu } from './TaskContextMenu';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowContextMenu(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const mobileProps = isMobile ? {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchEnd,
  } : {};

  const desktopProps = !isMobile ? {
    ...attributes,
    ...listeners,
  } : {};

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        style={style}
        {...mobileProps}
        {...desktopProps}
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 ${
          isMobile ? '' : 'cursor-grab active:cursor-grabbing'
        } hover:shadow-md transition-shadow group relative`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowContextMenu(!showContextMenu);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 -mr-2"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showContextMenu && (
        <TaskContextMenu
          task={task}
          onClose={() => setShowContextMenu(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}