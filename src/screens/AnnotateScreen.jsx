import { useEffect, useMemo } from 'react';
import s from './AnnotateScreen.module.css';
import { useStore } from '../state/useStore.js';
import Segmented from '../components/Segmented.jsx';
import CandidateCard from '../components/CandidateCard.jsx';
import CandidateRow from '../components/CandidateRow.jsx';

const READ_CUTOFF = 0.30;

function decorateCandidates(q, readingId) {
  if (!q) return { list: [], reading: null };
  const rid = readingId || (q.candidates[0] && q.candidates[0].id);
  const list = q.candidates.map((c, idx) => ({
    ...c,
    numberKey: String(idx + 1),
    selected: q.relevantIds.includes(c.id),
    suggested: !!c.judgeSuggested,
    pct: Math.round(c.score * 100),
    scoreText: c.score.toFixed(2),
    sources: (c.sources && c.sources.length) ? c.sources : [{ label: 'source', url: c.url }],
    hasMultiSource: !!(c.sources && c.sources.length > 1),
    isReading: c.id === rid,
  }));
  const reading = list.find(x => x.isReading) || list[0] || null;
  return { list, reading };
}

export default function AnnotateScreen() {
  const questions = useStore(st => st.questions);
  const qIndex = useStore(st => st.qIndex);
  const layout = useStore(st => st.layout);
  const density = useStore(st => st.density);
  const showBelow = useStore(st => st.showBelow);
  const readingId = useStore(st => st.readingId);
  const toggleCandidate = useStore(st => st.toggleCandidate);
  const setExpected = useStore(st => st.setExpected);
  const setLayout = useStore(st => st.setLayout);
  const setDensity = useStore(st => st.setDensity);
  const toggleShowBelow = useStore(st => st.toggleShowBelow);
  const setReadingId = useStore(st => st.setReadingId);
  const next = useStore(st => st.next);
  const prev = useStore(st => st.prev);
  const skip = useStore(st => st.skip);

  // Keyboard shortcuts — active only while this screen is mounted (i.e. on the
  // annotate screen). Reads fresh state via getState to avoid stale closures.
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const st = useStore.getState();
      const cur = st.questions[st.qIndex];
      if (!cur) return;
      if (e.key >= '1' && e.key <= '9') {
        const i = +e.key - 1;
        if (cur.candidates[i]) { st.toggleCandidate(cur.candidates[i].id); e.preventDefault(); }
      } else if (e.key === 'ArrowRight') { st.next(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { st.prev(); e.preventDefault(); }
      else if (e.key === 'Enter') { st.next(); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = questions[qIndex];
  const dense = density === 'compact';
  const total = questions.length;
  const doneCount = questions.filter(x => x.done).length;
  const progressPct = Math.round((doneCount / total) * 100);

  const { list, reading } = useMemo(() => decorateCandidates(q, readingId), [q, readingId]);

  const bigList = list.length > 8;
  const hidden = bigList ? list.filter(c => c.score < READ_CUTOFF && !c.selected && !c.suggested) : [];
  const hiddenSet = new Set(hidden.map(c => c.id));
  const visible = list.filter(c => !hiddenSet.has(c.id));
  const shownList = showBelow ? list : visible;
  const toggleLabel = showBelow
    ? 'Masquer les candidats à faible score'
    : `+ ${hidden.length} candidats à faible score (< ${READ_CUTOFF.toFixed(2)})`;

  const stopLink = (e) => e.preventDefault();

  return (
    <div className={s.screen}>
      <div className={s.header}>
        <div className={s.headTop}>
          <div className={s.counter}>
            <span className={s.qNum}>{String(qIndex).padStart(2, '0')}</span>
            <span className={s.qTotal}>/ {String(total).padStart(2, '0')}</span>
          </div>
          <div className={s.progressTrack}>
            <div className={s.progressBar} style={{ width: progressPct + '%' }} />
          </div>
          <span className={s.doneCount}>{doneCount} annotées</span>
          <div className={s.controls}>
            <Segmented
              label="Vue" value={layout} onChange={setLayout}
              options={[{ value: 'flow', label: 'Flux' }, { value: 'split', label: 'Deux volets' }]}
            />
            <Segmented
              label="Densité" value={density} onChange={setDensity}
              options={[{ value: 'comfortable', label: 'Confort' }, { value: 'compact', label: 'Compact' }]}
            />
          </div>
        </div>

        <div className={s.headQ}>
          <span className={s.langBadge}>{q ? q.lang : ''}</span>
          <h1 className={s.query}>{q ? q.query : ''}</h1>
          <div className={s.selBox}>
            <div className={s.selNum}>{q ? q.relevantIds.length : 0}</div>
            <div className={s.selLabel}>pertinents / {list.length}</div>
          </div>
        </div>
      </div>

      <div className={s.body}>
        {layout === 'flow' && (
          <div className={s.flow}>
            <div className={s.flowHead}>
              <div className={s.flowHint}>Coche les passages qui <strong style={{ color: 'var(--ink)' }}>répondent</strong> à la question.</div>
              <div className={s.legend}><span className={s.legendSwatch} /> suggéré par le juge LLM</div>
            </div>
            <div className={s.flowSub}>{list.length} candidats récupérés (k) · triés par score décroissant</div>
            <div className={s.cards} style={{ gap: dense ? '8px' : '11px' }}>
              {shownList.map((c) => (
                <CandidateCard key={c.id} c={c} dense={dense} onToggle={() => toggleCandidate(c.id)} />
              ))}
            </div>
            {hidden.length > 0 && (
              <button onClick={toggleShowBelow} className={s.showBtn}>{toggleLabel}</button>
            )}
            <div className={s.answerBlock}>
              <label className={s.answerLabel}>Réponse attendue</label>
              <textarea
                value={q ? q.expectedAnswer : ''}
                onChange={(e) => setExpected(e.target.value)}
                placeholder="Résume la réponse correcte à partir des passages cochés…"
                className={s.answerArea}
              />
            </div>
          </div>
        )}

        {layout === 'split' && (
          <div className={s.split}>
            <div className={s.splitList}>
              <div className={s.splitListHead}>{list.length} candidats · triés par score</div>
              {list.map((c) => (
                <CandidateRow
                  key={c.id}
                  c={c}
                  isReading={c.isReading}
                  onToggle={() => toggleCandidate(c.id)}
                  onPick={() => setReadingId(c.id)}
                />
              ))}
            </div>
            <div className={s.reader}>
              {reading && (
                <div className={s.readerInner}>
                  <div className={s.readerTop}>
                    {reading.suggested && <span className={s.pillAi}><span className={s.dotAi} />suggéré IA</span>}
                    <span className={s.readerScore}>score {reading.scoreText}</span>
                  </div>
                  <h2 className={s.readerTitle}>{reading.title}</h2>
                  <div className={s.readerMeta}>
                    <span className={s.readerId}>{reading.id}</span>
                    {reading.hasMultiSource && <span className={s.readerSourcesLabel}>sources :</span>}
                    {reading.sources.map((src, i) => (
                      <a key={i} href={src.url} onClick={stopLink} className={s.readerLink}>{src.label} →</a>
                    ))}
                  </div>
                  <p className={s.readerText}>{reading.text}</p>
                  <button
                    onClick={() => toggleCandidate(reading.id)}
                    className={reading.selected ? `${s.action} ${s.actionSelected}` : s.action}
                  >
                    {reading.selected ? 'Retirer de la sélection' : 'Marquer pertinent'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={s.footer}>
        <div className={s.hints}>
          <span className={s.hint}><kbd className={s.kbd}>1–9</kbd> cocher</span>
          <span className={s.hint}><kbd className={s.kbd}>←</kbd><kbd className={s.kbd}>→</kbd> naviguer</span>
          <span className={s.hint}><kbd className={s.kbd}>↵</kbd> suivant</span>
        </div>
        <div className={s.footerActions}>
          <button onClick={prev} className={s.btnPrev}>← Précédent</button>
          <button onClick={skip} className={s.btnSkip}>Passer</button>
          <button onClick={next} className={s.btnNext}>Enregistrer &amp; suivant <span className={s.btnNextArrow}>→</span></button>
        </div>
      </div>
    </div>
  );
}
