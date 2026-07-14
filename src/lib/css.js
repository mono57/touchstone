// Parse a CSS declaration string into a React style object. We use CSS Modules
// for static styling; this helper is reserved for the genuinely *dynamic* inline
// bits (computed widths/positions, theme custom properties, conditional colors)
// where a static class can't express the value.
export function css(str) {
  if (str == null) return {};
  if (typeof str === 'object') return str;
  const o = {};
  String(str).split(';').forEach(function (decl) {
    const idx = decl.indexOf(':');
    if (idx < 0) return;
    let prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) return;
    if (!(prop.charAt(0) === '-' && prop.charAt(1) === '-')) {
      prop = prop.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
    }
    o[prop] = val;
  });
  return o;
}
