import type { Task } from '../types';
import { TaskRow } from './TaskRow';

interface Props {
  tasks: Task[];
  completedIds: Set<number>;
  selectedIds: Set<number>;
  selectMode: boolean;
  tagMode: boolean;
  taskTagsMap: Record<number, string[]>;
  allTags: string[];
  onToggleComplete: (id: number) => void;
  onToggleSelect: (id: number) => void;
  onAddTag: (taskId: number, tag: string) => void;
  onRemoveTag: (taskId: number, tag: string) => void;
  emptyMessage?: string;
}

export function TaskTable({
  tasks, completedIds, selectedIds, selectMode,
  tagMode, taskTagsMap, allTags,
  onToggleComplete, onToggleSelect, onAddTag, onRemoveTag,
  emptyMessage = 'No tasks match your filters.',
}: Props) {
  if (tasks.length === 0) {
    return <p className="text-xs text-gray-500 px-3 py-4 text-center italic">{emptyMessage}</p>;
  }

  return (
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr className="text-left bg-wiki-raised text-wiki-text border-b border-wiki-raised">
          <th className="w-8 px-3 py-2 font-medium"></th>
          <th className="w-10 px-2 py-2 font-medium">Area</th>
          <th className="w-44 px-2 py-2 font-medium">Task Name</th>
          <th className="px-2 py-2 font-medium">Task Details</th>
          <th className="w-44 px-2 py-2 font-medium">Requirements</th>
          <th className="w-24 px-2 py-2 font-medium text-right">Points</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-wiki-raised">
        {tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            completed={completedIds.has(task.id)}
            selected={selectedIds.has(task.id)}
            selectMode={selectMode}
            tagMode={tagMode}
            tags={taskTagsMap[task.id] ?? []}
            allTags={allTags}
            onToggleComplete={onToggleComplete}
            onToggleSelect={onToggleSelect}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
          />
        ))}
      </tbody>
    </table>
  );
}
