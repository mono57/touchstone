// Agreement between the LLM judge's suggestions and the human's final labels
// for one question: how many suggestions were kept, how many labels the human
// added on their own, how many suggestions were dropped.
export function agreementOf(x) {
  const sug = new Set(x.candidates.filter(c => c.judgeSuggested).map(c => c.id));
  const rel = new Set(x.relevantIds);
  let kept = 0, added = 0, dropped = 0;
  rel.forEach(id => (sug.has(id) ? kept++ : added++));
  sug.forEach(id => { if (!rel.has(id)) dropped++; });
  return { kept, added, dropped };
}
