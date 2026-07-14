import { useMemo } from 'react';
import s from './ConfigScreen.module.css';
import { useStore } from '../state/useStore.js';
import { buildYaml, REQ_SAMPLE, RES_SAMPLE } from '../domain/exporters.js';
import Toggle from '../components/Toggle.jsx';

export default function ConfigScreen() {
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
      <div className={s.overline}>Le contrat · un seul point de couplage</div>
      <h1 className={s.title}>Contrat de retrieval</h1>
      <p className={s.intro}>Tout backend qui expose <span className={s.codeChip}>POST /retrieve</span> conforme devient utilisable. Touchstone fait proxy : l'en-tête d'auth ne quitte jamais le serveur.</p>

      <div className={s.contractGrid}>
        <div className={s.contractCard}>
          <div className={s.contractLabel}>Requête</div>
          <pre className={s.pre}>{REQ_SAMPLE}</pre>
        </div>
        <div className={s.contractCard}>
          <div className={s.contractLabel}>Réponse</div>
          <pre className={s.pre}>{RES_SAMPLE}</pre>
        </div>
      </div>

      <div className={s.sectionLabel}>Backends déclarés</div>
      <div className={s.backendList}>
        {backends.map((b) => (
          <div key={b.name} className={s.backendItem}>
            <span className={s.dot} />
            <div className={s.beBody}>
              <div className={s.beTop}>
                <span className={s.beName}>{b.name}</span>
                {backend === b.name && <span className={s.beActive}>actif</span>}
              </div>
              <div className={s.beUrl}>{b.url}</div>
            </div>
            <span className={s.beK}>k={b.k}</span>
            {canRemove && <button onClick={() => removeBackend(b.name)} className={s.beRemove}>×</button>}
          </div>
        ))}
      </div>

      <div className={s.declare}>
        <div className={s.declareTitle}>Déclarer un backend</div>
        <div className={s.declareRow1}>
          <input value={newBackend.name} onChange={(e) => setNewBackend('name', e.target.value)} placeholder="nom (ex. staging)" className={s.input} />
          <input value={newBackend.url} onChange={(e) => setNewBackend('url', e.target.value)} placeholder="https://…/retrieve" className={s.input} />
        </div>
        <div className={s.declareRow2}>
          <input value={newBackend.auth} onChange={(e) => setNewBackend('auth', e.target.value)} placeholder="auth_header (optionnel)" className={s.input} />
          <input value={newBackend.k} onChange={(e) => setNewBackend('k', e.target.value)} placeholder="k" className={s.input} />
          <button onClick={addBackend} className={s.addBtn}>Ajouter</button>
        </div>
        <div className={s.declareNote}>Équivaut à une entrée sous <span className={s.mono105}>backends:</span> dans le YAML ci-dessous — le fichier reste la source de vérité, l'UI l'édite. Le secret d'auth vit côté serveur, jamais dans le navigateur.</div>
      </div>

      <div className={s.yamlHead}>
        <span className={s.sectionLabel} style={{ marginBottom: 0 }}>touchstone.yaml</span>
        <button onClick={toggleJudge} className={s.judgeBtn}>
          Juge LLM (pré-cochage)
          <Toggle on={judgeEnabled} />
        </button>
      </div>
      <pre className={s.yamlPre}>{yaml}</pre>
    </div>
  );
}
