import s from './CandidateRow.module.css';
import { CheckMark } from './icons.jsx';

// One candidate row in the "Deux volets" (split) layout list.
export default function CandidateRow({ c, isReading, onToggle, onPick }) {
  return (
    <div className={isReading ? `${s.row} ${s.rowReading}` : s.row} onClick={onPick}>
      <button className={c.selected ? `${s.box} ${s.boxOn}` : s.box} onClick={onToggle}>
        {c.selected && <CheckMark size={12} />}
      </button>
      <div className={s.body}>
        <div className={s.titleRow}>
          <span className={s.title}>{c.title}</span>
          {c.suggested && <span className={s.dotAi} />}
        </div>
        <div className={s.score}>{c.scoreText}</div>
      </div>
    </div>
  );
}
