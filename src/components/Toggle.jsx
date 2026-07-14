import s from './Toggle.module.css';

// Small on/off pill switch (display-only; the parent handles the click).
export default function Toggle({ on }) {
  return (
    <span className={on ? `${s.pill} ${s.pillOn}` : s.pill}>
      <span className={on ? `${s.knob} ${s.knobOn}` : s.knob} />
    </span>
  );
}
