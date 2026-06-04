import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppState } from '../../src/hooks/useAppState';
import { loadState } from '../../src/lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('toggleTask', () => {
  it('adds a task id to completedTaskIds', () => {
    const { result } = renderHook(() => useAppState());
    act(() => { result.current.toggleTask(42); });
    expect(result.current.state.completedTaskIds).toContain(42);
  });

  it('removes the task id when toggled again', () => {
    const { result } = renderHook(() => useAppState());
    act(() => { result.current.toggleTask(42); });
    act(() => { result.current.toggleTask(42); });
    expect(result.current.state.completedTaskIds).not.toContain(42);
  });
});

describe('createGroup', () => {
  it('creates a group with the given name and returns its id', () => {
    const { result } = renderHook(() => useAppState());
    let id!: string;
    act(() => { id = result.current.createGroup('Bosses'); });
    const group = result.current.state.groups.find(g => g.id === id);
    expect(group).toBeDefined();
    expect(group?.name).toBe('Bosses');
    expect(group?.taskIds).toEqual([]);
    expect(group?.collapsed).toBe(false);
  });
});

describe('deleteGroup', () => {
  it('removes the group, leaving others intact', () => {
    const { result } = renderHook(() => useAppState());
    let id1!: string;
    let id2!: string;
    act(() => { id1 = result.current.createGroup('Group A'); });
    act(() => { id2 = result.current.createGroup('Group B'); });
    act(() => { result.current.deleteGroup(id1); });
    expect(result.current.state.groups.find(g => g.id === id1)).toBeUndefined();
    expect(result.current.state.groups.find(g => g.id === id2)).toBeDefined();
  });
});

describe('renameGroup', () => {
  it('updates only the target group name', () => {
    const { result } = renderHook(() => useAppState());
    let id1!: string;
    let id2!: string;
    act(() => { id1 = result.current.createGroup('Old Name'); });
    act(() => { id2 = result.current.createGroup('Other Group'); });
    act(() => { result.current.renameGroup(id1, 'New Name'); });
    expect(result.current.state.groups.find(g => g.id === id1)?.name).toBe('New Name');
    expect(result.current.state.groups.find(g => g.id === id2)?.name).toBe('Other Group');
  });
});

describe('assignTasksToGroup', () => {
  it('adds task ids to the group', () => {
    const { result } = renderHook(() => useAppState());
    let id!: string;
    act(() => { id = result.current.createGroup('My Group'); });
    act(() => { result.current.assignTasksToGroup(id, [1, 2, 3]); });
    expect(result.current.state.groups.find(g => g.id === id)?.taskIds).toEqual([1, 2, 3]);
  });

  it('deduplicates task ids', () => {
    const { result } = renderHook(() => useAppState());
    let id!: string;
    act(() => { id = result.current.createGroup('My Group'); });
    act(() => { result.current.assignTasksToGroup(id, [1, 2]); });
    act(() => { result.current.assignTasksToGroup(id, [2, 3]); });
    const taskIds = result.current.state.groups.find(g => g.id === id)?.taskIds ?? [];
    expect(taskIds).toContain(1);
    expect(taskIds).toContain(2);
    expect(taskIds).toContain(3);
    expect(taskIds.filter(x => x === 2)).toHaveLength(1);
  });
});

describe('toggleGroupCollapse', () => {
  it('flips the collapsed flag', () => {
    const { result } = renderHook(() => useAppState());
    let id!: string;
    act(() => { id = result.current.createGroup('Collapsible'); });
    expect(result.current.state.groups.find(g => g.id === id)?.collapsed).toBe(false);
    act(() => { result.current.toggleGroupCollapse(id); });
    expect(result.current.state.groups.find(g => g.id === id)?.collapsed).toBe(true);
    act(() => { result.current.toggleGroupCollapse(id); });
    expect(result.current.state.groups.find(g => g.id === id)?.collapsed).toBe(false);
  });
});

describe('setPinnedRegions', () => {
  it('unpinning a region also removes it from the active filter', () => {
    const { result } = renderHook(() => useAppState());
    act(() => { result.current.setFilters({ ...result.current.state.filters, regions: ['General', 'Asgarnia'] }); });
    act(() => { result.current.setPinnedRegions(['General']); }); // unpin Asgarnia
    expect(result.current.state.pinnedRegions).toEqual(['General']);
    expect(result.current.state.filters.regions).not.toContain('Asgarnia');
    expect(result.current.state.filters.regions).toContain('General');
  });

  it('pinning a new region does not change the active filter', () => {
    const { result } = renderHook(() => useAppState());
    const regionsBefore = result.current.state.filters.regions;
    act(() => { result.current.setPinnedRegions(['General', 'Asgarnia']); });
    expect(result.current.state.filters.regions).toEqual(regionsBefore);
  });
});

describe('localStorage persistence', () => {
  it('persists state changes to localStorage', async () => {
    const { result } = renderHook(() => useAppState());
    act(() => { result.current.toggleTask(7); });
    // Wait for the useEffect to flush
    await act(async () => {});
    const persisted = loadState();
    expect(persisted.completedTaskIds).toContain(7);
  });
});
