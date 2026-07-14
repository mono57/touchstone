// Hand-drawn inline SVG icons (no icon font / package). All 16x16, currentColor.

export function CheckMark({ size = 13, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.4l3.1 3L13 4.8" />
    </svg>
  );
}

export function SetupIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="2.5" y1="5" x2="13.5" y2="5" /><circle cx="6" cy="5" r="1.9" fill="var(--surface)" />
      <line x1="2.5" y1="11" x2="13.5" y2="11" /><circle cx="10" cy="11" r="1.9" fill="var(--surface)" />
    </svg>
  );
}

export function AnnotateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.4l3.1 3L13 4.8" />
    </svg>
  );
}

export function OverviewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <line x1="6" y1="4" x2="13.5" y2="4" /><line x1="6" y1="8" x2="13.5" y2="8" /><line x1="6" y1="12" x2="13.5" y2="12" />
      <circle cx="3" cy="4" r="0.9" fill="currentColor" stroke="none" /><circle cx="3" cy="8" r="0.9" fill="currentColor" stroke="none" /><circle cx="3" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.5v7.5" /><path d="M5 7l3 3 3-3" /><path d="M3 13h10" />
    </svg>
  );
}

export function ConfigIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2.5C4.6 2.5 5 7.4 3 8c2 0.6 1.6 5.5 3 5.5" /><path d="M10 2.5c1.4 0 1 4.9 3 5.5-2 0.6-1.6 5.5-3 5.5" />
    </svg>
  );
}
