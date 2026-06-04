import { useState, useRef } from 'react';
import type { Task, Tier } from '../types';
import { REGION_ICON, TIER_ICON } from '../lib/regionIcons';

const TIER_BADGE: Record<Tier, string> = {
  easy: 'bg-stone-700 text-stone-200',
  medium: 'bg-gray-600 text-gray-200',
  hard: 'bg-green-900 text-green-200',
  elite: 'bg-sky-700 text-sky-200',
  master: 'bg-red-800 text-red-200',
};

const TIER_POINTS: Record<Tier, number> = {
  easy: 10,
  medium: 30,
  hard: 80,
  elite: 200,
  master: 400,
};

interface Props {
  task: Task;
  completed: boolean;
  selected: boolean;
  selectMode: boolean;
  tagMode: boolean;
  tags: string[];
  allTags: string[];
  onToggleComplete: (id: number) => void;
  onToggleSelect: (id: number) => void;
  onAddTag: (taskId: number, tag: string) => void;
  onRemoveTag: (taskId: number, tag: string) => void;
}

export function TaskRow({
  task, completed, selected, selectMode,
  tagMode, tags, allTags,
  onToggleComplete, onToggleSelect, onAddTag, onRemoveTag,
}: Props) {
  const [inputOpen, setInputOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const rowBg = selected ? 'bg-amber-900/30' : completed ? 'bg-wiki-muted' : 'bg-wiki-surface hover:bg-wiki-hover';

  const suggestions = inputOpen
    ? allTags.filter(t => !tags.includes(t) && (inputValue.trim() === '' || t.includes(inputValue.toLowerCase())))
    : [];

  function handleRowClick() {
    if (tagMode) {
      setInputOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (selectMode) {
      onToggleSelect(task.id);
    } else {
      onToggleComplete(task.id);
    }
  }

  function commitTag(tag: string) {
    const normalised = tag.trim().toLowerCase();
    if (normalised) onAddTag(task.id, normalised);
    setInputValue('');
    setFocusedIndex(-1);
    setInputOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commitTag(focusedIndex >= 0 ? suggestions[focusedIndex] : inputValue);
    } else if (e.key === 'Escape') {
      setInputValue('');
      setFocusedIndex(-1);
      setInputOpen(false);
    }
  }

  function handleBlur() {
    // Small delay so mousedown on a suggestion fires before blur closes the dropdown
    setTimeout(() => {
      setInputValue('');
      setFocusedIndex(-1);
      setInputOpen(false);
    }, 150);
  }

  return (
    <tr
      className={`transition-colors cursor-pointer ${rowBg}`}
      onClick={handleRowClick}
    >
      <td className="w-8 px-3 py-2 text-center align-top">
        {/* Invisible in normal mode to preserve column width */}
        <input
          type="checkbox"
          checked={selectMode ? selected : completed}
          readOnly
          className={`accent-amber-500 w-4 h-4 pointer-events-none ${selectMode ? 'visible' : 'invisible'}`}
        />
      </td>
      <td className="w-10 px-2 py-2 text-gray-400 align-top">
        <span className="flex items-center justify-center">
          {REGION_ICON[task.region] && (
            <img src={REGION_ICON[task.region]} alt={task.region} title={task.region} className="w-4 h-4 shrink-0 object-contain" />
          )}
        </span>
      </td>
      <td className="w-44 px-2 py-2 align-top">
        <span className={`font-medium leading-snug ${completed && !selectMode ? 'text-gray-500' : 'text-wiki-text'}`}>
          {task.name}
        </span>
        {tagMode && (
          <div className="mt-1.5" onClick={e => e.stopPropagation()}>
            {/* Existing tag pills */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 pl-2.5 pr-1.5 py-0.5 rounded-full bg-wiki-raised border border-wiki-blue/50 text-wiki-text text-xs"
                  >
                    {tag}
                    <button
                      onMouseDown={e => { e.preventDefault(); onRemoveTag(task.id, tag); }}
                      className="ml-0.5 text-gray-500 hover:text-red-400 leading-none cursor-pointer"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Input (shown on click) */}
            {inputOpen && (
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => { setInputValue(e.target.value); setFocusedIndex(-1); }}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  placeholder="Add tag…"
                  className="w-full px-2 py-0.5 rounded bg-wiki-raised border border-wiki-raised text-wiki-text placeholder-gray-500 text-xs outline-none focus:border-wiki-blue"
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 top-full left-0 mt-0.5 w-full bg-wiki-surface border border-wiki-raised rounded shadow-lg max-h-32 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <li
                        key={s}
                        onMouseDown={() => commitTag(s)}
                        className={`px-2 py-1 text-wiki-text cursor-pointer ${i === focusedIndex ? 'bg-wiki-raised' : 'hover:bg-wiki-raised'}`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </td>
      <td className="px-2 py-2 align-top leading-snug">
        <span className={completed && !selectMode ? 'line-through text-gray-500' : 'text-gray-400'}>
          {task.description}
        </span>
      </td>
      <td className="w-44 px-2 py-2 text-wiki-blue align-top leading-snug">{task.requirements ?? '—'}</td>
      <td className="w-24 px-2 py-2 align-top">
        <div className="flex items-center justify-end gap-1.5">
          {TIER_ICON[task.tier]
            ? <img src={TIER_ICON[task.tier]} alt={task.tier} title={task.tier} className="w-4 h-4 object-contain" />
            : <span className={`px-1 py-0.5 rounded capitalize text-xs leading-none ${TIER_BADGE[task.tier]}`}>{task.tier}</span>
          }
          <span className="text-gray-300 tabular-nums">{TIER_POINTS[task.tier]}</span>
        </div>
      </td>
    </tr>
  );
}
