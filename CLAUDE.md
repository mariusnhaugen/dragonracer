# OSRS Leagues Planner

A feature-rich task tracker for Old School RuneScape Leagues, currently targeting **Demonic Pacts League**. The official wiki task list has no completion tracking, grouping, or filtering — this app fills that gap.

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (uses `@tailwindcss/vite` plugin, no `tailwind.config.js`)
- **localStorage** for all persistence — no backend
- **MediaWiki API** for live task data

## Architecture

### Data flow

1. `scripts/fetch-tasks.ts` — Node script that hits the OSRS wiki API and writes `src/data/tasks.json` (bundled snapshot). Run with `npm run fetch-tasks`.
2. On load, `App.tsx` uses the bundled JSON unless a fresher copy is in localStorage (`state.cachedTasks`).
3. The **Refresh button** calls `useWikiRefresh` → fetches live wikitext → `parseWikitext` → stores result in `AppState.cachedTasks`.

### Wikitext parsing (`src/lib/parseWikitext.ts`)

Tasks live on `Demonic_Pacts_League/Tasks` as `{{DPLTaskRow|name|description|s=...|tier=...|region=...|id=...}}` templates.

**Critical**: the outer template extractor uses a **brace-counting loop** (not a regex), because a non-greedy regex stops at the first `}}` inside a nested `{{SCP|...}}` — which truncates `tier=` and `id=`, silently dropping ~60% of tasks. The `{{SCP|SkillName|Level|...}}` template is converted to `"SkillName Level"` before generic template stripping.

### State (`src/hooks/useAppState.ts`)

Single `AppState` object persisted to localStorage via `src/lib/storage.ts`:

```ts
interface AppState {
  completedTaskIds: number[];   // task IDs the user has checked off
  groups: TaskGroup[];          // user-defined groups (id, name, taskIds, collapsed)
  pinnedRegions: string[];      // regions shown as filter toggles (default: ['General'])
  cachedTasks?: Task[];         // live-refreshed task list
  cacheTimestamp?: string;      // ISO date of last wiki fetch
}
```

### Key components

| File | Role |
|---|---|
| `App.tsx` | Orchestrates state, filtering, select mode, group assignment |
| `FilterBar.tsx` | Tier pills + pinned region pills + search + Hide Completed. Cog opens a modal to pin/unpin regions (General is always pinned, hidden from modal) |
| `TaskTable.tsx` | `<table>` wrapper with header row |
| `TaskRow.tsx` | `<tr>` — click row to toggle complete; checkbox hidden (invisible, not removed) outside select mode to avoid layout shift |
| `GroupSection.tsx` | Collapsible group header + TaskTable for group tasks |
| `ProgressStats.tsx` | Overall progress bar + per-tier breakdown |
| `RefreshButton.tsx` | Triggers live wiki fetch, shows last-updated timestamp |

## Key decisions

- **Hybrid data**: bundled JSON snapshot + user-triggered live refresh. Avoids cold-start network dependency while keeping data updatable.
- **Groups are user-defined for now**: `TaskGroup.taskIds` is just a list of IDs. Architecture supports future curated JSON (e.g. skill/boss groupings) — just pre-populate groups on first load.
- **Pinned regions**: regions shown in the filter bar are persisted separately from the active filter. The cog modal manages which regions are pinned; clicking pills toggles the active filter. Unpinning a region also clears it from the active filter.
- **Select mode**: a toolbar toggle that switches checkbox behaviour from "mark complete" to "select for group assignment". Checkboxes are invisible (not hidden) outside select mode.
- **Groups hide when empty**: groups with 0 visible tasks after filtering are not rendered.

## Points per tier

Easy: 10 · Medium: 30 · Hard: 80 · Elite: 200 · Master: 400

## npm scripts

```bash
npm run dev          # start dev server
npm run build        # production build
npm run fetch-tasks  # re-fetch tasks.json from the OSRS wiki
```
