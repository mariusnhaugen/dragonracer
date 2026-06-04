import type { Filters, Task } from '../types';

export const DEFAULT_FILTERS: Filters = { tiers: [], regions: ['General'], search: '', hideCompleted: false };

export function isTaskVisible(
  task: Task,
  filters: Filters,
  completedIds: Set<number>,
  groupedTaskIds: Set<number> = new Set(),
  tags: string[] = [],
): boolean {
  if (groupedTaskIds.has(task.id)) return false;
  if (filters.hideCompleted && completedIds.has(task.id)) return false;
  if (filters.tiers.length > 0 && !filters.tiers.includes(task.tier)) return false;
  if (!filters.regions.includes(task.region)) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const matchesName = task.name.toLowerCase().includes(q);
    const matchesDesc = task.description.toLowerCase().includes(q);
    const matchesTag = tags.some(t => t.includes(q));
    if (!matchesName && !matchesDesc && !matchesTag) return false;
  }
  return true;
}
