import s from './SetupScreen.module.css';
import { useStore } from '../state/useStore.js';

const MANIFEST = [
  { k: 'name', v: '"Chaari docs"' },
  { k: 'id_scheme', v: '"page#anchor"' },
  { k: 'default_k', v: '20' },
  { k: 'languages', v: '["en","fr"]' },
];

export default function SetupScreen() {
  const backends = useStore(st => st.backends);
  const backend = useStore(st => st.backend);
  const k = useStore(st => st.k);
  const questions = useStore(st => st.questions);
  const draft = useStore(st => st.draft);
  const setBackend = useStore(st => st.setBackend);
  const setK = useStore(st => st.setK);
  const setDraft = useStore(st => st.setDraft);
  const addQuestion = useStore(st => st.addQuestion);
  const importSample = useStore(st => st.importSample);
  const startAnnotating = useStore(st => st.startAnnotating);

  return (
    <div className={s.wrap}>
      <div className={s.overline}>Étape 1 · préparer la session</div>
      <h1 className={s.title}>Configuration</h1>
      <p className={s.intro}>
        Touchstone ne cherche pas — il <em>demande à chercher</em>. Choisis le backend qui expose
        le contrat <span className={s.codeChip}>POST /retrieve</span>, puis charge ton jeu de questions.
      </p>

      <div className={s.sectionHead}>
        <span className={s.sectionLabel}>Choisir un backend</span>
        <span className={s.sectionHint}>— déclarés dans <span className={s.mono11}>touchstone.yaml</span> (onglet Contrat / YAML)</span>
      </div>
      <div className={s.backendGrid}>
        {backends.map((b) => {
          const active = backend === b.name;
          const dot = b.health ? 'var(--accent)' : 'var(--muted)';
          const halo = b.health ? 'var(--accent-soft)' : 'var(--surface-2)';
          return (
            <button key={b.name} onClick={() => setBackend(b.name)} className={active ? `${s.card} ${s.cardActive}` : s.card}>
              <div className={s.cardTop}>
                <span className={s.dot8} style={{ background: dot, boxShadow: `0 0 0 3px ${halo}` }} />
                <span className={s.cardName}>{b.name}</span>
                {active && <span className={s.selBadge}>sélectionné</span>}
              </div>
              <div className={s.cardUrl}>{b.url}</div>
              <div className={s.cardMeta}>
                <span>k&nbsp;=&nbsp;<span className={s.kv}>{b.k}</span></span>
                <span>{b.health ? '/health · 200 OK' : 'injoignable'}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={s.cols}>
        <div>
          <div className={`${s.sectionLabel} ${s.mb12}`}>Manifest du backend</div>
          <div className={s.manifestBox}>
            {MANIFEST.map((m) => (
              <div key={m.k} className={s.manifestRow}>
                <span className={s.manifestKey}>{m.k}</span>
                <span className={s.manifestVal}>{m.v}</span>
              </div>
            ))}
          </div>
          <div className={s.kBlock}>
            <div className={s.kHead}>
              <span className={s.sectionLabel}>Candidats par question · k</span>
              <span className={s.kValue}>{k}</span>
            </div>
            <input type="range" min="5" max="40" step="1" value={k} onChange={(e) => setK(e.target.value)} className={s.kSlider} />
            <div className={s.kNote}>Un k <em>généreux</em> favorise la reconnaissance : on coche parmi des candidats plutôt que de deviner de mémoire.</div>
          </div>
        </div>

        <div>
          <div className={s.loadHead}>
            <span className={s.sectionLabel}>Charger les questions</span>
            <button onClick={importSample} className={s.importBtn}>↑ Importer questions.txt</button>
          </div>
          <div className={s.loadHint}>Depuis un fichier <span className={s.mono11}>questions.txt</span> ou saisies à la volée ci-dessous.</div>
          <div className={s.qBox}>
            <div className={s.qBoxHead}>
              <span className={s.qFile}>questions.txt</span>
              <span className={s.qCount}>{questions.length} lignes · fr · en</span>
            </div>
            <div className={s.qList}>
              {questions.map((q, i) => (
                <div key={q.id} className={s.qRow}>
                  <span className={s.qNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.qText}>{q.query}</span>
                  <span className={s.qLang}>{q.lang}</span>
                </div>
              ))}
            </div>
            <div className={s.qAddBar}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addQuestion(draft); }}
                placeholder="Ajouter une question à la volée…"
                className={s.qInput}
              />
              <button onClick={() => addQuestion(draft)} className={s.qAddBtn}>+ Ajouter</button>
            </div>
          </div>
          <button onClick={startAnnotating} className={s.cta}>
            Commencer l'annotation
            <span className={s.ctaArrow}>→</span>
          </button>
          <div className={s.ctaNote}>Session résumable · chaque réponse est écrite immédiatement (append-only).</div>
        </div>
      </div>
    </div>
  );
}
