/** PlayStation series chips for gaming console model listing. */

export const PLAYSTATION_SERIES = [
  { id: 'ps1', label: 'PlayStation Series 1', patterns: [/\bps\s*1\b/i, /\bplaystation\s*(series\s*)?1\b/i, /\bpsone\b/i] },
  { id: 'ps2', label: 'PlayStation Series 2', patterns: [/\bps\s*2\b/i, /\bplaystation\s*(series\s*)?2\b/i] },
  { id: 'ps3', label: 'PlayStation Series 3', patterns: [/\bps\s*3\b/i, /\bplaystation\s*(series\s*)?3\b/i] },
  { id: 'ps4', label: 'PlayStation Series 4', patterns: [/\bps\s*4\b/i, /\bplaystation\s*(series\s*)?4\b/i] },
  { id: 'ps5', label: 'PlayStation Series 5', patterns: [/\bps\s*5\b/i, /\bplaystation\s*(series\s*)?5\b/i] },
];

export function detectPlaystationSeries(modelName = '') {
  const name = String(modelName || '');
  // Check higher gens first so "PS5" is not misread (unlikely with word boundaries)
  for (let i = PLAYSTATION_SERIES.length - 1; i >= 0; i -= 1) {
    const series = PLAYSTATION_SERIES[i];
    if (series.patterns.some((re) => re.test(name))) return series.id;
  }
  return null;
}

/** Only series that have at least one model in the list. */
export function availablePlaystationSeries(models = []) {
  const counts = Object.fromEntries(PLAYSTATION_SERIES.map((s) => [s.id, 0]));
  for (const m of models) {
    const id = detectPlaystationSeries(m.modelName || m.name || '');
    if (id) counts[id] += 1;
  }
  return PLAYSTATION_SERIES.filter((s) => counts[s.id] > 0).map((s) => ({
    ...s,
    count: counts[s.id],
  }));
}

export function filterModelsByPlaystationSeries(models = [], seriesId) {
  if (!seriesId) return models;
  return models.filter((m) => detectPlaystationSeries(m.modelName || m.name || '') === seriesId);
}
