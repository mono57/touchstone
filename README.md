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
- **Zustand** — single store (`src/state/useStore.js`): session state + actions.
- **react-i18next** — UI internationalization; English is the source locale, French is
  a second locale, switchable from the sidebar.
- **CSS Modules** — one `.module.css` per component; light/dark theme via CSS custom
  properties applied on the root. Navigation via a `screen` state field (no router).
- **No UI dependency**: icons are small inline SVGs, typography is IBM Plex Sans / Mono.

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

1. **Setup** — backend choice, manifest, `k` slider, question loading.
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
