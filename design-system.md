# Design System — DragonRacer Client

Dark-themed UI modelled on the OSRS wiki's colour palette. Built with Tailwind CSS v4.

Custom tokens are defined in `src/index.css` under `@theme` and used as standard Tailwind utilities (`bg-wiki-surface`, `text-wiki-text`, etc.).

---

## Wiki palette tokens

| Token | Hex | Role |
|---|---|---|
| `wiki-bg` | `#14172a` | Page background |
| `wiki-surface` | `#1e2335` | Cards, panels, filter bar, modals |
| `wiki-muted` | `#222840` | Completed rows, darker surface |
| `wiki-hover` | `#272d4b` | Row hover state |
| `wiki-raised` | `#2a3045` | Section headers, buttons, borders, table header |
| `wiki-blue` | `#8CABE6` | Accent — requirements text, region pills, focus rings |
| `wiki-text` | `#c8c8c8` | Primary text |
| `wiki-link` | `#4a9eca` | Interactive highlight (button hover borders) |

---

## Background layers (light → dark)

```
wiki-raised   #2a3045   headers, buttons
wiki-hover    #272d4b   row hover
wiki-muted    #222840   completed rows
wiki-surface  #1e2335   cards / panels
wiki-bg       #14172a   page shell
```

---

## Text

| Role | Class | Notes |
|---|---|---|
| Primary | `text-wiki-text` | Body copy, task names |
| Secondary | `text-gray-400` | Labels, subtitles, counts |
| Muted | `text-gray-500` | Disabled, de-emphasised |
| Accent (gold) | `text-amber-400` | Headings, points, highlights |
| Accent (blue) | `text-wiki-blue` | Requirements column |
| Completed / dim | `text-gray-500` | Struck-through / faded task name |

---

## Borders

| Role | Class |
|---|---|
| Default dividers | `border-wiki-raised` |
| Row dividers | `divide-wiki-raised` |
| Focus ring | `focus:border-wiki-blue` |
| Amber accent | `border-amber-500` / `border-amber-600` |

---

## Tier colors

Points: Easy 10 · Medium 30 · Hard 80 · Elite 200 · Master 400

| Tier | Stats label | Active pill | Inactive pill | Badge chip |
|---|---|---|---|---|
| Easy | `text-stone-400` | `bg-stone-600 text-white` | `border-stone-600 text-stone-400` | `bg-stone-700 text-stone-200` |
| Medium | `text-gray-400` | `bg-gray-500 text-white` | `border-gray-500 text-gray-400` | `bg-gray-600 text-gray-200` |
| Hard | `text-green-700` | `bg-green-900 text-white` | `border-green-900 text-green-700` | `bg-green-900 text-green-200` |
| Elite | `text-sky-400` | `bg-sky-600 text-white` | `border-sky-600 text-sky-400` | `bg-sky-700 text-sky-200` |
| Master | `text-red-400` | `bg-red-600 text-white` | `border-red-600 text-red-400` | `bg-red-800 text-red-200` |

---

## Region pills

| State | Class |
|---|---|
| Active | `bg-wiki-blue text-wiki-bg` |
| Inactive | `border border-wiki-blue/50 text-wiki-blue hover:border-wiki-blue` |

---

## Table rows

| State | Class |
|---|---|
| Default | `bg-wiki-surface` |
| Hover | `hover:bg-wiki-hover` |
| Completed | `bg-wiki-muted` |
| Selected | `bg-amber-900/30` |
| Header | `bg-wiki-raised text-wiki-text` |

---

## Interactive

| Role | Class |
|---|---|
| Button (raised) | `bg-wiki-raised border-wiki-raised text-wiki-text hover:bg-wiki-muted` |
| Button (outline) | `border-wiki-raised text-wiki-text hover:border-wiki-link` |
| Button (select active) | `bg-amber-700 border-amber-600 text-white` |
| Search input | `bg-wiki-raised border-wiki-raised text-wiki-text focus:border-wiki-blue` |
| Checkbox accent | `accent-wiki-blue` |

---

## Notes

- Tailwind v4: no `tailwind.config.js`. All custom tokens live in `src/index.css` under `@theme`.
- `wiki-*` tokens are the single source of truth — change a hex there and it propagates everywhere.
- Standard Tailwind grays (`gray-400`, `gray-500`, `stone-*`, `sky-*`, etc.) are used freely alongside the wiki tokens.
