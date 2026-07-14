import s from './Segmented.module.css';

// Reusable labelled segmented control (used for Vue and Densité).
export default function Segmented({ label, value, options, onChange }) {
  return (
    <div className={s.wrap}>
      <span className={s.label}>{label}</span>
      <div className={s.group}>
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={value === o.value ? `${s.seg} ${s.segActive}` : s.seg}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
