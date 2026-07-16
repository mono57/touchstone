// Calls a backend's POST /retrieve contract and maps the response to the
// candidate shape the annotation UI expects. Backend-agnostic: the only
// coupling is the {query, k} -> {results:[{id,title,text,url,score}]} contract.

function headersFor(backend) {
  const headers = { 'Content-Type': 'application/json' };
  // `auth` is a raw header line, e.g. "Authorization: Bearer <token>".
  if (backend && backend.auth) {
    const sep = backend.auth.indexOf(':');
    if (sep > -1) {
      const name = backend.auth.slice(0, sep).trim();
      const value = backend.auth.slice(sep + 1).trim();
      if (name && value) headers[name] = value;
    }
  }
  return headers;
}

export async function retrieveCandidates(backend, query, k) {
  const res = await fetch(backend.url, {
    method: 'POST',
    headers: headersFor(backend),
    body: JSON.stringify({ query, k: k || backend.k || 20 }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map((r) => ({
    id: r.id,
    title: r.title || r.id,
    text: r.text || '',
    url: r.url || null,
    score: typeof r.score === 'number' ? r.score : 0,
    // The retrieve contract has no judge/sources; those are Touchstone concerns.
    judgeSuggested: false,
    sources: null,
  }));
}
