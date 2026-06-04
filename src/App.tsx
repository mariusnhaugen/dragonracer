import { useMemo, useState, useCallback } from 'react';
import type { Task } from './types';
import { useAppState } from './hooks/useAppState';
import { useCatalog } from './hooks/useCatalog';
import { FilterBar } from './components/FilterBar';
import { TaskTable } from './components/TaskTable';
import { GroupSection } from './components/GroupSection';
import { ProgressStats } from './components/ProgressStats';
import { PlayerControl } from './components/PlayerControl';
import { isTaskVisible } from './lib/filters';

export default function App() {
  const { state, toggleTask, createGroup, deleteGroup, renameGroup, assignTasksToGroup, toggleGroupCollapse, setFilters, setPinnedRegions, addTag, removeTag, loadPlayer } = useAppState();
  const { tasks, loading: catalogLoading, error: catalogError } = useCatalog();

  const taskMap = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
  const completedIds = useMemo(() => new Set(state.completedTaskIds), [state.completedTaskIds]);
  const regions = useMemo(() => Array.from(new Set(tasks.map(t => t.region))).sort(), [tasks]);
  const groupedTaskIds = useMemo(() => new Set(state.groups.flatMap(g => g.taskIds)), [state.groups]);
  const allTags = useMemo(() =>
    Array.from(new Set(Object.values(state.taskTags).flat())).sort(),
    [state.taskTags]
  );

  const filters = state.filters;
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [tagMode, setTagMode] = useState(false);

  const visibleUngrouped = useMemo(() =>
    tasks.filter(t => isTaskVisible(t, filters, completedIds, groupedTaskIds, state.taskTags[t.id] ?? [])),
    [tasks, groupedTaskIds, filters, completedIds, state.taskTags]
  );

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleAssignToGroup(groupId: string) {
    assignTasksToGroup(groupId, Array.from(selectedIds));
    setSelectedIds(new Set());
    setSelectMode(false);
  }

  const handleNewGroup = useCallback(() => {
    const name = window.prompt('Group name:');
    if (name?.trim()) {
      const id = createGroup(name.trim());
      if (selectedIds.size > 0) {
        assignTasksToGroup(id, Array.from(selectedIds));
        setSelectedIds(new Set());
        setSelectMode(false);
      }
    }
  }, [createGroup, assignTasksToGroup, selectedIds]);

  function handleToggleSelectMode() {
    setSelectMode(s => !s);
    setSelectedIds(new Set());
    setTagMode(false);
  }

  function handleToggleTagMode() {
    setTagMode(m => !m);
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  return (
    <div className="min-h-screen bg-wiki-bg text-wiki-text">
      <div className="max-w-[1075px] mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-amber-400">Demonic Pacts League</h1>
            <p className="text-xs text-gray-500">Task Planner</p>
          </div>
          <PlayerControl
            username={state.username}
            playerUpdatedAt={state.playerUpdatedAt}
            onLoad={loadPlayer}
          />
        </div>

        {catalogLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-3 text-amber-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading tasks…
          </div>
        ) : catalogError ? (
          <div className="rounded-lg border border-red-800 bg-red-950/40 p-6 text-center space-y-2">
            <p className="text-red-400 font-semibold">Couldn't reach the server</p>
            <p className="text-red-300/70 text-sm font-mono">{catalogError}</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <ProgressStats tasks={tasks} completedIds={completedIds} />

            {/* Filters */}
            <FilterBar
              filters={filters}
              allRegions={regions}
              pinnedRegions={state.pinnedRegions}
              onChange={setFilters}
              onPinnedRegionsChange={setPinnedRegions}
            />

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                onClick={handleToggleSelectMode}
                className={`px-3 py-1.5 rounded text-xs border transition-colors cursor-pointer ${
                  selectMode
                    ? 'bg-amber-700 border-amber-600 text-white'
                    : 'border-wiki-raised text-wiki-text hover:border-wiki-link'
                }`}
              >
                {selectMode ? `Select mode (${selectedIds.size} selected)` : 'Select tasks'}
              </button>

              <button
                onClick={handleToggleTagMode}
                className={`px-3 py-1.5 rounded text-xs border transition-colors cursor-pointer ${
                  tagMode
                    ? 'bg-teal-800 border-teal-600 text-white'
                    : 'border-wiki-raised text-wiki-text hover:border-wiki-link'
                }`}
              >
                {tagMode ? 'Tag mode' : 'Tag tasks'}
              </button>

              {selectMode && selectedIds.size > 0 && (
                <>
                  <button
                    onClick={handleNewGroup}
                    className="px-3 py-1.5 rounded text-xs bg-wiki-raised border border-wiki-raised text-wiki-text hover:bg-wiki-muted cursor-pointer"
                  >
                    + New group
                  </button>
                  {state.groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleAssignToGroup(g.id)}
                      className="px-3 py-1.5 rounded text-xs bg-wiki-raised border border-wiki-raised text-wiki-text hover:bg-wiki-muted cursor-pointer"
                    >
                      → {g.name}
                    </button>
                  ))}
                </>
              )}

              {!selectMode && !tagMode && (
                <button
                  onClick={handleNewGroup}
                  className="px-3 py-1.5 rounded text-xs border border-dashed border-wiki-raised text-wiki-text hover:border-amber-500 hover:text-amber-400 cursor-pointer"
                >
                  + New group
                </button>
              )}
            </div>

            {/* Groups */}
            {state.groups.map(group => {
              const groupTasks = group.taskIds
                .map(id => taskMap.get(id))
                .filter((t): t is Task => t !== undefined && isTaskVisible(t, filters, completedIds, new Set(), state.taskTags[t.id] ?? []));
              if (groupTasks.length === 0) return null;
              return (
                <GroupSection
                  key={group.id}
                  group={group}
                  tasks={groupTasks}
                  completedIds={completedIds}
                  selectedIds={selectedIds}
                  selectMode={selectMode}
                  tagMode={tagMode}
                  taskTagsMap={state.taskTags}
                  allTags={allTags}
                  onToggleComplete={toggleTask}
                  onToggleSelect={toggleSelect}
                  onToggleCollapse={toggleGroupCollapse}
                  onDelete={deleteGroup}
                  onRename={renameGroup}
                  onAddTag={addTag}
                  onRemoveTag={removeTag}
                />
              );
            })}

            {/* Ungrouped tasks */}
            <div className={`border border-wiki-raised rounded-lg ${tagMode ? 'overflow-visible' : 'overflow-hidden'}`}>
              <div className="px-3 py-2 bg-wiki-raised border-b border-wiki-raised flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">
                  Ungrouped tasks
                </span>
                <span className="text-xs text-gray-600">{visibleUngrouped.length}</span>
              </div>
              <div>
                <TaskTable
                  tasks={visibleUngrouped}
                  completedIds={completedIds}
                  selectedIds={selectedIds}
                  selectMode={selectMode}
                  tagMode={tagMode}
                  taskTagsMap={state.taskTags}
                  allTags={allTags}
                  onToggleComplete={toggleTask}
                  onToggleSelect={toggleSelect}
                  onAddTag={addTag}
                  onRemoveTag={removeTag}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
