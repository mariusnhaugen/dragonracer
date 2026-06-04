import { describe, it, expect, beforeEach } from 'vitest';
import { loadState, saveState } from '../../src/lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('loadState', () => {
  it('returns DEFAULT_STATE when localStorage is empty', () => {
    const state = loadState();
    expect(state.completedTaskIds).toEqual([]);
    expect(state.groups).toEqual([]);
    expect(state.pinnedRegions).toEqual(['General']);
    expect(state.filters).toBeDefined();
    expect(state.filters.regions).toEqual(['General']);
  });

  it('returns saved state when present', () => {
    const saved = { completedTaskIds: [1, 2], groups: [], pinnedRegions: ['General', 'Asgarnia'] };
    localStorage.setItem('leagues-planner-state', JSON.stringify(saved));
    const state = loadState();
    expect(state.completedTaskIds).toEqual([1, 2]);
    expect(state.pinnedRegions).toEqual(['General', 'Asgarnia']);
  });

  it('merges partial state with defaults', () => {
    localStorage.setItem('leagues-planner-state', JSON.stringify({ completedTaskIds: [5] }));
    const state = loadState();
    expect(state.completedTaskIds).toEqual([5]);
    expect(state.groups).toEqual([]);
    expect(state.pinnedRegions).toEqual(['General']);
  });

  it('returns DEFAULT_STATE on malformed JSON without throwing', () => {
    localStorage.setItem('leagues-planner-state', 'not valid json{{{');
    expect(() => loadState()).not.toThrow();
    const state = loadState();
    expect(state.completedTaskIds).toEqual([]);
  });
});

describe('saveState + loadState round-trip', () => {
  it('persists and restores state faithfully', () => {
    const original = {
      completedTaskIds: [10, 20, 30],
      groups: [{ id: 'abc', name: 'My Group', taskIds: [10], collapsed: false }],
      pinnedRegions: ['General', 'Desert'],
    };
    saveState(original as Parameters<typeof saveState>[0]);
    const restored = loadState();
    expect(restored.completedTaskIds).toEqual(original.completedTaskIds);
    expect(restored.groups).toEqual(original.groups);
    expect(restored.pinnedRegions).toEqual(original.pinnedRegions);
  });
});
