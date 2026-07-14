// Descriptive statistics over the annotated golden set — used to calibrate the
// two knobs (k and the similarity threshold). These are NOT evaluation metrics.

export function pctl(arr, p) {
  if (!arr.length) return 0;
  const a = [...arr].sort((x, y) => x - y);
  const idx = (a.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? a[lo] : a[lo] + (a[hi] - a[lo]) * (idx - lo);
}

// Compute everything the Overview screen needs, given the questions and the
// (possibly null = auto) similarity threshold.
export function computeCalibration(questions, threshold) {
  const doneQs = questions.filter(x => x.done);
  const baseQs = doneQs.length ? doneQs : questions;

  const relCounts = baseQs.map(x => x.relevantIds.length);
  const kHisto = ['1', '2', '3', '4', '5+'].map((label, i) => {
    const n = i < 4 ? relCounts.filter(c => c === i + 1).length : relCounts.filter(c => c >= 5).length;
    return { label, n };
  });
  const maxH = Math.max(1, ...kHisto.map(h => h.n));
  kHisto.forEach(h => { h.barPct = Math.round((h.n / maxH) * 100); });

  const recK = Math.max(1, Math.ceil(pctl(relCounts, 0.9)));
  const recKmarge = recK + 1;

  const relScores = [], nonScores = [];
  baseQs.forEach(x => {
    x.candidates.forEach(c => {
      (x.relevantIds.includes(c.id) ? relScores : nonScores).push(c.score);
    });
  });

  const suggThresholdNum = relScores.length ? Math.round(pctl(relScores, 0.10) * 100) / 100 : 0.5;
  const thr = (threshold == null ? suggThresholdNum : threshold);

  const relKept = relScores.filter(v => v >= thr).length;
  const relCoverage = relScores.length ? Math.round((relKept / relScores.length) * 100) : 0;
  const nonLeak = nonScores.filter(v => v >= thr).length;

  const relTicks = relScores.map(v => ({ left: v * 100, on: v >= thr }));
  const nonTicks = nonScores.map(v => ({ left: v * 100, on: v >= thr }));

  return {
    calibN: baseQs.length,
    kHisto, recK, recKmarge,
    relTicks, nonTicks,
    thr, suggThresholdNum,
    relCoverage, nonLeak,
  };
}
