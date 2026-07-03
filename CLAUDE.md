# DragonRacer Client

Web UI for **DragonRacer**, a task tracker for OSRS Leagues (currently **Demonic Pacts League**). This repo is the React client only; a separate DragonRacer server serves the task catalog and player data, fed by a companion RuneLite plugin that syncs in-game task completion.

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (uses `@tailwindcss/vite` plugin, no `tailwind.config.js`; design tokens in `src/index.css`, documented in `design-system.md`)
- **localStorage** for client-side persistence
- **Vitest + Testing Library + MSW** for tests (in `test/`, mocks in `src/mocks/`)

## Architecture

### Server API (`src/lib/serverApi.ts`)

Base URL comes from `VITE_API_BASE` (`.env.local`, see `.env.local.example`). Two endpoints:

- `GET /tasks` — full task catalog. Cached in localStorage with ETag revalidation (`If-None-Match` → 304 returns the cached copy). Consumed via `useCatalog`.
- `GET /player/:username` — `PlayerResponse` (username, updatedAt, skillLevels, completedTaskIds) synced from the RuneLite plugin. 404 → `null` (player unknown).

### State (`src/hooks/useAppState.ts`)

Single `AppState` object persisted to localStorage via `src/lib/storage.ts`:

```ts
interface AppState {
  completedTaskIds: number[];   // checked-off tasks (manual or loaded from server)
  groups: TaskGroup[];          // user-defined groups (id, name, taskIds, collapsed)
  pinnedRegions: string[];      // regions shown as filter toggles (default: ['General'])
  filters: Filters;             // tiers, regions, search, hideCompleted
  taskTags: Record<number, string[]>;  // user-defined per-task tags
  username?: string;            // last-loaded player
  playerUpdatedAt?: string;
  skillLevels?: Record<string, number>;
}
```

`loadPlayer` replaces `completedTaskIds` (and username/skills) with the server's state for the looked-up player.

### Key components

| File | Role |
|---|---|
| `App.tsx` | Orchestrates state, filtering, select mode, tag mode, group assignment |
| `FilterBar.tsx` | Tier pills + pinned region pills + search + Hide Completed. Cog opens a modal to pin/unpin regions (General is always pinned, hidden from modal) |
| `PlayerControl.tsx` | Username lookup → `fetchPlayer` → `loadPlayer`; shows last-synced timestamp |
| `TaskTable.tsx` | `<table>` wrapper with header row |
| `TaskRow.tsx` | `<tr>` — click row to toggle complete; checkbox hidden (invisible, not removed) outside select mode to avoid layout shift |
| `GroupSection.tsx` | Collapsible group header + TaskTable for group tasks |
| `ProgressStats.tsx` | Overall progress bar + per-tier breakdown |

## Key decisions

- **Server-backed catalog**: the client no longer scrapes the wiki itself; the server owns task data. The ETag/localStorage cache keeps the app usable across reloads without refetching.
- **Groups are user-defined for now**: `TaskGroup.taskIds` is just a list of IDs. Architecture supports future curated JSON (e.g. skill/boss groupings) — just pre-populate groups on first load.
- **Pinned regions**: regions shown in the filter bar are persisted separately from the active filter. The cog modal manages which regions are pinned; clicking pills toggles the active filter. Unpinning a region also clears it from the active filter.
- **Select mode**: a toolbar toggle that switches checkbox behaviour from "mark complete" to "select for group assignment". Checkboxes are invisible (not hidden) outside select mode.
- **Groups hide when empty**: groups with 0 visible tasks after filtering are not rendered.
- **Grouped tasks are excluded from the ungrouped table** (`isTaskVisible` filters them out).

## Points per tier

Easy: 10 · Medium: 30 · Hard: 80 · Elite: 200 · Master: 400

## npm scripts

```bash
npm run dev            # start dev server
npm run build          # type-check + production build
npm run lint           # eslint
npm test               # run tests once (CI runs this on push/PR to main)
npm run test:watch     # vitest watch mode
npm run test:coverage  # coverage report
```

`scripts/fetch-icons.ts` re-downloads region/tier icons from the wiki into `public/region-icons/` (rarely needed).

## Testing notes

- `test/setup.ts` starts the MSW server (`src/mocks/server.ts`, handlers in `src/mocks/handlers.ts`) with `onUnhandledRequest: 'error'`, and clears localStorage after each test.
- `.env.test` sets `VITE_API_BASE=http://localhost:8080` so `serverApi` resolves during tests; MSW intercepts the requests.
