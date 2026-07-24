/**
 * Lenovo model price overrides.
 * Prices = Cashify (from sheet) + ₹1,000.
 * Applied BEFORE the Windows Component_Base algorithm.
 *
 * Catalog model names are often "Legion 9i Series" / "Yoga Book 9i Series" / "Yoga 9i Series"
 * (no gen in the title). Gen is inferred from the selected CPU:
 *   - Yoga Book: i7-13 → gen8, Ultra 7 → gen9, Ultra 7/9 Series 2 → gen10
 *   - Yoga 9i: i7-11 → gen6, i7-12 → gen7 (any i7 gen maps to nearest table row)
 *   - Legion 9i: Ultra 9, i9-13, i9-14 (any i9 gen maps to nearest table row)
 */

export const LENOVO_PRICE_OVERRIDES = [
  // Legion 9i — Ultra 9
  { seriesKey: 'legion9i', cpuKey: 'ultra9', ramGb: 8, storageGb: 256, age: '1to3', price: 34360 },
  { seriesKey: 'legion9i', cpuKey: 'ultra9', ramGb: 8, storageGb: 256, age: '3plus', price: 31860 },
  { seriesKey: 'legion9i', cpuKey: 'ultra9', ramGb: 12, storageGb: 256, age: '3plus', price: 32250 },
  { seriesKey: 'legion9i', cpuKey: 'ultra9', ramGb: 16, storageGb: 512, age: '1to3', price: 33650 },
  { seriesKey: 'legion9i', cpuKey: 'ultra9', ramGb: 16, storageGb: 512, age: '3plus', price: 33370 },
  // Legion 9i — i9 (14th gen bucket — all i9 14th / bare i9)
  { seriesKey: 'legion9i', cpuKey: 'i9-14', ramGb: 8, storageGb: 256, age: '1to3', price: 56350 },
  { seriesKey: 'legion9i', cpuKey: 'i9-14', ramGb: 8, storageGb: 256, age: '3plus', price: 52170 },
  { seriesKey: 'legion9i', cpuKey: 'i9-14', ramGb: 16, storageGb: 512, age: '1to3', price: 57990 },
  { seriesKey: 'legion9i', cpuKey: 'i9-14', ramGb: 16, storageGb: 512, age: '3plus', price: 53690 },
  { seriesKey: 'legion9i', cpuKey: 'i9-14', ramGb: 64, storageGb: 1024, age: '1to3', price: 63920 },
  { seriesKey: 'legion9i', cpuKey: 'i9-14', ramGb: 64, storageGb: 1024, age: '3plus', price: 59160 },
  // Legion 9i — i9 13th
  { seriesKey: 'legion9i', cpuKey: 'i9-13', ramGb: 8, storageGb: 256, age: '1to3', price: 54920 },
  { seriesKey: 'legion9i', cpuKey: 'i9-13', ramGb: 8, storageGb: 256, age: '3plus', price: 50850 },
  { seriesKey: 'legion9i', cpuKey: 'i9-13', ramGb: 16, storageGb: 512, age: '1to3', price: 56570 },
  { seriesKey: 'legion9i', cpuKey: 'i9-13', ramGb: 16, storageGb: 512, age: '3plus', price: 52370 },
  // Yoga Book 9i gen 8 — i7-13 (all i7 13th)
  { seriesKey: 'yogaBook9i', cpuKey: 'i7-13', ramGb: 16, storageGb: 512, age: '1to3', price: 39270 },
  { seriesKey: 'yogaBook9i', cpuKey: 'i7-13', ramGb: 16, storageGb: 512, age: '3plus', price: 36370 },
  // Yoga Book 9i gen 9 — Ultra 7
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7', ramGb: 16, storageGb: 512, age: '1to3', price: 30310 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7', ramGb: 16, storageGb: 512, age: '3plus', price: 28120 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7', ramGb: 32, storageGb: 1024, age: '1to3', price: 33950 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7', ramGb: 32, storageGb: 1024, age: '3plus', price: 31480 },
  // Yoga Book 9i gen 10 — Ultra 7 series 2
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7-s2', ramGb: 16, storageGb: 512, age: '1to3', price: 31960 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7-s2', ramGb: 16, storageGb: 512, age: '3plus', price: 29640 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7-s2', ramGb: 32, storageGb: 1024, age: '1to3', price: 35600 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra7-s2', ramGb: 32, storageGb: 1024, age: '3plus', price: 33000 },
  // Yoga Book 9i gen 10 — Ultra 9 series 2
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra9-s2', ramGb: 16, storageGb: 512, age: '1to3', price: 34710 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra9-s2', ramGb: 16, storageGb: 512, age: '3plus', price: 32180 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra9-s2', ramGb: 32, storageGb: 1024, age: '1to3', price: 38350 },
  { seriesKey: 'yogaBook9i', cpuKey: 'ultra9-s2', ramGb: 32, storageGb: 1024, age: '3plus', price: 35540 },
  // Yoga 9i Gen 6 — i7-11 (all i7 11th)
  { seriesKey: 'yoga9i', cpuKey: 'i7-11', ramGb: 16, storageGb: 512, age: '1to3', price: 33260 },
  { seriesKey: 'yoga9i', cpuKey: 'i7-11', ramGb: 16, storageGb: 512, age: '3plus', price: 30840 },
  { seriesKey: 'yoga9i', cpuKey: 'i7-11', ramGb: 8, storageGb: 256, age: '1to3', price: 31690 },
  { seriesKey: 'yoga9i', cpuKey: 'i7-11', ramGb: 8, storageGb: 256, age: '3plus', price: 29390 },
  // Yoga 9i Gen 7 — i7-12 (all i7 12th)
  { seriesKey: 'yoga9i', cpuKey: 'i7-12', ramGb: 8, storageGb: 256, age: '1to3', price: 34290 },
  { seriesKey: 'yoga9i', cpuKey: 'i7-12', ramGb: 8, storageGb: 256, age: '3plus', price: 31790 },
  { seriesKey: 'yoga9i', cpuKey: 'i7-12', ramGb: 16, storageGb: 512, age: '1to3', price: 35860 },
  { seriesKey: 'yoga9i', cpuKey: 'i7-12', ramGb: 16, storageGb: 512, age: '3plus', price: 33240 },
];

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapOverrideAge(yearBracket) {
  if (yearBracket === 'lessThan1' || yearBracket === 'oneToTwo') return '1to3';
  if (yearBracket === 'twoToThree') return '3plus';
  return null;
}

function parseRamGb(ram) {
  const n = parseInt(String(ram || '').replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseStorageGb(storage) {
  if (!storage) return null;
  const s = String(storage).toLowerCase();
  const ssd = s.match(/(\d+(?:\.\d+)?)\s*(tb|gb)\s*ssd/);
  if (ssd) {
    const val = parseFloat(ssd[1]);
    return ssd[2] === 'tb' ? Math.round(val * 1024) : Math.round(val);
  }
  const tb = s.match(/(\d+(?:\.\d+)?)\s*tb/);
  if (tb) return Math.round(parseFloat(tb[1]) * 1024);
  const gb = s.match(/(\d+)\s*gb/);
  if (gb) return parseInt(gb[1], 10);
  const compactTb = s.match(/(\d+(?:\.\d+)?)tb/);
  if (compactTb) return Math.round(parseFloat(compactTb[1]) * 1024);
  const compactGb = s.match(/(\d+)gb/);
  if (compactGb) return parseInt(compactGb[1], 10);
  return null;
}

/** Detect catalog series: Legion 9i / Yoga Book 9i / Yoga 9i */
export function detectLenovoSeriesKey(device) {
  const text = norm(`${device?.brand || ''} ${device?.modelName || ''} ${device?.slug || ''}`);
  if (!text) return null;

  // Yoga Book before Yoga 9i (Book contains "yoga")
  if (
    text.includes('yoga book 9i') ||
    text.includes('yogabook 9i') ||
    text.includes('yoga-book-9i') ||
    (text.includes('yoga book') && text.includes('9i'))
  ) {
    return 'yogaBook9i';
  }

  if (
    text.includes('legion 9i') ||
    text.includes('legion9i') ||
    text.includes('legion-9i')
  ) {
    return 'legion9i';
  }

  // Yoga 9i (not Book)
  if (
    (text.includes('yoga 9i') || text.includes('yoga9i') || text.includes('yoga-9i')) &&
    !text.includes('book')
  ) {
    return 'yoga9i';
  }

  return null;
}

/**
 * Map selected CPU → override cpuKey.
 * All i9 gens → i9-13 or i9-14 bucket; all i7 gens → i7-11 / i7-12 / i7-13.
 */
export function detectLenovoCpuKey(cpu, seriesKey) {
  const c = norm(cpu);
  if (!c) return null;

  const genMatch = c.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s*gen\b/) || c.match(/\bi[379]\s*[- ]?\s*(\d{1,2})\b/);
  const gen = genMatch ? parseInt(genMatch[1], 10) : null;
  const hasSeries2 = c.includes('series 2') || c.includes('series2');

  // Ultra chips
  if (c.includes('ultra 9') || c.includes('ultra9')) {
    // Yoga Book Ultra 9 → gen10 (series 2) table; Legion → plain Ultra 9
    if (seriesKey === 'yogaBook9i' || hasSeries2) return 'ultra9-s2';
    return 'ultra9';
  }
  if (c.includes('ultra 7') || c.includes('ultra7')) {
    if (hasSeries2) return 'ultra7-s2';
    return 'ultra7';
  }

  // i9 — all gens
  if (/\bi9\b/.test(c)) {
    if (gen === 13) return 'i9-13';
    if (gen === 14) return 'i9-14';
    // Bare / other gen i9 → prefer 14 bucket, then 13
    return 'i9-14';
  }

  // i7 — all gens
  if (/\bi7\b/.test(c)) {
    if (gen === 11) return 'i7-11';
    if (gen === 12) return 'i7-12';
    if (gen === 13) return 'i7-13';
    // Bare / other gen: pick by series
    if (seriesKey === 'yogaBook9i') return 'i7-13';
    if (seriesKey === 'yoga9i') return gen && gen >= 12 ? 'i7-12' : 'i7-11';
    return 'i7-13';
  }

  return null;
}

/**
 * Returns override price (number) or null if no match.
 */
export function findLenovoOverridePrice(device, selections = {}) {
  const seriesKey = detectLenovoSeriesKey(device);
  if (!seriesKey) return null;

  const ageKey = mapOverrideAge(selections.yearBracket);
  if (!ageKey) return null;

  const ramGb = parseRamGb(selections.ram);
  const storageGb = parseStorageGb(selections.storage);
  if (ramGb == null || storageGb == null) return null;

  const cpu =
    selections.processor ||
    (device?.generation
      ? `${device.processorFamily || ''} - ${device.generation}`
      : device?.processorFamily || '');

  const cpuKey = detectLenovoCpuKey(cpu, seriesKey);
  if (!cpuKey) return null;

  const candidates = LENOVO_PRICE_OVERRIDES.filter(
    (r) =>
      r.seriesKey === seriesKey &&
      r.age === ageKey &&
      r.ramGb === ramGb &&
      r.storageGb === storageGb,
  );

  if (!candidates.length) return null;

  // 1) Exact CPU key
  const exact = candidates.find((r) => r.cpuKey === cpuKey);
  if (exact) return exact.price;

  // 2) All i9: fall back across i9-14 / i9-13 buckets
  if (cpuKey.startsWith('i9-')) {
    const i9 = candidates.find((r) => r.cpuKey === 'i9-14') || candidates.find((r) => r.cpuKey === 'i9-13');
    if (i9) return i9.price;
  }

  // 3) All i7: fall back across i7 gen buckets for this series
  if (cpuKey.startsWith('i7-')) {
    const order =
      seriesKey === 'yoga9i'
        ? ['i7-12', 'i7-11', 'i7-13']
        : seriesKey === 'yogaBook9i'
          ? ['i7-13', 'i7-12', 'i7-11']
          : ['i7-13', 'i7-12', 'i7-11'];
    for (const key of order) {
      const hit = candidates.find((r) => r.cpuKey === key);
      if (hit) return hit.price;
    }
  }

  // 4) Ultra fallbacks
  if (cpuKey.startsWith('ultra7')) {
    const u7 = candidates.find((r) => r.cpuKey === cpuKey) ||
      candidates.find((r) => r.cpuKey === 'ultra7-s2') ||
      candidates.find((r) => r.cpuKey === 'ultra7');
    if (u7) return u7.price;
  }
  if (cpuKey.startsWith('ultra9')) {
    const u9 = candidates.find((r) => r.cpuKey === cpuKey) ||
      candidates.find((r) => r.cpuKey === 'ultra9-s2') ||
      candidates.find((r) => r.cpuKey === 'ultra9');
    if (u9) return u9.price;
  }

  return null;
}
