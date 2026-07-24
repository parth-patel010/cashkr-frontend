/**
 * HP ZBook Power series price overrides (DeviceKart target prices).
 * Applied BEFORE the Windows Component_Base algorithm for Intel Core i5 configs only.
 */

export const ZBOOK_POWER_OVERRIDES = [
  // i5 · 8GB
  { ramGb: 8, storageGb: 256, age: '1to3', price: 24110 },
  { ramGb: 8, storageGb: 256, age: '3plus', price: 21140 },
  { ramGb: 8, storageGb: 512, age: '1to3', price: 25380 },
  { ramGb: 8, storageGb: 512, age: '3plus', price: 22250 },
  { ramGb: 8, storageGb: 1024, age: '1to3', price: 27530 },
  { ramGb: 8, storageGb: 1024, age: '3plus', price: 24130 },
  { ramGb: 8, storageGb: 2048, age: '1to3', price: 25630 },
  { ramGb: 8, storageGb: 2048, age: '3plus', price: 22470 },
  // i5 · 16GB
  { ramGb: 16, storageGb: 256, age: '1to3', price: 25760 },
  { ramGb: 16, storageGb: 256, age: '3plus', price: 22580 },
  { ramGb: 16, storageGb: 512, age: '1to3', price: 27030 },
  { ramGb: 16, storageGb: 512, age: '3plus', price: 23700 },
  { ramGb: 16, storageGb: 1024, age: '1to3', price: 29180 },
  { ramGb: 16, storageGb: 1024, age: '3plus', price: 25570 },
  { ramGb: 16, storageGb: 2048, age: '1to3', price: 29180 },
  { ramGb: 16, storageGb: 2048, age: '3plus', price: 25570 },
  // i5 · 32GB
  { ramGb: 32, storageGb: 256, age: '1to3', price: 28550 },
  { ramGb: 32, storageGb: 256, age: '3plus', price: 25020 },
  { ramGb: 32, storageGb: 512, age: '1to3', price: 29810 },
  { ramGb: 32, storageGb: 512, age: '3plus', price: 26120 },
  { ramGb: 32, storageGb: 1024, age: '1to3', price: 31970 },
  { ramGb: 32, storageGb: 1024, age: '3plus', price: 28010 },
  { ramGb: 32, storageGb: 2048, age: '1to3', price: 37030 },
  { ramGb: 32, storageGb: 2048, age: '3plus', price: 32440 },
  // i5 · 64GB
  { ramGb: 64, storageGb: 256, age: '1to3', price: 35510 },
  { ramGb: 64, storageGb: 256, age: '3plus', price: 31110 },
  { ramGb: 64, storageGb: 512, age: '1to3', price: 36780 },
  { ramGb: 64, storageGb: 512, age: '3plus', price: 32220 },
  { ramGb: 64, storageGb: 1024, age: '1to3', price: 38930 },
  { ramGb: 64, storageGb: 1024, age: '3plus', price: 34100 },
  { ramGb: 64, storageGb: 2048, age: '1to3', price: 44000 },
  { ramGb: 64, storageGb: 2048, age: '3plus', price: 38540 },
];

function norm(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapOverrideAge(yearBracket) {
  if (yearBracket === 'oneToTwo') return '1to3';
  if (yearBracket === 'twoToThree') return '3plus';
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

function isZbookPowerSeries(device) {
  const text = norm(`${device?.brand || ''} ${device?.modelName || ''}`);
  return text.includes('zbook') && text.includes('power');
}

/** Table lists "Intel Core i5" only — any i5 gen; exclude i7/i9/Ultra/Xeon. */
function isIntelCoreI5(cpu) {
  const c = norm(cpu);
  if (!c) return false;
  if (c.includes('ultra') || c.includes('xeon') || c.includes('ryzen')) return false;
  if (/\bi7\b/.test(c) || /\bi9\b/.test(c) || /\bi3\b/.test(c)) return false;
  return /\bi5\b/.test(c) || c.includes('intel core i5');
}

/**
 * Returns override price (number) or null if no match.
 */
export function findZbookPowerOverridePrice(device, selections = {}) {
  if (!isZbookPowerSeries(device)) return null;

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

  if (!isIntelCoreI5(cpu)) return null;

  const row = ZBOOK_POWER_OVERRIDES.find(
    (r) => r.age === ageKey && r.ramGb === ramGb && r.storageGb === storageGb,
  );

  return row ? row.price : null;
}
