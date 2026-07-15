import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import s from './OverviewScreen.module.css';
import { useStore } from '../state/useStore.js';
import { agreementOf } from '../domain/agreement.js';
import { computeCalibration } from '../domain/calibration.js';

export default function OverviewScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    { value: `${doneCount}/${total}`, label: t('overview.statQuestions'), color: 'var(--accent)' },
    { value: String(relevantTotal), label: t('overview.statLabels'), color: 'var(--ink)' },
    { value: String(k), label: t('overview.statShown'), color: 'var(--ink)' },
    { value: backend === 'chaari-prod' ? 'prod' : 'local', label: t('overview.statBackend'), color: 'var(--ai)' },
  ];

  const rows = questions.map((x, i) => {
    const a = agreementOf(x);
    return {
      num: String(i).padStart(2, '0'),
      query: x.query,
      rel: `${x.relevantIds.length} / ${x.candidates.length}`,
      agreement: x.done ? t('overview.kept', { kept: a.kept, added: a.added }) : '—',
      done: x.done,
      i,
    };
  });

  const cal = useMemo(() => computeCalibration(questions, threshold), [questions, threshold]);

  return (
    <div className={s.wrap}>
      <div className={s.overline}>{t('overview.goldenSet', { backend })}</div>
      <h1 className={s.title}>{t('overview.title')}</h1>

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
          <span>#</span><span>{t('overview.colQuestion')}</span><span>{t('overview.colRelevant')}</span><span>{t('overview.colAgreement')}</span><span className={s.thRight}>{t('overview.colStatus')}</span>
        </div>
        {rows.map((r) => (
          <div key={r.i} onClick={() => { goToQuestion(r.i); navigate('/annotate'); }} className={s.row}>
            <span className={s.rowNum}>{r.num}</span>
            <span className={s.rowQuery}>{r.query}</span>
            <span className={s.rowRel}>{r.rel}</span>
            <span className={s.rowAgree}>{r.agreement}</span>
            <span className={s.rowStatus}>
              <span className={r.done ? `${s.badge} ${s.badgeDone}` : `${s.badge} ${s.badgePending}`}>
                {r.done ? t('overview.annotated') : t('overview.pending')}
              </span>
            </span>
          </div>
        ))}
      </div>
      <p className={s.note}>
        <Trans i18nKey="overview.note" components={{ em: <em /> }} />
      </p>

      <div className={s.calibHead}>
        <h2 className={s.calibTitle}>{t('overview.calibration')}</h2>
        <span className={s.calibSub}>{t('overview.derivedFrom', { n: cal.calibN })}</span>
      </div>
      <div className={s.calibGrid}>
        <div className={s.panel}>
          <div className={s.panelTitle}>{t('overview.chunksTitle')}</div>
          <div className={s.panelSub}>
            <Trans i18nKey="overview.kGlobal" components={{ strong: <strong style={{ color: 'var(--ink-2)' }} /> }} />
          </div>
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
            <span className={s.recLabel}>{t('overview.recommendedK')}</span>
            <span className={s.recVal}>{cal.recKmarge}</span>
            <span className={s.recSub}>{t('overview.p90', { k: cal.recK })}</span>
          </div>
          <div className={s.panelNote}>{t('overview.chunksNote')}</div>
        </div>

        <div className={s.panel}>
          <div className={s.panelTitle}>{t('overview.scoresTitle')}</div>
          <div className={s.panelSub}>
            <Trans i18nKey="overview.cutoff" components={{ strong: <strong style={{ color: 'var(--ink-2)' }} /> }} />
          </div>
          <div className={s.chart}>
            <div className={s.relBand}>
              {cal.relTicks.map((tk, i) => (
                <div key={i} className={s.tick} style={{ left: tk.left + '%', background: 'var(--accent)', opacity: tk.on ? 0.9 : 0.22 }} />
              ))}
            </div>
            <div className={s.midline} />
            <div className={s.nonBand}>
              {cal.nonTicks.map((tk, i) => (
                <div key={i} className={s.tick} style={{ left: tk.left + '%', background: tk.on ? 'var(--ink-2)' : 'var(--muted)', opacity: tk.on ? 0.85 : 0.22 }} />
              ))}
            </div>
            <div className={s.thrLine} style={{ left: cal.thr * 100 + '%' }} />
            <div className={s.thrLabel} style={{ left: cal.thr * 100 + '%' }}>{cal.thr.toFixed(2)}</div>
            <div className={s.axis}><span>0.0</span><span>0.5</span><span>1.0</span></div>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={cal.thr.toFixed(2)} onChange={(e) => setThreshold(e.target.value)} className={s.thrSlider} />
          <div className={s.readouts}>
            <div><div className={`${s.readBig} ${s.readAccent}`}>{cal.relCoverage}%</div><div className={s.readSmall}>{t('overview.relevantKept')}</div></div>
            <div><div className={`${s.readBig} ${s.readInk}`}>{cal.nonLeak}</div><div className={s.readSmall}>{t('overview.nonRelevantThrough')}</div></div>
            <div className={s.readRight}><div className={s.readRightLabel}>{t('overview.suggestedThreshold')}</div><div className={s.readRightVal}>{cal.suggThresholdNum.toFixed(2)}</div></div>
          </div>
          <div className={s.chartLegend}>
            <span className={s.legendItem}><span className={s.legendBarAccent} />{t('overview.legendRelevant')}</span>
            <span className={s.legendItem}><span className={s.legendBarMuted} />{t('overview.legendNonRelevant')}</span>
          </div>
        </div>
      </div>
      <div className={s.footnote}>
        <Trans i18nKey="overview.footnote" components={{ em: <em />, strong: <strong style={{ color: 'var(--ink-2)' }} /> }} />
      </div>
    </div>
  );
}
