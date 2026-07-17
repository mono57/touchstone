<div align="center">

# 🟢 Touchstone

**Relevance annotation for building _golden sets_ that evaluate RAG systems.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3f9d6d.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-3f9d6d.svg)](CONTRIBUTING.md)
[![React](https://img.shields.io/badge/React-18-149eca.svg?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

</div>

<!-- Add a screenshot or short GIF of the Annotate screen here, e.g. docs/annotate.png -->

---

## ✨ What is Touchstone?

Touchstone is a **local-first, backend-agnostic** tool for building the labeled data you
need to measure whether a RAG (retrieval-augmented generation) system actually retrieves the
right things — a **golden set** of `question → relevant passages`.

It contains **no retriever of its own.** Instead it speaks a tiny HTTP contract
(`POST /retrieve`) that *any* search system can implement, then lets a human annotate the
candidates that system returns.

Its guiding principle is **recognition, not recall**: the annotator never guesses the right
passages from memory — they *tick* the relevant ones among a list of candidates returned by
the backend. Annotation is append-only and resumable, so you can build a golden set over many
short sessions without losing work.

> [!NOTE]
> Touchstone is currently a **single-page front-end prototype** (React + Vite). It ships with
> in-memory sample data and **simulates** `POST /retrieve` calls — there is no real backend
> wired up yet. The retrieval contract below describes the design your backend implements; the
> UI, data model, and export formats are real and complete.

## 🤔 Why Touchstone?

- 🎯 **Recognition beats recall.** Ticking candidates from a list is faster, more consistent,
  and less biased than writing down the "correct" passages from memory.
- 🔌 **Backend-agnostic by design.** Any retriever — a vector DB, BM25, a hybrid stack, a
  hosted API — plugs in through one HTTP endpoint. Touchstone never dictates your search stack.
- 💾 **Local-first & resumable.** State lives in your browser's `localStorage`; reload or
  deep-link into any screen and your work is exactly where you left it.
- 📤 **Interoperable output.** Export a native `golden_set.jsonl` *and* standard `qrels`
  (TREC / ranx / Ragas) so your labels drop straight into existing evaluation pipelines.
- 🌍 **Internationalized.** English + French out of the box; add a locale with one JSON file.
- 🪶 **No UI dependency.** Icons are inline SVGs, type is IBM Plex — the whole thing is small.

## 🚀 Getting started

**Requirements:** [Node.js](https://nodejs.org) 18+ and npm.

```bash
git clone https://github.com/mono57/touchstone.git
cd touchstone
npm install
npm run dev        # dev server (HMR) → http://localhost:5173
```

Production build:

```bash
npm run build      # outputs dist/
npm run preview    # serve the production build locally
```

Touchstone uses the HTML5 history API (`BrowserRouter`). Vite's dev/preview servers fall back
to `index.html` automatically; a static host needs the usual SPA rewrite (all paths →
`index.html`).

## 🔌 The retrieval contract

Touchstone talks to your search system through **one endpoint**. Implement this and any
backend becomes annotatable:

**Request** — `POST /retrieve`

```json
{ "query": "How do I rotate my API keys?", "k": 20 }
```

**Response**

```json
{
  "results": [
    { "id": "auth#rotating", "title": "Rotating…", "text": "Create a key…", "score": 0.82 }
  ]
}
```

| Field    | Meaning                                                            |
|----------|-------------------------------------------------------------------|
| `id`     | Stable identifier for the passage/chunk (used as the label key).  |
| `title`  | Human-readable heading shown on the candidate card.               |
| `text`   | The passage the annotator reads to judge relevance. Rendered as Markdown (GFM tables, fenced code, inline code). |
| `score`  | The backend's similarity/rank score (drives calibration & sort).  |

Backends are declared on the **Contract** screen and serialized to a `touchstone.yaml`:

```yaml
backends:
  - name: prod
    url: https://search.example.com/retrieve
    auth_header: "Bearer …"
    default_k: 20

output:
  path: ./golden_set.jsonl
  formats: [jsonl, qrels]

judge:
  enabled: false
  provider: anthropic
  model: claude-sonnet-5
  # key via ANTHROPIC_API_KEY, never in the file
```

## 📐 The five screens

Each screen has its own URL — deep-linkable, refresh-safe, and back/forward works.

1. **Setup** (`/setup`) — pick a backend, review the manifest, set `k`, and load questions
   (import a `.json`/`.txt` file or add one on the fly).
2. **Annotate** (`/annotate`) — the core loop: tick relevant candidates in *Flow* or *Split*
   view at *Comfortable* or *Compact* density. Keyboard shortcuts: `1`–`9` toggle candidates,
   `←` `→` move between questions, `↵` confirms. Low-score tails collapse for large `k`.
   Chunk text renders as Markdown (tables, fenced code, inline code) — clamped to a preview
   with **Show more** in *Flow*, shown in full in the *Split* reader.
3. **Golden set** (`/golden-set`) — overview, questions table, and calibration: a histogram of
   relevant chunks recommends a `k`; the distribution of similarity scores recommends a
   threshold.
4. **Export** (`/export`) — download `golden_set.jsonl` (native) and `qrels` (ranx / Ragas
   interop) generated from your annotations.
5. **Contract** (`/contract`) — the retrieval contract, declared-backend management, the
   LLM-judge toggle, and the generated `touchstone.yaml`.

## 📥 Importing questions

On the **Setup** screen, **Import questions** accepts:

- **`.json`** — an array of `[{ "question", "lang"?, "type"? }, …]` (also accepts a plain array
  of strings, or an object with a top-level `questions` array).
- **`.txt`** — one question per line.

Parsing lives in [`src/lib/parseQuestions.js`](src/lib/parseQuestions.js) (pure and lenient).
Imported questions keep their `lang` and `type` (round-tripped in the JSONL export) and receive
simulated candidates. **Importing replaces the current question set** and resets the annotation
cursor; use **+ Add** to append a single question instead.

## 📤 Golden-set output formats

**`golden_set.jsonl`** — one JSON object per annotated question, keeping the full candidate
list that was shown (so the labeling is reproducible):

```json
{
  "id": "q_017",
  "query": "How do I rotate my API keys?",
  "lang": "en",
  "type": "simple",
  "backend": "prod",
  "k_shown": 20,
  "candidate_ids": ["auth#rotating", "auth#key-anatomy", "..."],
  "relevant_ids": ["auth#rotating", "auth#key-anatomy"],
  "expected_answer": "Create a new key, switch services over, then disable the old one.",
  "judge_suggested": ["auth#rotating"],
  "annotator": "me",
  "ts": "2026-07-13T10:22:00Z"
}
```

**`qrels`** — the standard TREC/ranx relevance-judgment format (`query_id 0 doc_id relevance`):

```
q_000  0  authentication#rotating-credentials  1
q_000  0  authentication#key-anatomy  1
q_001  0  rate-limits#overview  1
```

Serializers are pure functions in [`src/domain/exporters.js`](src/domain/exporters.js).

## 🎨 Two independent visual signals

Touchstone keeps the human's judgment and the machine's suggestion visually distinct — they
never blur together:

- 🟢 **Green** = relevance **validated by the human** (ticked box, "relevant" pill).
- 🟣 **Indigo** = **suggested by the LLM judge** ("AI" pill, indigo dot).

A candidate may carry both (agreement), or one without the other (a human addition, or a
dismissed suggestion).

## 🧱 Architecture

```
src/
├── main.jsx                # React mount
├── App.jsx                 # shell: root theme + Sidebar + routed screens
├── index.css               # global reset + keyframes
├── lib/                    # utilities (css, theme, download, parseQuestions)
├── data/seed.js            # sample data (pure)
├── domain/                 # PURE business logic (agreement, calibration, exporters)
├── state/useStore.js       # Zustand store (single source of truth)
├── i18n/                   # i18next config + locales (en, fr)
├── components/             # UI building blocks + CSS Modules
└── screens/                # the 5 screens + CSS Modules
```

- **React 18 + Vite** for the dev server and build.
- **react-router-dom** — one URL per screen; the URL owns the current screen.
- **Zustand** (with `persist`) — a single store in
  [`src/state/useStore.js`](src/state/useStore.js) holding session state + actions.
- **react-i18next** — UI strings; English is the source locale, French a second one.
- **CSS Modules** — one `.module.css` per component; light/dark theme via CSS custom
  properties on the root.

Each screen reads the store via selectors and derives its data with `useMemo` from the pure
functions in `domain/` — there is no god render function.

## 💾 Persistence (resumable sessions)

The single Zustand store means every screen reads the same data live. Durable state —
imported/added questions, annotations, declared backends, `k`, threshold, and preferences
(theme, view, density) — is persisted to `localStorage` via Zustand's `persist` middleware
(`partialize` keeps transient UI and action functions out). Reloading the page or opening a
screen's URL directly keeps your work.

To start fresh, clear the site's `localStorage` (keys `touchstone-session` and
`touchstone-lang`).

## 🌍 Internationalization

UI strings live in [`src/i18n/locales/`](src/i18n/locales/) (`en.json`, `fr.json`) and are
consumed with `useTranslation()` (`t('key')`) or `<Trans>` for strings that embed markup. The
active language is switched from the **EN / FR** control in the sidebar footer, and
`<html lang>` is kept in sync.

- Default / fallback locale: **English** ([`src/i18n/index.js`](src/i18n/index.js)).
- **Add a language:** drop an `xx.json` in `locales/` and register it in `src/i18n/index.js`
  (`resources` + `LANGUAGES`).
- Sample golden-set data is intentionally **not** localized — it is content (in a real
  deployment it comes from the backend), so it stays as authored.

## 🗺 Routes

| Path          | Screen                                     |
|---------------|--------------------------------------------|
| `/setup`      | Setup (`/` and unknown paths redirect here) |
| `/annotate`   | Annotate                                   |
| `/golden-set` | Golden set (Overview)                      |
| `/export`     | Export                                     |
| `/contract`   | Contract / YAML                            |

## 🤝 Contributing

Contributions are very welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the dev
setup, project conventions, and PR process, and note our
[Code of Conduct](CODE_OF_CONDUCT.md). Good first areas: new export formats, a real
`/retrieve` client, additional locales, and accessibility improvements.

## 📄 License

Touchstone is released under the [MIT License](LICENSE).
