# Touchstone

Open-source **relevance annotation** tool for building *golden sets* to evaluate RAG systems.
Touchstone is **backend-agnostic**: it contains no retriever, it speaks an HTTP contract
(`POST /retrieve`) that any search system can implement.

Guiding principle: **recognition, not recall** — the annotator doesn't guess the right
passages from memory, they *tick* among a list of candidates returned by the backend.
Local-first, append-only, resumable.

> Single-page front-end prototype (React + Vite). Data is in-memory samples and `/retrieve`
> calls are simulated.

## Getting started

```bash
npm install
npm run dev        # dev server (HMR)  → http://localhost:5173
```

## Production build

```bash
npm run build      # outputs dist/
npm run preview    # serve the production build
```

## Stack

- **React 18** + **Vite** (dev server + build).
- **react-router-dom** — one URL per screen (the URL owns the current screen).
- **Zustand** (+ `persist`) — single store (`src/state/useStore.js`): session state + actions,
  persisted to `localStorage` so the session is resumable (see Persistence).
- **react-i18next** — UI internationalization; English is the source locale, French is
  a second locale, switchable from the sidebar.
- **CSS Modules** — one `.module.css` per component; light/dark theme via CSS custom
  properties applied on the root.
- **No UI dependency**: icons are small inline SVGs, typography is IBM Plex Sans / Mono.

## Routes

Each screen has its own URL (deep-linkable, refresh-safe, browser back/forward works):

| Path | Screen |
|------|--------|
| `/setup` | Setup (`/` redirects here; unknown paths too) |
| `/annotate` | Annotate |
| `/golden-set` | Golden set (Overview) |
| `/export` | Export |
| `/contract` | Contract / YAML |

The URL is the source of truth for the current screen; the store keeps the rest (questions,
current index, …). Screen-changing actions navigate from the components (e.g. finishing the
last question routes to `/golden-set`). Uses the HTML5 history API (`BrowserRouter`) — Vite's
dev/preview servers fall back to `index.html`; a static host needs the usual SPA rewrite.

## Importing questions

On the Setup screen, **Import questions** accepts:

- **`.json`** — an array of objects `[{ "question", "lang"?, "type"? }, …]` (also accepts a
  plain array of strings, or an object with a top-level `questions` array).
- **`.txt`** — one question per line.

Parsing lives in `src/lib/parseQuestions.js` (pure, lenient). Imported questions keep their
`lang` and `type` (preserved in the data model and round-tripped in the JSONL export) and
receive simulated candidates — there is no real backend in the prototype.

**Importing replaces the current question set** (a fresh golden set) and resets the annotation
cursor. Use **+ Add** to append a single question on the fly instead.

## Persistence (resumable session)

The store is a single global Zustand store, so all screens read the same data live. Durable
state — imported/added questions, annotations, declared backends, `k`, threshold and
preferences (theme, view, density) — is persisted to `localStorage` via Zustand's `persist`
middleware (`partialize` keeps transient UI and the action functions out). This makes the
session **resumable**: reloading the page or opening a screen's URL directly keeps your work
(without persistence, the in-memory store would reset to the seed on every reload). The chosen
UI language is persisted too (`src/i18n/index.js`).

To start fresh, clear the site's `localStorage` (keys `touchstone-session` and
`touchstone-lang`).

## Internationalization (i18n)

UI strings live in `src/i18n/locales/{en,fr}.json` and are consumed with `useTranslation()`
(`t('key')`) or `<Trans>` for strings that embed markup. The active language is switched from
the **EN / FR** control in the sidebar footer; `<html lang>` is kept in sync.

- Default / fallback locale: **English** (`src/i18n/index.js`).
- Add a language: drop a `xx.json` in `locales/`, register it in `src/i18n/index.js`
  (`resources` + `LANGUAGES`).
- The **sample golden-set data is intentionally not localized** — it's content (in a real
  deployment it comes from the backend), so questions/passages stay as authored (English).

## Architecture

```
src/
├── main.jsx                # React mount
├── App.jsx                 # shell: root theme + Sidebar + screen switch
├── index.css               # global reset + keyframes
├── lib/                    # utilities (css, theme, download)
├── data/seed.js            # sample data (pure)
├── domain/                 # PURE business logic (agreement, calibration, exporters)
├── state/useStore.js       # Zustand store (single source of truth)
├── components/             # UI building blocks + CSS Modules (Sidebar, Segmented, Toggle,
│                           #   CandidateCard, CandidateRow, icons)
└── screens/                # the 5 screens + CSS Modules
```

Each screen reads the store via selectors and derives its data with `useMemo` from the pure
functions in `domain/` — no god render function.

## The 5 screens

1. **Setup** — backend choice, manifest, `k` slider, question loading (import a file or add
   on the fly).
2. **Annotate** — the core: ticking candidates (*Flow* or *Split* view, *Comfortable* /
   *Compact* density), keyboard shortcuts `1–9` / `←` `→` / `↵`, low-score tail collapsed
   for large `k`.
3. **Golden set** — overview, questions table, distribution & calibration (histogram of
   relevant chunks → recommended `k`; similarity scores → threshold).
4. **Export** — `golden_set.jsonl` (native) and `qrels` (ranx / Ragas interop), with a real
   download of the generated content.
5. **Contract / YAML** — retrieval contract, declared-backends management, LLM-judge toggle,
   dynamically generated `touchstone.yaml`.

## Two independent visual signals

- **Green** = relevance **validated by the human** (ticked box, "relevant" pill).
- **Indigo** = **suggested by the LLM judge** ("AI" pill, indigo dot).

A candidate may carry both (agreement), one without the other (human addition / dismissed
suggestion) — the two dimensions never blur together.
