import { create } from 'zustand';
import { seed, genQuestion } from '../data/seed.js';

// Single source of truth for the annotation session. Local-first, append-only:
// every action produces a new immutable snapshot.
export const useStore = create((set, get) => ({
  // ----- state -----
  // Note: the *current screen* is owned by the URL (react-router), not the store.
  theme: 'light',
  layout: 'flow',
  density: 'comfortable',
  backend: 'chaari-prod',
  backends: [
    { name: 'chaari-prod', url: 'https://api.chaari.app/internal/retrieve', auth: 'Authorization: Bearer ${CHAARI_TOKEN}', k: 20, health: true },
    { name: 'chaari-local', url: 'http://localhost:9000/retrieve', auth: '', k: 20, health: true },
  ],
  newBackend: { name: '', url: '', auth: '', k: 20 },
  showBelow: false,
  k: 20,
  qIndex: 0,
  readingId: null,
  judgeEnabled: true,
  threshold: null,
  draft: '',
  questions: seed(),

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

  // ----- question loading -----
  setDraft: (draft) => set({ draft }),
  addQuestion: (text) => {
    const t = (text || '').trim();
    if (!t) return;
    set(s => ({ questions: [...s.questions, genQuestion(t)], draft: '' }));
  },
  // Append imported questions. Each item is { question, lang, type }; candidates
  // are simulated (no real backend in the prototype).
  addQuestions: (items) => {
    if (!items || !items.length) return;
    const created = items.map(it => genQuestion(it.question, it.lang, it.type));
    set(s => ({ questions: [...s.questions, ...created] }));
  },
}));
