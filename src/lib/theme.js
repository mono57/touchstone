// Theme = a set of CSS custom properties applied inline on the app root.
// color-mix() derives the soft/ink accent variants from --accent, so a single
// accent value recolours the whole UI.
export function themeVars(theme, accent = '#3f9d6d') {
  if (theme === 'dark') {
    return "--bg:oklch(0.176 0.008 250);--surface:oklch(0.212 0.009 250);--surface-2:oklch(0.252 0.009 250);--code-bg:oklch(0.155 0.008 250);--code-ink:oklch(0.86 0.006 250);--border:oklch(0.30 0.008 250);--border-strong:oklch(0.40 0.008 250);--ink:oklch(0.96 0.005 250);--ink-2:oklch(0.82 0.008 250);--muted:oklch(0.67 0.008 250);--accent:" + accent + ";--accent-soft:color-mix(in oklab,var(--accent) 26%,var(--surface));--accent-ink:color-mix(in oklab,var(--accent) 55%,white);--ai:oklch(0.72 0.13 285);--ai-soft:color-mix(in oklab,var(--ai) 24%,var(--surface));--ai-ink:color-mix(in oklab,var(--ai) 50%,white);--shadow:0 1px 2px rgba(0,0,0,0.5);";
  }
  return "--bg:oklch(0.986 0.003 240);--surface:oklch(1 0 0);--surface-2:oklch(0.972 0.004 240);--code-bg:oklch(0.982 0.004 240);--code-ink:oklch(0.30 0.01 250);--border:oklch(0.912 0.005 240);--border-strong:oklch(0.83 0.006 240);--ink:oklch(0.22 0.012 250);--ink-2:oklch(0.37 0.013 250);--muted:oklch(0.47 0.013 250);--accent:" + accent + ";--accent-soft:color-mix(in oklab,var(--accent) 13%,var(--surface));--accent-ink:color-mix(in oklab,var(--accent) 62%,black);--ai:oklch(0.55 0.15 285);--ai-soft:color-mix(in oklab,var(--ai) 11%,var(--surface));--ai-ink:color-mix(in oklab,var(--ai) 78%,black);--shadow:0 1px 2px rgba(20,24,40,0.06),0 1px 3px rgba(20,24,40,0.05);";
}
