import { useState } from 'react';
import type { Filters, Tier } from '../types';
import { REGION_ICON, TIER_ICON } from '../lib/regionIcons';

const TIERS: Tier[] = ['easy', 'medium', 'hard', 'elite', 'master'];

const TIER_COLORS: Record<Tier, string> = {
  easy: 'bg-stone-600 text-white',
  medium: 'bg-gray-500 text-white',
  hard: 'bg-green-900 text-white',
  elite: 'bg-sky-600 text-white',
  master: 'bg-red-600 text-white',
};

const TIER_INACTIVE: Record<Tier, string> = {
  easy: 'border border-stone-600 text-stone-400',
  medium: 'border border-gray-500 text-gray-400',
  hard: 'border border-green-900 text-green-700',
  elite: 'border border-sky-600 text-sky-400',
  master: 'border border-red-600 text-red-400',
};

interface Props {
  filters: Filters;
  allRegions: string[];
  pinnedRegions: string[];
  onChange: (filters: Filters) => void;
  onPinnedRegionsChange: (regions: string[]) => void;
}

export function FilterBar({ filters, allRegions, pinnedRegions, onChange, onPinnedRegionsChange }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  function toggleTier(tier: Tier) {
    const active = filters.tiers.includes(tier);
    onChange({
      ...filters,
      tiers: active ? filters.tiers.filter(t => t !== tier) : [...filters.tiers, tier],
    });
  }

  function toggleRegionFilter(region: string) {
    const active = filters.regions.includes(region);
    onChange({
      ...filters,
      regions: active ? filters.regions.filter(r => r !== region) : [...filters.regions, region],
    });
  }

  function togglePinnedRegion(region: string) {
    const pinned = pinnedRegions.includes(region);
    const next = pinned ? pinnedRegions.filter(r => r !== region) : [...pinnedRegions, region];
    onPinnedRegionsChange(next);
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-3 bg-wiki-surface border border-wiki-raised rounded-lg">
        {/* Tier row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 shrink-0">Tier:</span>
          {TIERS.map(tier => (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${
                filters.tiers.includes(tier) ? TIER_COLORS[tier] : TIER_INACTIVE[tier]
              }`}
            >
              {TIER_ICON[tier] && (
                <img src={TIER_ICON[tier]} alt="" aria-hidden="true" className="w-3.5 h-3.5 object-contain shrink-0" />
              )}
              {tier}
            </button>
          ))}
          {filters.tiers.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, tiers: [] })}
              className="text-xs text-gray-500 hover:text-gray-300 ml-1 cursor-pointer"
            >
              clear
            </button>
          )}
        </div>

        {/* Region row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 shrink-0">Region:</span>
          {pinnedRegions.length === 0 ? (
            <span className="text-xs text-gray-600 italic">no regions pinned</span>
          ) : (
            pinnedRegions.map(region => (
              <button
                key={region}
                onClick={() => toggleRegionFilter(region)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filters.regions.includes(region)
                    ? 'bg-wiki-blue text-wiki-bg'
                    : 'border border-wiki-blue/50 text-wiki-blue hover:border-wiki-blue'
                }`}
              >
                {REGION_ICON[region] && (
                  <img src={REGION_ICON[region]} alt="" aria-hidden="true" className="w-3.5 h-3.5 object-contain shrink-0" />
                )}
                {region}
              </button>
            ))
          )}
          {filters.regions.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, regions: [] })}
              className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
            >
              clear
            </button>
          )}
          <button
            onClick={() => setSettingsOpen(true)}
            className="ml-auto text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            title="Pin regions to filter bar"
            aria-label="Open region settings"
          >
            ⚙
          </button>
        </div>

        {/* Search + Hide Completed */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            className="flex-1 bg-wiki-raised border border-wiki-raised rounded px-3 py-1.5 text-sm text-wiki-text placeholder-gray-500 focus:outline-none focus:border-wiki-blue"
          />
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={filters.hideCompleted}
              onChange={e => onChange({ ...filters, hideCompleted: e.target.checked })}
              className="accent-wiki-blue w-4 h-4 cursor-pointer"
            />
            Hide Completed
          </label>
        </div>
      </div>

      {/* Region settings modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="bg-wiki-surface border border-wiki-raised rounded-lg p-5 w-80 max-h-[70vh] flex flex-col gap-4 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-200">Pin regions</h2>
                <p className="text-xs text-gray-500 mt-0.5">Pinned regions appear as filter toggles.</p>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-gray-500 hover:text-gray-300 text-lg leading-none cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={() => onPinnedRegionsChange([...allRegions])}
                className="text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                Pin all
              </button>
              <span className="text-gray-600">·</span>
              <button
                onClick={() => {
                  onPinnedRegionsChange([]);
                  onChange({ ...filters, regions: [] });
                }}
                className="text-gray-400 hover:text-gray-300 cursor-pointer"
              >
                Unpin all
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-1">
              {allRegions.filter(r => r !== 'General').map(region => (
                <label
                  key={region}
                  className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-wiki-raised cursor-pointer text-sm text-wiki-text"
                >
                  <input
                    type="checkbox"
                    checked={pinnedRegions.includes(region)}
                    onChange={() => togglePinnedRegion(region)}
                    className="accent-amber-500 w-4 h-4 cursor-pointer shrink-0"
                  />
                  {REGION_ICON[region] && (
                    <img src={REGION_ICON[region]} alt="" aria-hidden="true" className="w-4 h-4 object-contain shrink-0" />
                  )}
                  {region}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
