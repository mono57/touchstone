import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import s from './ChunkText.module.css';

const cx = (...xs) => xs.filter(Boolean).join(' ');

// Height caps (px) mirroring .clampSm / .clampXs — used to decide whether the
// collapsed preview actually overflows (and thus needs a "Show more" toggle).
const CAP_SM = 132;
const CAP_XS = 66;

// react-markdown ignores raw HTML and sanitises URLs by default, so the only
// component overrides we need are behavioural: open links in a new tab (and
// keep the click from bubbling to a card/row handler) and let wide GFM tables
// scroll horizontally inside a wrapper.
const MD_COMPONENTS = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />
  ),
  table: ({ node, ...props }) => (
    <div className={s.tableWrap}><table {...props} /></div>
  ),
};

// Renders a retrieved chunk's Markdown. In the flow card it clamps to a preview
// with an inline "Show more"; in the reader pane (clamp=false, size='md') it
// renders in full.
export default function ChunkText({ text, clamp = false, dense = false, size = 'sm', className }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const innerRef = useRef(null);

  // A new candidate re-collapses the preview.
  useEffect(() => { setExpanded(false); }, [text]);

  // scrollHeight reports the full content height regardless of the clamp's
  // max-height/overflow, so this is independent of `expanded` — measuring once
  // per (text, density) is enough to know if the preview would be cut.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!clamp || !el) { setOverflowing(false); return; }
    setOverflowing(el.scrollHeight > (dense ? CAP_XS : CAP_SM) + 2);
  }, [text, clamp, dense]);

  const collapsed = clamp && !expanded;

  return (
    <div className={cx(s.prose, size === 'md' && s.proseMd, className)}>
      <div ref={innerRef} className={collapsed ? cx(s.clamped, dense ? s.clampXs : s.clampSm) : undefined}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
          {text || ''}
        </ReactMarkdown>
      </div>
      {clamp && overflowing && (
        <button
          type="button"
          className={s.moreBtn}
          onClick={(e) => { e.stopPropagation(); setExpanded(v => !v); }}
        >
          {expanded ? t('candidate.showLess') : t('candidate.showMore')}
        </button>
      )}
    </div>
  );
}
