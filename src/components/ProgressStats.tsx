import type { Task, Tier } from '../types';

const TIER_POINTS: Record<Tier, number> = {
  easy: 10,
  medium: 30,
  hard: 80,
  elite: 200,
  master: 400,
};

const TIER_COLORS: Record<Tier, string> = {
  easy: 'text-stone-400',
  medium: 'text-gray-400',
  hard: 'text-green-700',
  elite: 'text-sky-400',
  master: 'text-red-400',
};

const TIERS: Tier[] = ['easy', 'medium', 'hard', 'elite', 'master'];

interface Props {
  tasks: Task[];
  completedIds: Set<number>;
}

export function ProgressStats({ tasks, completedIds }: Props) {
  const totalPoints = tasks.reduce((sum, t) => sum + TIER_POINTS[t.tier], 0);
  const earnedPoints = tasks.filter(t => completedIds.has(t.id)).reduce((sum, t) => sum + TIER_POINTS[t.tier], 0);
  const totalCompleted = tasks.filter(t => completedIds.has(t.id)).length;
  const pct = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  return (
    <div className="bg-wiki-surface border border-wiki-raised rounded-lg p-3 space-y-3">
      <div>
        <div className="flex justify-between text-sm text-wiki-text mb-1">
          <span>{totalCompleted}/{tasks.length} tasks ({pct}%)</span>
          <span className="text-amber-400">{earnedPoints.toLocaleString()} / {totalPoints.toLocaleString()} pts</span>
        </div>
        <div className="h-2 bg-wiki-raised rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 text-xs">
        {TIERS.map(tier => {
          const tierTasks = tasks.filter(t => t.tier === tier);
          const done = tierTasks.filter(t => completedIds.has(t.id)).length;
          return (
            <div key={tier} className="text-center">
              <div className={`capitalize font-medium ${TIER_COLORS[tier]}`}>{tier}</div>
              <div className="text-gray-400">{done}/{tierTasks.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
