import { useTranslation } from 'react-i18next';
import s from './CandidateCard.module.css';
import { CheckMark } from './icons.jsx';
import ChunkText from './ChunkText.jsx';

// One candidate passage in the flow layout.
export default function CandidateCard({ c, dense, onToggle }) {
  const { t } = useTranslation();
  const stopLink = (e) => e.preventDefault();
  const cardCls = `${s.card}${dense ? ` ${s.cardDense}` : ''}${c.selected ? ` ${s.cardSelected}` : ''}`;
  return (
    <div className={cardCls}>
      <div className={s.gutter}>
        <button className={c.selected ? `${s.box} ${s.boxOn}` : s.box} onClick={onToggle}>
          {c.selected && <CheckMark size={13} />}
        </button>
        <span className={s.key}>{c.numberKey}</span>
      </div>
      <div className={s.body}>
        <div className={s.titleRow}>
          <span className={s.title}>{c.title}</span>
          {c.suggested && <span className={s.pillAi}><span className={s.dotAi} />{t('candidate.ai')}</span>}
          {c.selected && <span className={s.pillRel}>{t('candidate.relevant')}</span>}
        </div>
        <div className={s.meta}>
          <div className={s.scoreWrap}>
            <span className={s.scoreLabel}>{t('candidate.score')}</span>
            <div className={s.scoreTrack}><div className={s.scoreBar} style={{ width: c.pct + '%' }} /></div>
            <span className={s.scoreVal}>{c.scoreText}</span>
          </div>
          <span className={s.id}>{c.id}</span>
          <span className={s.sources}>
            {c.hasMultiSource && <span className={s.sourcesLabel}>{t('candidate.sources')}</span>}
            {c.sources.map((src, i) => (
              <a key={i} href={src.url} onClick={stopLink} className={s.link}>{src.label} →</a>
            ))}
          </span>
        </div>
        <ChunkText text={c.text} clamp dense={dense} className={s.text} />
      </div>
    </div>
  );
}
