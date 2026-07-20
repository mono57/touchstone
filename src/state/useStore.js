import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { makeQuestion } from '../domain/question.js';
import { retrieveCandidates } from '../lib/retrieve.js';

// A single example backend to get started — edit or replace it on the Contract
// screen. Any search system that implements POST /retrieve can be declared here.
const DEFAULT_BACKENDS = [
  { name: 'local', url: 'http://localhost:8000/retrieve', auth: '', k: 20, health: true },
];

// Single source of truth for the annotation session. Local-first, append-only,
// RESUMABLE: durable state is persisted to localStorage so imported questions,
// annotations, backends and preferences survive reloads and deep-links.
export const useStore = create(persist((set, get) => ({
  // ----- state -----
  // Note: the *current screen* is owned by the URL (react-router), not the store.
  theme: 'light',
  layout: 'flow',
  density: 'comfortable',
  backend: 'local',
  backends: DEFAULT_BACKENDS.map(b => ({ ...b })),
  newBackend: { name: '', url: '', auth: '', k: 20 },
  showBelow: false,
  k: 20,
  qIndex: 0,
  readingId: null,
  judgeEnabled: true,
  threshold: null,
  draft: '',
  questions: [],

  // ----- preferences -----
  toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setLayout: (layout) => set({ layout }),
  setDensity: (density) => set({ density }),
  setK: (k) => set({ k: +k }),
  setThreshold: (threshold) => set({ threshold: +threshold }),
  setReadingId: (readingId) => set({ readingId }),
  toggleShowBelow: () => set(s => ({ showBelow: !s.showBelow })),
  toggleJudge: () => set(s => ({ judgeEnabled: !s.judgeEnabled })),

  // ----- backends -----
  setBackend: (name) => set({ backend: name }),
  cycleBackend: () => set(s => {
    const i = s.backends.findIndex(b => b.name === s.backend);
    const n = s.backends[(i + 1) % s.backends.length];
    return { backend: n ? n.name : s.backend };
  }),
  setNewBackend: (field, val) => set(s => ({ newBackend: { ...s.newBackend, [field]: val } })),
  addBackend: () => {
    const nb = get().newBackend;
    if (!nb.name.trim() || !nb.url.trim()) return;
    set(s => ({
      backends: [...s.backends, { name: nb.name.trim(), url: nb.url.trim(), auth: nb.auth.trim(), k: +nb.k || 20, health: true }],
      newBackend: { name: '', url: '', auth: '', k: 20 },
    }));
  },
  removeBackend: (name) => set(s => {
    const backends = s.backends.filter(b => b.name !== name);
    return { backends, backend: s.backend === name ? (backends[0] ? backends[0].name : '') : s.backend };
  }),

  // ----- annotation -----
  toggleCandidate: (id) => set(s => ({
    questions: s.questions.map((q, i) => {
      if (i !== s.qIndex) return q;
      const has = q.relevantIds.includes(id);
      return { ...q, relevantIds: has ? q.relevantIds.filter(x => x !== id) : [...q.relevantIds, id] };
    }),
  })),
  setExpected: (value) => set(s => ({
    questions: s.questions.map((q, i) => i === s.qIndex ? { ...q, expectedAnswer: value } : q),
  })),
  // next()/skip() return `true` when there is no further question (the caller
  // then routes to the golden set); otherwise they advance and return false.
  next: () => {
    let finished = false;
    set(s => {
      const qs = s.questions.map((q, i) => i === s.qIndex ? { ...q, done: true } : q);
      const ni = s.qIndex + 1;
      if (ni >= qs.length) { finished = true; return { questions: qs }; }
      return { questions: qs, qIndex: ni, readingId: null };
    });
    return finished;
  },
  skip: () => {
    let finished = false;
    set(s => {
      const ni = s.qIndex + 1;
      if (ni >= s.questions.length) { finished = true; return {}; }
      return { qIndex: ni, readingId: null };
    });
    return finished;
  },
  prev: () => set(s => ({ qIndex: Math.max(0, s.qIndex - 1), readingId: null })),
  goToQuestion: (i) => set({ qIndex: i, readingId: null }),
  startAnnotating: () => {
    const fp = get().questions.findIndex(q => !q.done);
    set({ qIndex: fp < 0 ? 0 : fp, readingId: null });
  },

  // Fetch candidates for the current question from the active backend.
  // Skips questions already loaded or that already carry candidates.
  loadCurrent: async () => {
    const st = get();
    const i = st.qIndex;
    const q = st.questions[i];
    if (!q) return;
    if (q.loaded || (q.candidates && q.candidates.length > 0)) return;
    const be = st.backends.find(b => b.name === st.backend);
    if (!be) return;
    const mark = (patch) => set(s => ({
      questions: s.questions.map((qq, j) => (j === i ? { ...qq, ...patch } : qq)),
    }));
    mark({ loading: true, loadError: null });
    try {
      const cands = await retrieveCandidates(be, q.query, st.k);
      mark({ candidates: cands, loaded: true, loading: false, loadError: null });
    } catch (e) {
      mark({ loading: false, loaded: false, loadError: String((e && e.message) || e) });
    }
  },

  // ----- question loading -----
  setDraft: (draft) => set({ draft }),
  addQuestion: (text) => {
    const t = (text || '').trim();
    if (!t) return;
    set(s => ({ questions: [...s.questions, makeQuestion(t)], draft: '' }));
  },
  // Import from a file — REPLACES the current set of questions (a fresh golden
  // set). Each item is { question, lang, type }; candidates are fetched from the
  // active backend on the Annotate screen. Resets the annotation cursor.
  importQuestions: (items) => {
    if (!items || !items.length) return;
    const created = items.map(it => makeQuestion(it.question, it.lang, it.type));
    set({ questions: created, qIndex: 0, readingId: null, threshold: null, showBelow: false });
  },
}), {
  name: 'touchstone-session',
  version: 3,
  // v3 drops the legacy demo data (sample questions + example backends) from any
  // previously persisted session.
  migrate: (persisted, version) => {
    if (persisted && version < 3) {
      return { ...persisted, backends: DEFAULT_BACKENDS.map(b => ({ ...b })), backend: 'local', questions: [], qIndex: 0 };
    }
    return persisted;
  },
  storage: createJSONStorage(() => localStorage),
  // Persist durable session state only — not transient UI (draft, readingId,
  // newBackend draft) and never the action functions.
  partialize: (s) => ({
    theme: s.theme,
    layout: s.layout,
    density: s.density,
    backend: s.backend,
    backends: s.backends,
    k: s.k,
    qIndex: s.qIndex,
    threshold: s.threshold,
    judgeEnabled: s.judgeEnabled,
    showBelow: s.showBelow,
    questions: s.questions,
  }),
}));
