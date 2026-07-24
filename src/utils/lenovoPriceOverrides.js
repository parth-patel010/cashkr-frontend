/**
 * Lenovo model price overrides.
 * Prices = Cashify (from sheet) + ₹1,000.
 * Applied BEFORE the Windows Component_Base algorithm when series/CPU/RAM/storage/age match.
 */

export const LENOVO_PRICE_OVERRIDES = [
  // Legion 9i — Ultra 9
  { series: 'Legion 9i', cpu: 'Intel Core Ultra 9', ramGb: 8, storageGb: 256, age: '1to3', price: 34360 },
  { series: 'Legion 9i', cpu: 'Intel Core Ultra 9', ramGb: 8, storageGb: 256, age: '3plus', price: 31860 },
  { series: 'Legion 9i', cpu: 'Intel Core Ultra 9', ramGb: 12, storageGb: 256, age: '3plus', price: 32250 },
  { series: 'Legion 9i', cpu: 'Intel Core Ultra 9', ramGb: 16, storageGb: 512, age: '1to3', price: 33650 },
  { series: 'Legion 9i', cpu: 'Intel Core Ultra 9', ramGb: 16, storageGb: 512, age: '3plus', price: 33370 },
  // Legion 9i — i9-14
  { series: 'Legion 9i', cpu: 'Intel Core i9-14', ramGb: 8, storageGb: 256, age: '1to3', price: 56350 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-14', ramGb: 8, storageGb: 256, age: '3plus', price: 52170 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-14', ramGb: 16, storageGb: 512, age: '1to3', price: 57990 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-14', ramGb: 16, storageGb: 512, age: '3plus', price: 53690 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-14', ramGb: 64, storageGb: 1024, age: '1to3', price: 63920 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-14', ramGb: 64, storageGb: 1024, age: '3plus', price: 59160 },
  // Legion 9i — i9-13
  { series: 'Legion 9i', cpu: 'Intel Core i9-13', ramGb: 8, storageGb: 256, age: '1to3', price: 54920 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-13', ramGb: 8, storageGb: 256, age: '3plus', price: 50850 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-13', ramGb: 16, storageGb: 512, age: '1to3', price: 56570 },
  { series: 'Legion 9i', cpu: 'Intel Core i9-13', ramGb: 16, storageGb: 512, age: '3plus', price: 52370 },
  // Yoga Book 9i gen 8
  { series: 'Yoga Book 9i gen 8', cpu: 'Intel Core i7-13', ramGb: 16, storageGb: 512, age: '1to3', price: 39270 },
  { series: 'Yoga Book 9i gen 8', cpu: 'Intel Core i7-13', ramGb: 16, storageGb: 512, age: '3plus', price: 36370 },
  // Yoga Book 9i gen 9
  { series: 'Yoga Book 9i gen 9', cpu: 'Intel Core Ultra 7', ramGb: 16, storageGb: 512, age: '1to3', price: 30310 },
  { series: 'Yoga Book 9i gen 9', cpu: 'Intel Core Ultra 7', ramGb: 16, storageGb: 512, age: '3plus', price: 28120 },
  { series: 'Yoga Book 9i gen 9', cpu: 'Intel Core Ultra 7', ramGb: 32, storageGb: 1024, age: '1to3', price: 33950 },
  { series: 'Yoga Book 9i gen 9', cpu: 'Intel Core Ultra 7', ramGb: 32, storageGb: 1024, age: '3plus', price: 31480 },
  // Yoga Book 9i gen 10 — Ultra 7 series 2
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 7 series 2', ramGb: 16, storageGb: 512, age: '1to3', price: 31960 },
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 7 series 2', ramGb: 16, storageGb: 512, age: '3plus', price: 29640 },
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 7 series 2', ramGb: 32, storageGb: 1024, age: '1to3', price: 35600 },
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 7 series 2', ramGb: 32, storageGb: 1024, age: '3plus', price: 33000 },
  // Yoga Book 9i gen 10 — Ultra 9 series 2
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 9 series 2', ramGb: 16, storageGb: 512, age: '1to3', price: 34710 },
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 9 series 2', ramGb: 16, storageGb: 512, age: '3plus', price: 32180 },
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 9 series 2', ramGb: 32, storageGb: 1024, age: '1to3', price: 38350 },
  { series: 'Yoga Book 9i gen 10', cpu: 'Intel Core Ultra 9 series 2', ramGb: 32, storageGb: 1024, age: '3plus', price: 35540 },
  // Yoga 9i Gen 6
  { series: 'Yoga 9i Gen 6', cpu: 'Intel Core i7-11', ramGb: 16, storageGb: 512, age: '1to3', price: 33260 },
  { series: 'Yoga 9i Gen 6', cpu: 'Intel Core i7-11', ramGb: 16, storageGb: 512, age: '3plus', price: 30840 },
  { series: 'Yoga 9i Gen 6', cpu: 'Intel Core i7-11', ramGb: 8, storageGb: 256, age: '1to3', price: 31690 },
  { series: 'Yoga 9i Gen 6', cpu: 'Intel Core i7-11', ramGb: 8, storageGb: 256, age: '3plus', price: 29390 },
  // Yoga 9i Gen 7
  { series: 'Yoga 9i Gen 7', cpu: 'Intel Core i7-12', ramGb: 8, storageGb: 256, age: '1to3', price: 34290 },
  { series: 'Yoga 9i Gen 7', cpu: 'Intel Core i7-12', ramGb: 8, storageGb: 256, age: '3plus', price: 31790 },
  { series: 'Yoga 9i Gen 7', cpu: 'Intel Core i7-12', ramGb: 16, storageGb: 512, age: '1to3', price: 35860 },
  { series: 'Yoga 9i Gen 7', cpu: 'Intel Core i7-12', ramGb: 16, storageGb: 512, age: '3plus', price: 33240 },
];

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Map quiz age bracket → override age key. */
function mapOverrideAge(yearBracket) {
  if (yearBracket === 'oneToTwo') return '1to3'; // Between 1 and 3 years
  if (yearBracket === 'twoToThree') return '3plus'; // More than 3 years
  // lessThan1 has no rows in this table
  return null;
}

function parseRamGb(ram) {
  const n = parseInt(String(ram || ''), 10);
  return Number.isFinite(n) ? n : null;
}

function parseStorageGb(storage) {
  if (!storage) return null;
  const s = String(storage).toLowerCase();
  const tb = s.match(/(\d+(?:\.\d+)?)\s*tb/);
  if (tb) return Math.round(parseFloat(tb[1]) * 1024);
  const gb = s.match(/(\d+)\s*gb/);
  if (gb) return parseInt(gb[1], 10);
  return null;
}

/**
 * Normalize CPU labels so table shorthand matches selector strings.
 * e.g. "Intel Core i9 - 14th Gen" ↔ "Intel Core i9-14"
 *      "Intel Core Ultra 7 Series 2" ↔ "Intel Core Ultra 7 series 2"
 */
function normalizeCpuForOverride(cpu) {
  let c = norm(cpu);
  // i7/i9 "14th gen" → i7 14 / i9 14
  c = c.replace(/\b(\d+)(?:st|nd|rd|th)\s*gen\b/g, '$1');
  // "core i9 14" already fine; also "i9 14th"
  c = c.replace(/\bintel core\b/g, 'intel core');
  return c;
}

function cpuMatches(selectedCpu, tableCpu) {
  const a = normalizeCpuForOverride(selectedCpu);
  const b = normalizeCpuForOverride(tableCpu);
  if (!a || !b) return false;
  if (a === b) return true;

  // Compact compare without spaces: "intelcorei914" vs "intelcorei9 14"
  const ac = a.replace(/\s+/g, '');
  const bc = b.replace(/\s+/g, '');
  if (ac === bc) return true;

  // Ultra series: require series number when table specifies it
  if (b.includes('series')) {
    return ac.includes(bc) || bc.includes(ac);
  }

  // Avoid Ultra 7 matching Ultra 9
  if (b.includes('ultra') && a.includes('ultra')) {
    return ac === bc || a === b;
  }

  // i7-13 / i9-14 style
  return ac === bc || a.includes(b) || b.includes(a);
}

function seriesMatches(modelName, brand, tableSeries) {
  const model = norm(`${brand || ''} ${modelName || ''}`);
  const series = norm(tableSeries);
  if (!model || !series) return false;

  // Prefer longer / more specific series first (caller should sort)
  if (model.includes(series)) return true;

  // Soft variants: "yoga book 9i gen 8" vs "yoga book 9i 8"
  const seriesLoose = series
    .replace(/\bgen\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const modelLoose = model
    .replace(/\bgen\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return modelLoose.includes(seriesLoose);
}

/**
 * Returns override price (number) or null if no match.
 */
export function findLenovoOverridePrice(device, selections = {}) {
  const brand = (device?.brand || '').toLowerCase();
  const modelName = device?.modelName || '';
  if (brand && !brand.includes('lenovo') && !norm(modelName).includes('lenovo')) {
    // Still allow match if model clearly contains Legion / Yoga 9i without brand set
    const m = norm(modelName);
    if (!m.includes('legion') && !m.includes('yoga')) return null;
  }

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

  // Longer series names first so "Yoga Book 9i gen 10" wins over shorter fragments
  const rows = [...LENOVO_PRICE_OVERRIDES].sort(
    (a, b) => norm(b.series).length - norm(a.series).length,
  );

  for (const row of rows) {
    if (row.age !== ageKey) continue;
    if (row.ramGb !== ramGb) continue;
    if (row.storageGb !== storageGb) continue;
    if (!seriesMatches(modelName, device?.brand, row.series)) continue;
    if (!cpuMatches(cpu, row.cpu)) continue;
    return row.price;
  }

  return null;
}
