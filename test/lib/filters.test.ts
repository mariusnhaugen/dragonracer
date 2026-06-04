import { describe, it, expect } from 'vitest';
import { isTaskVisible, DEFAULT_FILTERS } from '../../src/lib/filters';
import type { Task, Filters } from '../../src/types';

const task: Task = {
  id: 1,
  name: 'Mine some ore',
  description: 'Get 50 iron ore from the mines',
  tier: 'easy',
  region: 'Asgarnia',
};

const noCompleted = new Set<number>();
const noGroups = new Set<number>();

describe('isTaskVisible — tags', () => {
  it('includes task when search matches a tag', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'hunter' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups, ['hunter', 'combat'])).toBe(true);
  });

  it('excludes task when search matches neither name, description, nor tags', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'dragon' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups, ['hunter'])).toBe(false);
  });

  it('tag matching is case-insensitive (tags stored lowercase, query lowercased)', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'HUNTER' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups, ['hunter'])).toBe(true);
  });

  it('includes task with no tags when search matches name', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'mine' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups, [])).toBe(true);
  });
});

describe('isTaskVisible — grouping', () => {
  it('excludes task when it is in groupedTaskIds', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'] };
    expect(isTaskVisible(task, filters, noCompleted, new Set([1]))).toBe(false);
  });

  it('includes task when it is not in groupedTaskIds', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'] };
    expect(isTaskVisible(task, filters, noCompleted, new Set([2, 3]))).toBe(true);
  });

  it('includes task when groupedTaskIds is omitted', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'] };
    expect(isTaskVisible(task, filters, noCompleted)).toBe(true);
  });
});

describe('isTaskVisible — region', () => {
  it('excludes task when regions is empty', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: [] };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(false);
  });

  it('includes task when region matches', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'] };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });

  it('excludes task when region does not match', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Desert'] };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(false);
  });

  it('includes task when its region is one of multiple selected', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Desert', 'Asgarnia'] };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });
});

describe('isTaskVisible — tier', () => {
  it('includes all tiers when tiers filter is empty', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], tiers: [] };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });

  it('includes task when tier matches', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], tiers: ['easy'] };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });

  it('excludes task when tier does not match', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], tiers: ['hard'] };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(false);
  });
});

describe('isTaskVisible — search', () => {
  it('includes task when search matches name', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'mine' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });

  it('includes task when search matches description', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'iron ore' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });

  it('search is case-insensitive', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'MINE' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });

  it('excludes task when search matches neither name nor description', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: 'dragon' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(false);
  });

  it('includes all tasks when search is empty', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], search: '' };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });
});

describe('isTaskVisible — hideCompleted', () => {
  it('excludes completed task when hideCompleted is true', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], hideCompleted: true };
    expect(isTaskVisible(task, filters, new Set([1]), noGroups)).toBe(false);
  });

  it('includes completed task when hideCompleted is false', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], hideCompleted: false };
    expect(isTaskVisible(task, filters, new Set([1]), noGroups)).toBe(true);
  });

  it('includes incomplete task regardless of hideCompleted', () => {
    const filters: Filters = { ...DEFAULT_FILTERS, regions: ['Asgarnia'], hideCompleted: true };
    expect(isTaskVisible(task, filters, noCompleted, noGroups)).toBe(true);
  });
});
