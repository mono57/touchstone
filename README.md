# Touchstone

Outil open-source d'**annotation de pertinence** pour construire des *golden sets*
d'évaluation de systèmes RAG. Touchstone est **agnostique du backend** : il ne contient
aucun retriever, il parle un contrat HTTP (`POST /retrieve`) que n'importe quel système
de recherche implémente.

Principe : **reconnaissance, pas rappel** — l'annotateur ne devine pas les bons passages,
il *coche* parmi une liste de candidats renvoyés par le backend. Local-first, append-only,
résumable.

> Prototype front-end mono-page (React + Vite). Les données sont des exemples en mémoire
> et les appels `/retrieve` sont simulés.

## Démarrer

```bash
npm install
npm run dev        # serveur de dev (HMR)  → http://localhost:5173
```

## Build de production

```bash
npm run build      # génère dist/
npm run preview    # sert le build de production
```

## Stack

- **React 18** + **Vite** (dev server + build).
- **Zustand** — store unique (`src/state/useStore.js`) : état de session + actions.
- **CSS Modules** — un `.module.css` par composant ; thème clair/sombre par variables CSS
  appliquées sur la racine. Navigation par champ d'état `screen` (pas de router).
- **Aucune dépendance UI** : icônes = petits SVG inline, typographie IBM Plex Sans / Mono.

## Architecture

```
src/
├── main.jsx                # montage React
├── App.jsx                 # coquille : thème racine + Sidebar + switch d'écran
├── index.css               # reset global + keyframes
├── lib/                    # utilitaires (css, theme, download)
├── data/seed.js            # données d'exemple (pures)
├── domain/                 # logique métier PURE (agreement, calibration, exporters)
├── state/useStore.js       # store Zustand (source de vérité unique)
├── components/             # briques UI + CSS Modules (Sidebar, Segmented, Toggle,
│                           #   CandidateCard, CandidateRow, icons)
└── screens/                # 5 écrans + CSS Modules
```

Chaque écran lit le store via des sélecteurs et calcule ses données dérivées avec `useMemo`
à partir des fonctions pures de `domain/` — pas de fonction-dieu de rendu.

## Les 5 écrans

1. **Configuration** — choix du backend, manifest, slider `k`, chargement des questions.
2. **Annotation** — le cœur : cochage des candidats (vue *Flux* ou *Deux volets*,
   densité *Confort* / *Compact*), raccourcis clavier `1–9` / `←` `→` / `↵`, repli de la
   traîne à faible score pour les grands `k`.
3. **Golden set** — vue d'ensemble, tableau des questions, distribution & calibration
   (histogramme des chunks pertinents → `k` recommandé ; scores de similarité → seuil).
4. **Export** — `golden_set.jsonl` (natif) et `qrels` (interop ranx / Ragas), avec
   téléchargement réel du contenu généré.
5. **Contrat / YAML** — contrat de retrieval, gestion des backends déclarés, toggle du
   juge LLM, `touchstone.yaml` généré dynamiquement.

## Deux signaux visuels indépendants

- **Vert** = pertinence **validée par l'humain** (case cochée, pastille « pertinent »).
- **Indigo** = **suggéré par le juge LLM** (pastille « IA », point indigo).

Un candidat peut porter les deux (accord), l'un sans l'autre (ajout humain / suggestion
écartée) — ces deux dimensions ne se confondent jamais.
