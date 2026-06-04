import { useState, useCallback, useEffect } from 'react';
import type { AppState, TaskGroup } from '../types';
import type { PlayerResponse } from '../lib/serverApi';
import { loadState, saveState } from '../lib/storage';

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleTask = useCallback((id: number) => {
    setState(s => {
      const set = new Set(s.completedTaskIds);
      if (set.has(id)) set.delete(id); else set.add(id);
      return { ...s, completedTaskIds: Array.from(set) };
    });
  }, []);

  const createGroup = useCallback((name: string) => {
    const group: TaskGroup = {
      id: crypto.randomUUID(),
      name,
      taskIds: [],
      collapsed: false,
    };
    setState(s => ({ ...s, groups: [...s.groups, group] }));
    return group.id;
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setState(s => ({ ...s, groups: s.groups.filter(g => g.id !== groupId) }));
  }, []);

  const renameGroup = useCallback((groupId: string, name: string) => {
    setState(s => ({
      ...s,
      groups: s.groups.map(g => g.id === groupId ? { ...g, name } : g),
    }));
  }, []);

  const assignTasksToGroup = useCallback((groupId: string, taskIds: number[]) => {
    setState(s => ({
      ...s,
      groups: s.groups.map(g => {
        if (g.id !== groupId) return g;
        const merged = Array.from(new Set([...g.taskIds, ...taskIds]));
        return { ...g, taskIds: merged };
      }),
    }));
  }, []);

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setState(s => ({
      ...s,
      groups: s.groups.map(g => g.id === groupId ? { ...g, collapsed: !g.collapsed } : g),
    }));
  }, []);

  const setFilters = useCallback((filters: import('../types').Filters) => {
    setState(s => ({ ...s, filters }));
  }, []);

  const setPinnedRegions = useCallback((regions: string[]) => {
    setState(s => ({
      ...s,
      pinnedRegions: regions,
      filters: { ...s.filters, regions: s.filters.regions.filter(r => regions.includes(r)) },
    }));
  }, []);

  const addTag = useCallback((taskId: number, tag: string) => {
    setState(s => {
      const existing = s.taskTags[taskId] ?? [];
      if (existing.includes(tag)) return s;
      return { ...s, taskTags: { ...s.taskTags, [taskId]: [...existing, tag] } };
    });
  }, []);

  const removeTag = useCallback((taskId: number, tag: string) => {
    setState(s => ({
      ...s,
      taskTags: { ...s.taskTags, [taskId]: (s.taskTags[taskId] ?? []).filter(t => t !== tag) },
    }));
  }, []);

  const loadPlayer = useCallback((player: PlayerResponse) => {
    setState(s => ({
      ...s,
      completedTaskIds: player.completedTaskIds,
      username: player.username,
      playerUpdatedAt: player.updatedAt,
      skillLevels: player.skillLevels,
    }));
  }, []);

  return {
    state,
    toggleTask,
    createGroup,
    deleteGroup,
    renameGroup,
    assignTasksToGroup,
    toggleGroupCollapse,
    setFilters,
    setPinnedRegions,
    addTag,
    removeTag,
    loadPlayer,
  };
}
