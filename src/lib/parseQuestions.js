// Parse an imported questions file into a normalized list of
// { question, lang, type }. Accepts:
//   • .json   — an array of objects ({ question|query, lang?, type? }) or of strings,
//               or an object with a top-level `questions` array
//   • .jsonl  — one JSON object (or bare string) per line
//   • .txt    — one question per line
// Lenient: unknown/empty entries are dropped. Throws only on malformed JSON.
export function parseQuestions(text, name = '') {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const trimmed = (text || '').trim();
  if (!trimmed) return [];

  const norm = (item) => {
    if (item == null) return null;
    if (typeof item === 'string') {
      const q = item.trim();
      return q ? { question: q, lang: 'en', type: 'simple' } : null;
    }
    if (typeof item === 'object') {
      const q = String(item.question ?? item.query ?? item.q ?? '').trim();
      if (!q) return null;
      return {
        question: q,
        lang: (item.lang || item.language || 'en').toString().slice(0, 5),
        type: (item.type || 'simple').toString(),
      };
    }
    return null;
  };

  const looksJsonl = ext === 'jsonl';
  const looksJson = ext === 'json' || (!looksJsonl && (trimmed[0] === '[' || trimmed[0] === '{'));

  if (looksJsonl) {
    return trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      .map(l => { try { return norm(JSON.parse(l)); } catch { return norm(l); } })
      .filter(Boolean);
  }

  if (looksJson) {
    let data;
    try {
      data = JSON.parse(trimmed);
    } catch (e) {
      throw new Error('Invalid JSON: ' + e.message);
    }
    const arr = Array.isArray(data)
      ? data
      : (data && Array.isArray(data.questions) ? data.questions : [data]);
    return arr.map(norm).filter(Boolean);
  }

  // Plain text: one question per line.
  return trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    .map(l => norm(l)).filter(Boolean);
}
