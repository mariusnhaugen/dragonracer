import type { Task, TaskGroup } from '../types';
import { TaskTable } from './TaskTable';

interface Props {
  group: TaskGroup;
  tasks: Task[];
  completedIds: Set<number>;
  selectedIds: Set<number>;
  selectMode: boolean;
  tagMode: boolean;
  taskTagsMap: Record<number, string[]>;
  allTags: string[];
  onToggleComplete: (id: number) => void;
  onToggleSelect: (id: number) => void;
  onToggleCollapse: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAddTag: (taskId: number, tag: string) => void;
  onRemoveTag: (taskId: number, tag: string) => void;
}

export function GroupSection({
  group, tasks, completedIds, selectedIds, selectMode,
  tagMode, taskTagsMap, allTags,
  onToggleComplete, onToggleSelect, onToggleCollapse, onDelete, onRename,
  onAddTag, onRemoveTag,
}: Props) {
  const completedCount = tasks.filter(t => completedIds.has(t.id)).length;

  function handleRename() {
    const name = window.prompt('Rename group:', group.name);
    if (name && name.trim()) onRename(group.id, name.trim());
  }

  return (
    <div className={`border border-wiki-raised rounded-lg ${tagMode ? 'overflow-visible' : 'overflow-hidden'}`}>
      <div className="flex items-center gap-2 px-3 py-2 bg-wiki-raised cursor-pointer select-none"
        onClick={() => onToggleCollapse(group.id)}>
        <span className="text-gray-400 text-sm">{group.collapsed ? '▶' : '▼'}</span>
        <span className="font-medium text-gray-200 flex-1 text-sm">{group.name}</span>
        <span className="text-xs text-gray-500">
          {completedCount}/{tasks.length}
        </span>
        <button
          onClick={e => { e.stopPropagation(); handleRename(); }}
          className="text-xs text-gray-500 hover:text-gray-300 px-1 cursor-pointer"
          title="Rename"
        >
          ✏
        </button>
        <button
          onClick={e => { e.stopPropagation(); if (window.confirm(`Delete group "${group.name}"?`)) onDelete(group.id); }}
          className="text-xs text-gray-500 hover:text-red-400 px-1 cursor-pointer"
          title="Delete group"
        >
          ✕
        </button>
      </div>
      {!group.collapsed && (
        <TaskTable
          tasks={tasks}
          completedIds={completedIds}
          selectedIds={selectedIds}
          selectMode={selectMode}
          tagMode={tagMode}
          taskTagsMap={taskTagsMap}
          allTags={allTags}
          onToggleComplete={onToggleComplete}
          onToggleSelect={onToggleSelect}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          emptyMessage="No tasks in this group."
        />
      )}
    </div>
  );
}
