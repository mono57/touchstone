import { useMemo } from 'react';
import s from './OverviewScreen.module.css';
import { useStore } from '../state/useStore.js';
import { agreementOf } from '../domain/agreement.js';
import { computeCalibration } from '../domain/calibration.js';

export default function OverviewScreen() {
  const questions = useStore(st => st.questions);
  const backend = useStore(st => st.backend);
  const k = useStore(st => st.k);
  const threshold = useStore(st => st.threshold);
  const setThreshold = useStore(st => st.setThreshold);
  const goToQuestion = useStore(st => st.goToQuestion);

  const total = questions.length;
  const doneCount = questions.filter(x => x.done).length;
  const relevantTotal = questions.filter(x => x.done).reduce((n, x) => n + x.relevantIds.length, 0);

  const statCards = [
    { value: `${doneCount}/${total}`, label: 'questions annotées', color: 'var(--accent)' },
    { value: String(relevantTotal), label: 'labels de pertinence', color: 'var(--ink)' },
    { value: String(k), label: 'candidats montrés (k)', color: 'var(--ink)' },
    { value: backend === 'chaari-prod' ? 'prod' : 'local', label: 'backend actif', color: 'var(--ai)' },
  ];

  const rows = questions.map((x, i) => {
    const a = agreementOf(x);
    return {
      num: String(i).padStart(2, '0'),
      query: x.query,
      rel: `${x.relevantIds.length} / ${x.candidates.length}`,
      agreement: x.done ? `${a.kept} gardés · ${a.added} ajoutés` : '—',
      done: x.done,
      i,
    };
  });

  const cal = useMemo(() => computeCalibration(questions, threshold), [questions, threshold]);

  return (
    <div className={s.wrap}>
      <div className={s.overline}>Golden set · {backend}</div>
      <h1 className={s.title}>Vue d'ensemble</h1>

      <div className={s.stats}>
        {statCards.map((sc, i) => (
          <div key={i} className={s.statCard}>
            <div className={s.statValue} style={{ color: sc.color }}>{sc.value}</div>
            <div className={s.statLabel}>{sc.label}</div>
          </div>
        ))}
      </div>

      <div className={s.table}>
        <div className={s.tableHead}>
          <span>#</span><span>Question</span><span>Pertinents</span><span>Accord IA</span><span className={s.thRight}>Statut</span>
        </div>
        {rows.map((r) => (
          <div key={r.i} onClick={() => goToQuestion(r.i)} className={s.row}>
            <span className={s.rowNum}>{r.num}</span>
            <span className={s.rowQuery}>{r.query}</span>
            <span className={s.rowRel}>{r.rel}</span>
            <span className={s.rowAgree}>{r.agreement}</span>
            <span className={s.rowStatus}>
              <span className={r.done ? `${s.badge} ${s.badgeDone}` : `${s.badge} ${s.badgePending}`}>
                {r.done ? 'annotée' : 'en attente'}
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className={s.note}>On stocke aussi la liste complète des candidats <em>montrés</em> (pas seulement les cochés) — nécessaire pour interpréter correctement le recall. Clique une ligne pour rouvrir la question.</p>

      <div className={s.calibHead}>
        <h2 className={s.calibTitle}>Distribution &amp; calibration</h2>
        <span className={s.calibSub}>dérivé de {cal.calibN} questions annotées</span>
      </div>
      <div className={s.calibGrid}>
        <div className={s.panel}>
          <div className={s.panelTitle}>Chunks pertinents par question</div>
          <div className={s.panelSub}>→ détermine le <strong style={{ color: 'var(--ink-2)' }}>k global</strong></div>
          <div className={s.histo}>
            {cal.kHisto.map((h, i) => (
              <div key={i} className={s.histoCol}>
                <span className={s.histoN}>{h.n}</span>
                <div className={s.histoBar} style={{ height: h.barPct + '%' }} />
              </div>
            ))}
          </div>
          <div className={s.histoLabels}>
            {cal.kHisto.map((h, i) => <span key={i} className={s.histoLabel}>{h.label}</span>)}
          </div>
          <div className={s.recRow}>
            <span className={s.recLabel}>k recommandé</span>
            <span className={s.recVal}>{cal.recKmarge}</span>
            <span className={s.recSub}>p90 = {cal.recK} chunks · +1 de marge</span>
          </div>
          <div className={s.panelNote}>Les questions au-delà de k se traitent par élargissement à la page — on ne monte pas k pour tout le monde.</div>
        </div>

        <div className={s.panel}>
          <div className={s.panelTitle}>Scores de similarité des candidats</div>
          <div className={s.panelSub}>→ détermine le <strong style={{ color: 'var(--ink-2)' }}>seuil de coupure</strong></div>
          <div className={s.chart}>
            <div className={s.relBand}>
              {cal.relTicks.map((t, i) => (
                <div key={i} className={s.tick} style={{ left: t.left + '%', background: 'var(--accent)', opacity: t.on ? 0.9 : 0.22 }} />
              ))}
            </div>
            <div className={s.midline} />
            <div className={s.nonBand}>
              {cal.nonTicks.map((t, i) => (
                <div key={i} className={s.tick} style={{ left: t.left + '%', background: t.on ? 'var(--ink-2)' : 'var(--muted)', opacity: t.on ? 0.85 : 0.22 }} />
              ))}
            </div>
            <div className={s.thrLine} style={{ left: cal.thr * 100 + '%' }} />
            <div className={s.thrLabel} style={{ left: cal.thr * 100 + '%' }}>{cal.thr.toFixed(2)}</div>
            <div className={s.axis}><span>0.0</span><span>0.5</span><span>1.0</span></div>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={cal.thr.toFixed(2)} onChange={(e) => setThreshold(e.target.value)} className={s.thrSlider} />
          <div className={s.readouts}>
            <div><div className={`${s.readBig} ${s.readAccent}`}>{cal.relCoverage}%</div><div className={s.readSmall}>pertinents gardés</div></div>
            <div><div className={`${s.readBig} ${s.readInk}`}>{cal.nonLeak}</div><div className={s.readSmall}>non-pertinents laissés passer</div></div>
            <div className={s.readRight}><div className={s.readRightLabel}>seuil suggéré</div><div className={s.readRightVal}>{cal.suggThresholdNum.toFixed(2)}</div></div>
          </div>
          <div className={s.chartLegend}>
            <span className={s.legendItem}><span className={s.legendBarAccent} />chunk pertinent</span>
            <span className={s.legendItem}><span className={s.legendBarMuted} />non-pertinent</span>
          </div>
        </div>
      </div>
      <div className={s.footnote}>Ce sont des stats <em>descriptives</em> du golden set, pour calibrer k et le seuil — <strong style={{ color: 'var(--ink-2)' }}>pas</strong> des métriques d'évaluation (recall@k, faithfulness), qui se calculent avec ranx / Ragas à partir de l'export.</div>
    </div>
  );
}
