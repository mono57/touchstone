import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import s from './ExportScreen.module.css';
import { useStore } from '../state/useStore.js';
import { buildJsonl, buildQrels, sampleJsonl, qrelsSample } from '../domain/exporters.js';
import { triggerDownload } from '../lib/download.js';

export default function ExportScreen() {
  const { t } = useTranslation();
  const questions = useStore(st => st.questions);
  const backend = useStore(st => st.backend);

  const doneCount = questions.filter(x => x.done).length;
  const expLabels = questions.filter(x => x.done).reduce((n, x) => n + x.relevantIds.length, 0);
  const jsonlPreview = useMemo(() => sampleJsonl(questions, backend), [questions, backend]);
  const qrelsPreview = useMemo(() => qrelsSample(questions), [questions]);

  return (
    <div className={s.wrap}>
      <div className={s.overline}>{t('export.overline')}</div>
      <h1 className={s.title}>{t('export.title')}</h1>
      <p className={s.intro}>{t('export.intro')}</p>

      <div className={s.cards}>
        <div className={`${s.card} ${s.cardAccent}`}>
          <div className={s.cardHead}>
            <span className={s.cardTitle}>golden_set.jsonl</span>
            <span className={s.badgeNative}>{t('export.native')}</span>
          </div>
          <p className={s.cardDesc}>{t('export.jsonlDesc')}</p>
          <div className={s.cardStats}><span>{t('export.questions', { n: doneCount })}</span><span>{t('export.labels', { n: expLabels })}</span></div>
        </div>
        <div className={s.card}>
          <div className={s.cardHead}>
            <span className={s.cardTitle}>qrels</span>
            <span className={s.badgeInterop}>{t('export.interop')}</span>
          </div>
          <p className={s.cardDesc}>{t('export.qrelsDesc')}</p>
          <div className={s.cardMono}>{t('export.qrelsFormat')}</div>
        </div>
      </div>

      <div className={s.previewHead}>
        <span className={s.previewLabel}>{t('export.previewJsonl')}</span>
        <span className={s.previewPath}>./golden_set.jsonl</span>
      </div>
      <pre className={s.preJsonl}>{jsonlPreview}</pre>

      <div className={s.previewHead}>
        <span className={s.previewLabel}>{t('export.previewQrels')}</span>
      </div>
      <pre className={s.preQrels}>{qrelsPreview}</pre>

      <div className={s.actions}>
        <button onClick={() => triggerDownload('golden_set.jsonl', buildJsonl(questions, backend))} className={s.btnPrimary}>{t('export.downloadJsonl')}</button>
        <button onClick={() => triggerDownload('golden_set.qrels', buildQrels(questions))} className={s.btnSecondary}>{t('export.downloadQrels')}</button>
      </div>
    </div>
  );
}
