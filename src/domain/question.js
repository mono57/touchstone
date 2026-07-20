// Pure factory for a fresh, unannotated question. Candidates start empty and are
// fetched from the active backend on the Annotate screen (see loadCurrent in the
// store); relevance is decided by the annotator, so relevantIds starts empty too.

let counter = 0;

export function makeQuestion(query, lang, type) {
  // Unique id even when importing many at once within the same millisecond.
  const id = 'q_' + String(Date.now()).slice(-6) + '_' + (counter++);
  return {
    id,
    lang: lang || 'en',
    type: type || 'simple',
    query,
    candidates: [],
    relevantIds: [],
    expectedAnswer: '',
    done: false,
  };
}
