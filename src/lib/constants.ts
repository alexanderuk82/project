import { Status } from '../store/board-store';

export const statusColorMap: Record<Status, string> = {
  todo: 'bg-blue-50/50',
  doing: 'bg-purple-50/50',
  progress: 'bg-yellow-50/50',
  feedback: 'bg-orange-50/50',
  done: 'bg-green-50/50',
};

export const statusMap: Record<Status, string> = {
  todo: 'To Do',
  doing: 'Doing',
  progress: 'In Progress',
  feedback: 'Feedback',
  done: 'Done',
};