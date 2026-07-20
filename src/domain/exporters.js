// Serialisers for the golden set. Native JSONL (one line per question, keeping
// the full shown-candidate list) and interop qrels (query_id 0 doc_id rel).

export function buildJsonl(questions, backend) {
  return questions.filter(x => x.done).map((x, qi) => JSON.stringify({
    id: 'q_' + String(qi).padStart(3, '0'), query: x.query, lang: x.lang, type: x.type || 'simple', backend,
    k_shown: x.candidates.length,
    candidate_ids: x.candidates.map(c => c.id),
    relevant_ids: x.relevantIds,
    expected_answer: x.expectedAnswer,
    judge_suggested: x.candidates.filter(c => c.judgeSuggested).map(c => c.id),
    annotator: 'me', ts: new Date().toISOString(),
  })).join('\n');
}

export function buildQrels(questions) {
  return questions.filter(x => x.done)
    .flatMap((x, qi) => x.relevantIds.map(id => 'q_' + String(qi).padStart(3, '0') + '  0  ' + id + '  1'))
    .join('\n');
}

// Pretty single-line preview built from one annotated question (fixed ts so the
// preview is stable across renders).
export function sampleJsonl(questions, backend) {
  const d0 = questions.find(x => x.done) || questions[0];
  // No questions yet — show a representative example of the output shape.
  if (!d0) {
    return JSON.stringify({
      id: 'q_000', query: 'How do I rotate my API keys?', lang: 'en', type: 'simple',
      backend: backend || 'local', k_shown: 0,
      candidate_ids: [], relevant_ids: [], expected_answer: '',
      judge_suggested: [], annotator: 'me', ts: '2026-01-01T00:00:00Z',
    }, null, 2);
  }
  return JSON.stringify({
    id: 'q_017', query: d0.query, lang: d0.lang, type: d0.type || 'simple', backend,
    k_shown: d0.candidates.length,
    candidate_ids: d0.candidates.map(c => c.id),
    relevant_ids: d0.relevantIds,
    expected_answer: d0.expectedAnswer,
    judge_suggested: d0.candidates.filter(c => c.judgeSuggested).map(c => c.id),
    annotator: 'me', ts: '2026-07-13T10:22:00Z',
  }, null, 2);
}

export function qrelsSample(questions) {
  return buildQrels(questions) || 'q_000  0  authentication#rotating-credentials  1';
}

export function buildYaml(backends, judgeEnabled) {
  const yamlBackends = backends.map(b => {
    let block = '  - name: ' + b.name + '\n    url: ' + b.url;
    if (b.auth) block += '\n    auth_header: "' + b.auth + '"';
    block += '\n    default_k: ' + b.k;
    return block;
  }).join('\n');
  return 'backends:\n' + yamlBackends +
    '\n\noutput:\n  path: ./golden_set.jsonl\n  formats: [jsonl, qrels]\n\njudge:\n  enabled: ' +
    (judgeEnabled ? 'true' : 'false') +
    '\n  provider: anthropic\n  model: claude-sonnet-5\n  # key via ANTHROPIC_API_KEY, never in the file';
}

export const REQ_SAMPLE = '{ "query": "How do I rotate\n           my API keys?",\n  "k": 20 }';
export const RES_SAMPLE = '{ "results": [\n    { "id": "auth#rotating",\n      "title": "Rotating…",\n      "text": "Create a key…",\n      "score": 0.82 }\n  ] }';
