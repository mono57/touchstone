# Contributing to Touchstone

Thanks for your interest in improving Touchstone! 🎉 This document explains how to set up the
project, the conventions we follow, and how to get a change merged.

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- 🐛 **Report bugs** — open a [bug report](https://github.com/mono57/touchstone/issues/new/choose).
- 💡 **Propose features** — open a feature request to discuss before you build.
- 📝 **Improve docs** — README, code comments, or examples.
- 🌍 **Add a locale** — see [Internationalization](#internationalization) below.
- 🔌 **Wire up a real backend** — a `POST /retrieve` client is a great first project.
- 🧑‍💻 **Fix an issue** — comment on it first so we don't duplicate work.

## Development setup

**Requirements:** [Node.js](https://nodejs.org) 18+ and npm.

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/touchstone.git
cd touchstone

# 2. Install dependencies
npm install

# 3. Start the dev server (hot reload) → http://localhost:5173
npm run dev
```

Before opening a PR, make sure the production build succeeds — this is what CI checks:

```bash
npm run build
```

## Project conventions

Touchstone is small and opinionated. Please match the existing style rather than introducing
new patterns:

- **Pure `domain/`.** Business logic (agreement, calibration, exporters) lives in
  [`src/domain/`](src/domain/) as pure functions with no React or store imports. Keep it
  testable and side-effect free.
- **One store.** State is a single Zustand store in
  [`src/state/useStore.js`](src/state/useStore.js). Components read it via **selectors**
  (`useStore(st => st.x)`) and derive view data with `useMemo` from `domain/` functions — no
  god render function.
- **The URL owns the screen.** Each screen is a route; screen-changing actions navigate. Don't
  add a "current screen" field to the store.
- **CSS Modules.** One `.module.css` per component. Theme via CSS custom properties on the
  root — don't hardcode colors. No CSS/UI framework dependency.
- **No new heavy dependencies** without discussion. Icons are inline SVGs; type is IBM Plex.
- **Keep it lenient.** Parsers (e.g. `parseQuestions.js`) should accept messy real-world input
  gracefully rather than throwing.

### Internationalization

All user-facing strings must go through i18n — never hardcode display text.

- Add keys to **both** [`src/i18n/locales/en.json`](src/i18n/locales/en.json) and
  [`fr.json`](src/i18n/locales/fr.json). English is the source/fallback locale.
- Use `t('key')` for plain strings and `<Trans>` for strings that embed markup.
- **To add a language:** create `src/i18n/locales/xx.json` and register it in
  [`src/i18n/index.js`](src/i18n/index.js) (`resources` + `LANGUAGES`).
- Sample golden-set data is content, not UI — leave it as authored.

## Pull request process

1. **Branch** off `main` with a descriptive name (`fix/annotate-shortcut`, `feat/csv-export`).
2. **Keep PRs focused** — one logical change per PR is easier to review.
3. **Write clear commits.** A short imperative subject (“Add CSV export”) plus a body
   explaining the *why* when it isn't obvious.
4. **Confirm `npm run build` passes** locally.
5. **Update docs** (README / this file) when you change behavior or add a feature.
6. **Open the PR** against `mono57/touchstone:main`, fill in the template, and link any related
   issue (`Closes #123`).

A maintainer will review as soon as they can. Thanks for contributing! 💚

## Reporting bugs & security issues

Found a bug or a potential security issue? Please
[open an issue](https://github.com/mono57/touchstone/issues) with the details and we'll take a
look as soon as we can.
