import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import s from './ConfigScreen.module.css';
import { useStore } from '../state/useStore.js';
import { buildYaml, REQ_SAMPLE, RES_SAMPLE } from '../domain/exporters.js';
import Toggle from '../components/Toggle.jsx';

export default function ConfigScreen() {
  const { t } = useTranslation();
  const backends = useStore(st => st.backends);
  const backend = useStore(st => st.backend);
  const newBackend = useStore(st => st.newBackend);
  const judgeEnabled = useStore(st => st.judgeEnabled);
  const setNewBackend = useStore(st => st.setNewBackend);
  const addBackend = useStore(st => st.addBackend);
  const removeBackend = useStore(st => st.removeBackend);
  const toggleJudge = useStore(st => st.toggleJudge);

  const yaml = useMemo(() => buildYaml(backends, judgeEnabled), [backends, judgeEnabled]);
  const canRemove = backends.length > 1;

  return (
    <div className={s.wrap}>
      <div className={s.overline}>{t('config.overline')}</div>
      <h1 className={s.title}>{t('config.title')}</h1>
      <p className={s.intro}>
        <Trans i18nKey="config.intro" components={{ chip: <span className={s.codeChip} /> }} />
      </p>

      <div className={s.contractGrid}>
        <div className={s.contractCard}>
          <div className={s.contractLabel}>{t('config.request')}</div>
          <pre className={s.pre}>{REQ_SAMPLE}</pre>
        </div>
        <div className={s.contractCard}>
          <div className={s.contractLabel}>{t('config.response')}</div>
          <pre className={s.pre}>{RES_SAMPLE}</pre>
        </div>
      </div>

      <div className={s.sectionLabel}>{t('config.declared')}</div>
      <div className={s.backendList}>
        {backends.map((b) => (
          <div key={b.name} className={s.backendItem}>
            <span className={s.dot} />
            <div className={s.beBody}>
              <div className={s.beTop}>
                <span className={s.beName}>{b.name}</span>
                {backend === b.name && <span className={s.beActive}>{t('config.active')}</span>}
              </div>
              <div className={s.beUrl}>{b.url}</div>
            </div>
            <span className={s.beK}>k={b.k}</span>
            {canRemove && <button onClick={() => removeBackend(b.name)} className={s.beRemove}>×</button>}
          </div>
        ))}
      </div>

      <div className={s.declare}>
        <div className={s.declareTitle}>{t('config.declare')}</div>
        <div className={s.declareRow1}>
          <input value={newBackend.name} onChange={(e) => setNewBackend('name', e.target.value)} placeholder={t('config.namePlaceholder')} className={s.input} />
          <input value={newBackend.url} onChange={(e) => setNewBackend('url', e.target.value)} placeholder={t('config.urlPlaceholder')} className={s.input} />
        </div>
        <div className={s.declareRow2}>
          <input value={newBackend.auth} onChange={(e) => setNewBackend('auth', e.target.value)} placeholder={t('config.authPlaceholder')} className={s.input} />
          <input value={newBackend.k} onChange={(e) => setNewBackend('k', e.target.value)} placeholder={t('config.kPlaceholder')} className={s.input} />
          <button onClick={addBackend} className={s.addBtn}>{t('config.addBtn')}</button>
        </div>
        <div className={s.declareNote}>
          <Trans i18nKey="config.declareNote" components={{ mono: <span className={s.mono105} /> }} />
        </div>
      </div>

      <div className={s.yamlHead}>
        <span className={s.sectionLabel} style={{ marginBottom: 0 }}>touchstone.yaml</span>
        <button onClick={toggleJudge} className={s.judgeBtn}>
          {t('config.judge')}
          <Toggle on={judgeEnabled} />
        </button>
      </div>
      <pre className={s.yamlPre}>{yaml}</pre>
    </div>
  );
}
