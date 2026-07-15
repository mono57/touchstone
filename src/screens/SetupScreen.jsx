import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import s from './SetupScreen.module.css';
import { useStore } from '../state/useStore.js';
import { parseQuestions } from '../lib/parseQuestions.js';

const MANIFEST = [
  { k: 'name', v: '"Chaari docs"' },
  { k: 'id_scheme', v: '"page#anchor"' },
  { k: 'default_k', v: '20' },
  { k: 'languages', v: '["en"]' },
];

export default function SetupScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backends = useStore(st => st.backends);
  const backend = useStore(st => st.backend);
  const k = useStore(st => st.k);
  const questions = useStore(st => st.questions);
  const draft = useStore(st => st.draft);
  const setBackend = useStore(st => st.setBackend);
  const setK = useStore(st => st.setK);
  const setDraft = useStore(st => st.setDraft);
  const addQuestion = useStore(st => st.addQuestion);
  const addQuestions = useStore(st => st.addQuestions);
  const startAnnotating = useStore(st => st.startAnnotating);

  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);

  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow re-importing the same file
    if (!file) return;
    try {
      const text = await file.text();
      const items = parseQuestions(text, file.name);
      if (!items.length) { setImportMsg(t('setup.importError')); return; }
      addQuestions(items);
      setImportMsg(t('setup.imported', { n: items.length }));
    } catch {
      setImportMsg(t('setup.importError'));
    }
  };

  const langs = [...new Set(questions.map(q => q.lang))].join(' · ');

  return (
    <div className={s.wrap}>
      <div className={s.overline}>{t('setup.overline')}</div>
      <h1 className={s.title}>{t('setup.title')}</h1>
      <p className={s.intro}>
        <Trans i18nKey="setup.intro" components={{ em: <em />, chip: <span className={s.codeChip} /> }} />
      </p>

      <div className={s.sectionHead}>
        <span className={s.sectionLabel}>{t('setup.chooseBackend')}</span>
        <span className={s.sectionHint}>
          <Trans i18nKey="setup.hint" components={{ mono: <span className={s.mono11} /> }} />
        </span>
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
                {active && <span className={s.selBadge}>{t('setup.selected')}</span>}
              </div>
              <div className={s.cardUrl}>{b.url}</div>
              <div className={s.cardMeta}>
                <span>k&nbsp;=&nbsp;<span className={s.kv}>{b.k}</span></span>
                <span>{b.health ? t('setup.healthOk') : t('setup.unreachable')}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={s.cols}>
        <div>
          <div className={`${s.sectionLabel} ${s.mb12}`}>{t('setup.manifest')}</div>
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
              <span className={s.sectionLabel}>{t('setup.kLabel')}</span>
              <span className={s.kValue}>{k}</span>
            </div>
            <input type="range" min="5" max="40" step="1" value={k} onChange={(e) => setK(e.target.value)} className={s.kSlider} />
            <div className={s.kNote}>
              <Trans i18nKey="setup.kNote" components={{ em: <em /> }} />
            </div>
          </div>
        </div>

        <div>
          <div className={s.loadHead}>
            <span className={s.sectionLabel}>{t('setup.loadQuestions')}</span>
            <button onClick={() => fileRef.current && fileRef.current.click()} className={s.importBtn}>{t('setup.import')}</button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.json,.jsonl,application/json,text/plain"
              onChange={onFile}
              style={{ display: 'none' }}
            />
          </div>
          <div className={s.loadHint}>
            <Trans i18nKey="setup.loadHint" components={{ mono: <span className={s.mono11} /> }} />
          </div>
          {importMsg && <div className={s.importMsg}>{importMsg}</div>}
          <div className={s.qBox}>
            <div className={s.qBoxHead}>
              <span className={s.qFile}>questions.txt</span>
              <span className={s.qCount}>{t('setup.lines', { n: questions.length, langs })}</span>
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
                placeholder={t('setup.addPlaceholder')}
                className={s.qInput}
              />
              <button onClick={() => addQuestion(draft)} className={s.qAddBtn}>{t('setup.add')}</button>
            </div>
          </div>
          <button onClick={() => { startAnnotating(); navigate('/annotate'); }} className={s.cta}>
            {t('setup.start')}
            <span className={s.ctaArrow}>→</span>
          </button>
          <div className={s.ctaNote}>{t('setup.resumable')}</div>
        </div>
      </div>
    </div>
  );
}
