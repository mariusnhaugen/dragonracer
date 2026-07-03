# DragonRacer Client

Web UI for **DragonRacer** — a task tracker for Old School RuneScape Leagues (currently targeting **Demonic Pacts League**). The official wiki task list has no completion tracking, grouping, or filtering; DragonRacer fills that gap, with in-game completion synced automatically via a companion RuneLite plugin and server.

This repo is the React client. It talks to the DragonRacer server, which receives task-completion data from the RuneLite plugin.

## Features

- Full task catalog with tier, region, and points, fetched from the server (ETag-cached)
- Player lookup by OSRS username — pulls completed tasks and skill levels synced from in-game
- Manual completion toggling, tier/region/search filters, hide-completed
- User-defined task groups and per-task tags
- Progress stats: overall points bar plus per-tier breakdown
- All local UI state persisted to localStorage

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Vitest + Testing Library + MSW for tests

## Getting started

```bash
cp .env.local.example .env.local   # set VITE_API_BASE to your DragonRacer server
npm install
npm run dev
```

## Scripts

```bash
npm run dev            # start dev server
npm run build          # type-check + production build
npm run lint           # eslint
npm test               # run test suite once
npm run test:watch     # vitest watch mode
npm run test:coverage  # coverage report
```

Tests run in CI on every push/PR to `main` (`.github/workflows/run_tests.yml`).
