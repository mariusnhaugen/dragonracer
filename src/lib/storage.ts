import type { AppState } from '../types';
import { DEFAULT_FILTERS } from './filters';

const KEY = 'leagues-planner-state';

const DEFAULT_STATE: AppState = {
  completedTaskIds: [],
  groups: [],
  pinnedRegions: ['General'],
  filters: DEFAULT_FILTERS,
  taskTags: {},
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}
