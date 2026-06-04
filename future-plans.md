# Future Plans

## In-game task completion sync

The goal is to reduce manual task-checking by pulling completion state directly from the game. Here's what was researched and what the options are.

### WikiSync — not viable for third parties

The OSRS Wiki's WikiSync RuneLite plugin uploads task completion data to Weirdgloop's servers. Their API is explicitly restricted: "Please do not use the WikiSync API in your own projects." They are actively blocking third-party access. Direct piggybacking is a dead end.

### Official Jagex API — no task data

The hiscores API only exposes skill levels and XP. No official Jagex API for Leagues task completion exists.

### Third-party trackers (Wise Old Man, TempleOSRS) — no task data

Both have public REST APIs but only expose skill/XP/hiscore metrics, not individual task completion.

---

## Options

### Option 1 — Export / Import JSON (no backend, ~2 hrs)
Add an Export button that downloads the current `completedTaskIds` as a JSON file, and an Import button (file picker) that restores or merges a saved state. Useful for backing up progress or sharing app state between devices/users.

**Limitation:** purely manual; has nothing to do with actual in-game state.

### Option 2 — Shareable URL (~1 hr, no backend)
Encode `completedTaskIds` into the URL hash (base64 or comma-separated). Anyone with the link loads the exact same completed state. Good for sharing a snapshot.

**Limitation:** one-way; updating requires regenerating the URL.

### Option 3 — RuneLite local HTTP API (same-machine only, moderate effort)
Write a companion RuneLite plugin in Java that exposes a `GET localhost:PORT/leagues-tasks` endpoint returning the player's completed task IDs. The web app queries it when the user clicks "Sync from RuneLite."

**Limitation:** RuneLite and the browser must be on the same machine. No cross-device sync.

### Option 4 — Custom RuneLite plugin + hosted backend (high effort)
Build a RuneLite plugin that pushes task completion to a custom API (e.g. Cloudflare Worker + KV, or a Node service). The web app fetches completion state by RSN. Users opt in once by enabling the plugin.

This is exactly what osrsleaguetracker.com built. Fully automatic, cross-device, shareable by username — but it's a substantial second project (Java plugin + backend + hosting).

---

## Recommendation

Options 1 + 2 are the pragmatic near-term wins — zero infrastructure, implemented in a few hours, cover the cross-device and sharing use cases for users already tracking manually.

Option 4 is the "real" solution for true in-game sync, but it's a different project in scope.
