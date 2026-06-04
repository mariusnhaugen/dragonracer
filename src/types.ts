export type Tier = 'easy' | 'medium' | 'hard' | 'elite' | 'master';

export interface Task {
  id: number;
  name: string;
  description: string;
  tier: Tier;
  region: string;
  requirements?: string;
  pactTask?: boolean;
}

export interface TaskGroup {
  id: string;
  name: string;
  taskIds: number[];
  collapsed: boolean;
}

export interface AppState {
  completedTaskIds: number[];
  groups: TaskGroup[];
  pinnedRegions: string[];
  filters: Filters;
  taskTags: Record<number, string[]>;
  username?: string;
  playerUpdatedAt?: string;
  skillLevels?: Record<string, number>;
}

export interface Filters {
  tiers: Tier[];
  regions: string[];
  search: string;
  hideCompleted: boolean;
}
