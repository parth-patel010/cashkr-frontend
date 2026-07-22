import { isSpecialModel } from './specialModels';
import { RAM_PRICES, STORAGE_PRICES, CPU_PRICES, CPU_GEN_FACTORS } from './laptopPricingData';

// ─── ISSUE DEDUCTION PERCENTAGES ────────────────────────────────────────────
export const ISSUE_DEDUCTIONS = {
  // Physical Issues
  glass_crack: 40,
  back_panel: 17,
  camera_glass_broken: 8,
  // Technical Issues
  battery_service: 13,
  front_camera: 8,
  back_camera: 15,
  volume_button: 4,
  wifi_issue: 39,
  finger_touch: 26,
  face_unlock: 26,
  speaker_faulty: 4,
  power_button: 2,
  charging_port: 10,
  audio_receiver: 7,
  bluetooth: 39,
  vibrator: 2,
  microphone: 2,
  proximity_sensor: 3,
};

// ─── MOBILE PRICE CALCULATOR (Sequential / Cascading deduction model) ───────
// Each deduction is applied to the already-reduced price, NOT the base price.
// Order: Age → Dead → Touch → Screen Originality → Warranty → eSIM → Charger → Box → Issues
export function calculatePrice({
  brand,
  modelName,
  basePrice,
  deviceAge,
  ableToMakeCalls,
  isTouchScreenWorking,
  isScreenOriginal,
  underWarranty,
  eSIMSupport,
  physicalIssues = [],
  technicalIssues = [],
  hasCharger,
  hasBox,
}) {
  const breakdown = {};
  let currentPrice = basePrice;
  const isSpecial = isSpecialModel(brand, modelName);

  // Helper: apply a percentage deduction to currentPrice and record it
  const applyDeduction = (key, pct) => {
    const deduction = Math.round(currentPrice * (pct / 100));
    breakdown[key] = pct;
    currentPrice = Math.max(currentPrice - deduction, 0);
  };

  // 1. Age deduction (applied first to base price)
  const ageDeductions = { '0 - 3 Months': 0, '3 - 6 Months': 7, '6 - 11 Months': 10, 'Above 11 Months': 15 };
  const agePct = isSpecial ? 0 : (ageDeductions[deviceAge] ?? 7);
  if (agePct > 0) applyDeduction('age', agePct);

  // 2. Dead device (cannot make calls) — 90%
  if (ableToMakeCalls === false) {
    applyDeduction('dead', 90);
  }

  // 3. Touch screen faulty — 65%
  if (isTouchScreenWorking === false) {
    applyDeduction('screenFaulty', 65);
  }

  // 4. Non-original screen — 50%
  if (isScreenOriginal === false) {
    applyDeduction('copyScreen', 50);
  }

  // 5. Out of warranty — 15%
  // NOTE: If device is >11 months old, warranty is automatically "No" with NO deduction
  if (!isSpecial && underWarranty === false && deviceAge !== 'Above 11 Months') {
    applyDeduction('outOfWarranty', 0);
  }

  // 6. eSIM only global variant — 6%
  if (eSIMSupport === 'esim_only_global') {
    applyDeduction('eSIM', 6);
  }

  // 7. No charger — 3%
  if (hasCharger === false) {
    applyDeduction('noCharger', 3);
  }

  // 8. No box — 5%
  if (hasBox === false) {
    applyDeduction('noBox', 5);
  }

  // 9. Physical + technical issues (each issue applied sequentially)
  for (const id of [...physicalIssues, ...technicalIssues]) {
    const pct = ISSUE_DEDUCTIONS[id];
    if (pct > 0) {
      applyDeduction(`issue_${id}`, pct);
    }
  }

  const totalDeductionPct = basePrice > 0
    ? Math.round(((basePrice - currentPrice) / basePrice) * 100)
    : 0;

  const finalPrice = Math.max(currentPrice, 0);

  return {
    basePrice,
    totalDeductionPct,
    breakdown,
    finalPrice,
  };
}


function getProcessorValuation(processorStr) {
  if (!processorStr) return { base: 2500, increment: 0 };
  const p = processorStr.toLowerCase();

  const isRyzen = p.includes('ryzen');
  const isLatest = p.includes('12th') || p.includes('13th') || p.includes('14th') || p.includes('ultra') || p.includes('elite') || p.includes('plus') || p.includes('ryzen 3 6th') || p.includes('ryzen 3 7th') || p.includes('ryzen 3 8th') || p.includes('ryzen 5 6th') || p.includes('ryzen 5 7th') || p.includes('ryzen 5 8th') || p.includes('ryzen 7 6th') || p.includes('ryzen 7 7th') || p.includes('ryzen 7 8th') || p.includes('ryzen 9 6th') || p.includes('ryzen AI') || p.includes('series 1') || p.includes('series 2') || p.includes('series 3');

  const isOlderModern = p.includes('8th') || p.includes('9th') || p.includes('10th') || p.includes('11th') || p.includes('2nd gen') || p.includes('3rd gen') || p.includes('4th gen') || p.includes('5th gen') || (isRyzen && !isLatest);

  // Core i9 / Ryzen 9 / Core Ultra 9 / Snapdragon X Elite
  if (p.includes('i9') || p.includes('ryzen 9') || p.includes('ultra 9') || p.includes('elite')) {
    if (isLatest) return { base: 5000, increment: 20000 };
    if (isOlderModern) return { base: 5000, increment: 10000 };
    return { base: 2500, increment: 0 };
  }

  // Core i7 / Ryzen 7 / Core Ultra 7
  if (p.includes('i7') || p.includes('ryzen 7') || p.includes('ultra 7')) {
    if (isLatest) return { base: 5000, increment: 14000 };
    if (isOlderModern) return { base: 5000, increment: 5500 };
    return { base: 2500, increment: 0 };
  }

  // Core i5 / Ryzen 5 / Core Ultra 5
  if (p.includes('i5') || p.includes('ryzen 5') || p.includes('ultra 5')) {
    if (isLatest) return { base: 5000, increment: 8500 };
    if (isOlderModern) return { base: 5000, increment: 3500 };
    return { base: 2500, increment: 0 };
  }

  // Core i3 / Ryzen 3 / Core Ultra 3
  if (p.includes('i3') || p.includes('ryzen 3') || p.includes('ultra 3')) {
    if (isLatest) return { base: 5000, increment: 4500 };
    if (isOlderModern) return { base: 5000, increment: 1500 };
    return { base: 2500, increment: 0 };
  }

  // Default fallbacks for other processors
  if (isLatest || isOlderModern) {
    return { base: 5000, increment: 0 };
  }
  return { base: 2500, increment: 0 };
}

function getProcessorIncrement(processorStr) {
  return getProcessorValuation(processorStr).increment;
}

function getRamIncrement(ramStr) {
  if (!ramStr) return 0;
  const num = parseInt(ramStr) || 0;
  if (num >= 32) return 5500;
  if (num >= 16) return 2800;
  if (num >= 8) return 1200;
  return 0;
}

function getStorageIncrement(storageStr) {
  if (!storageStr) return 0;
  const s = storageStr.toLowerCase();

  let ssdPart = '';
  if (s.includes('+')) {
    const parts = s.split('+');
    ssdPart = parts.find(p => p.includes('ssd')) || '';
  } else if (s.includes('ssd')) {
    ssdPart = s;
  }

  if (!ssdPart) return 0;

  const match = ssdPart.match(/(\d+)\s*(gb|tb)/);
  if (!match) return 0;

  let val = parseInt(match[1]);
  const unit = match[2];
  if (unit === 'tb') {
    val = val * 1024;
  }

  if (val >= 1024) return 4500;
  if (val >= 512) return 2200;
  if (val >= 256) return 1000;
  return 0;
}

function getGpuIncrement(hasGpu, isGpuWorking) {
  if (hasGpu && isGpuWorking) {
    return 5000;
  }
  return 0;
}

function getScreenSizeIncrement(sizeKey) {
  if (sizeKey === '10-11') return 150;
  if (sizeKey === '12-13') return 175;
  if (sizeKey === '14-15') return 210;
  if (sizeKey === 'above15') return 250;
  return 0;
}

function getBrandMultiplier(device) {
  if (!device) return 1.0;

  const brand = (device.brand || '').toLowerCase();
  const m = (device.modelName || '').toLowerCase();

  // Dell
  if (brand === 'dell') {
    if (m.includes('precision') || m.includes('latitude 3000')) {
      return 1.15; // Business
    }
    if (m.includes('gaming') || m.includes('g7') || m.includes('g15') || m.includes('g16') || m.includes('alienware') || m.includes('g5') || m.includes('g3')) {
      return 1.40; // Gaming
    }
    if (m.includes('xps')) {
      return 1.35; // Flagship
    }
    return 1.0; // Budget
  }

  // HP
  if (brand === 'hp') {
    if (m.includes('zbook') || m.includes('specre') || m.includes('spectre')) {
      return 1.15; // Business
    }
    if (m.includes('victus') || m.includes('gaming') || m.includes('omen') || m.includes('power series')) {
      return 1.40; // Gaming
    }
    if (m.includes('envy') || m.includes('probook')) {
      return 1.35; // Flagship
    }
    return 1.0; // Budget
  }

  // Lenovo
  if (brand === 'lenovo') {
    if (m.includes('legion') || m.includes('loq') || m.includes('gaming') || m.includes('edge')) {
      return 1.40; // Gaming
    }
    if (m.includes('yoga') || m.includes('ideapad slim 5i') || m.includes('slim 5i')) {
      return 1.35; // Flagship
    }
    return 1.0; // Budget
  }

  // Asus
  if (brand === 'asus') {
    if (m.includes('proart') || m.includes('zenbook pro') || m.includes('studiobook')) {
      return 1.15; // Business
    }
    if (m.includes('rog') || m.includes('tuf') || m.includes('gaming') || m.includes('zephyrus') || m.includes('strix')) {
      return 1.40; // Gaming
    }
    return 1.0; // Budget
  }

  // Acer
  if (brand === 'acer') {
    if (m.includes('conceptd') || m.includes('swift 3x') || m.includes('travelmate p6') || m.includes('swift 7') || m.includes('swift x') || m.includes('spin 7') || m.includes('aspire 7') || m.includes('travelmate p4')) {
      return 1.15; // Business
    }
    if (m.includes('predator') || m.includes('helios') || m.includes('triton') || m.includes('nitro') || m.includes('21x')) {
      return 1.40; // Gaming
    }
    return 1.0; // Budget
  }

  // Microsoft
  if (brand === 'microsoft') {
    if (m.includes('pro x') || m.includes('pro 7') || m.includes('surface 4') || m.includes('laptop 3') || m.includes('pro 6')) {
      return 1.15; // Business
    }
    return 1.0; // Budget
  }

  // MSI
  if (brand === 'msi') {
    if (m.includes('summit') || m.includes('modern') || m.includes('creator')) {
      return 1.15; // Business
    }
    if (m.includes('raider') || m.includes('series') || m.includes('gl') || m.includes('gp') || m.includes('prestige') || m.includes('stealth') || m.includes('gf') || m.includes('gt') || m.includes('delta') || m.includes('bravo') || m.includes('alpha')) {
      return 1.40; // Gaming
    }
    return 1.0; // Budget
  }

  // Samsung
  if (brand === 'samsung') {
    if (m.includes('ultra') || m.includes('pro') || m.includes('book3') || m.includes('book4') || m.includes('book5') || m.includes('book2') || m.includes('360')) {
      if (m.includes('edge')) {
        return 1.40; // Gaming
      }
      return 1.15; // Business
    }
    return 1.0; // Budget
  }

  // Fallback to database tier
  const tier = (device.tier || '').toLowerCase();
  if (tier === 'gaming' || tier.includes('gaming')) {
    return 1.40;
  }
  if (tier === 'premium' || tier.includes('flagship') || tier.includes('premium')) {
    return 1.35;
  }
  if (tier === 'mid-range' || tier.includes('mid') || tier.includes('business')) {
    return 1.15;
  }

  return 1.0;
}

function getAgeMultiplier(yearBracket) {
  if (yearBracket === 'lessThan1') return 1.15;
  if (yearBracket === 'oneToTwo') return 1.0;
  if (yearBracket === 'twoToThree') return 0.90;
  return 1.0;
}

/** Apple MacBook / iMac — never use Windows CPU/RAM/GPU component pricing. */
export function isAppleMacDevice(device) {
  if (!device) return false;
  const brand = (device.brand || '').toLowerCase().trim();
  const category = (device.category || '').toLowerCase();
  const model = (device.modelName || '').toLowerCase();
  const family = (device.processorFamily || '').toLowerCase();
  return (
    brand === 'apple' ||
    category === 'mac' ||
    model.includes('macbook') ||
    model.includes('imac') ||
    family.startsWith('apple m')
  );
}

/**
 * Relative CPU value for Mac catalog pricing (i5 / M1 = 1.0).
 * Used so Intel i3 quotes land below i5 (Cashify-style), without Windows CPU_PRICES.
 */
function getMacCpuFactor(processorStr) {
  const p = (processorStr || '').toLowerCase();
  if (!p) return 1;

  // Apple Silicon (relative to M1)
  if (p.includes('m4 max')) return 1.55;
  if (p.includes('m4 pro')) return 1.40;
  if (p.includes('m4')) return 1.25;
  if (p.includes('m3 max')) return 1.45;
  if (p.includes('m3 pro')) return 1.30;
  if (p.includes('m3')) return 1.18;
  if (p.includes('m2 max')) return 1.35;
  if (p.includes('m2 pro')) return 1.22;
  if (p.includes('m2')) return 1.10;
  if (p.includes('m1 max')) return 1.25;
  if (p.includes('m1 pro')) return 1.12;
  if (p.includes('m1') || p.includes('apple m')) return 1.00;

  // Intel — absolute vs i5 (=1.0), Cashify: i3≈13k, i5≈20k, i7≈24k
  if (p.includes('i9')) return 1.35;
  if (p.includes('i7')) return 1.20; // 24/20
  if (p.includes('i5')) return 1.00;
  if (p.includes('i3')) return 0.65; // 13/20

  return 1;
}

function isIntelMacProcessor(processorStr) {
  const p = (processorStr || '').toLowerCase();
  return p.includes('intel') || /\bi[3579]\b/.test(p);
}

/** Align Intel Mac catalog quotes with Cashify (~₹30k listed i5 path → ~₹20k). */
const MAC_INTEL_MARKET_FACTOR = 20 / 30;

/**
 * MacBook Pro 2020 — Cashify ~₹32k+. General Intel cut is softened and we add
 * a flat ₹3,000 so quotes sit at/above Cashify (e.g. ₹30k → ₹33k+).
 */
function getMacIntelMarketFactor(device) {
  const m = (device?.modelName || '').toLowerCase();
  if (m.includes('macbook pro') && m.includes('2020')) {
    // 19k → 32k vs previous path that used 20/30:  (32/19)*(20/30) ≈ 1.12
    return (32 / 19) * (20 / 30);
  }
  return MAC_INTEL_MARKET_FACTOR;
}

function isMacBookPro2020(device) {
  const m = (device?.modelName || '').toLowerCase();
  return m.includes('macbook pro') && m.includes('2020');
}

const MACBOOK_PRO_2020_EXTRA = 3000;

export function calculateLaptopPrice(device, selections) {
  const { ram, storage, yearBracket,
    functionalIssues = [], screenIssues = [], bodyIssues = [],
    accessories, powerStatus, screenSize } = selections;

  let basePrice = 0;

  if (isAppleMacDevice(device)) {
    // ── MacBook / Apple logic (catalog base → CPU tier → age → deductions) ──
    const variants = device.variants || [];
    const selectedProcessor = selections.processor || '';

    // Prefer exact variant match including processor when catalog has CPU-specific rows
    let variant =
      variants.find(v =>
        v.processor &&
        selectedProcessor &&
        v.processor === selectedProcessor &&
        (!v.ram || v.ram === ram) &&
        (!v.storage || v.storage === storage)
      ) ||
      variants.find(v =>
        v.ram && v.storage && v.ram === ram && v.storage === storage
      );

    if (!variant && variants.length === 1) {
      variant = variants[0];
    }

    if (variant) {
      basePrice = variant.basePrice;
    } else if (variants.length > 0) {
      const baseline = variants[0];
      basePrice = baseline.basePrice;

      const ramVal = (r) => parseInt(r) || 8;
      basePrice += (ramVal(ram) - ramVal(baseline.ram)) * 200;

      const parseStorage = (s) => {
        if (!s) return 0;
        let totalGB = 0;
        const parts = s.split('+');
        parts.forEach(p => {
          const val = parseInt(p.trim()) || 0;
          const isTB = p.toUpperCase().includes('TB');
          totalGB += isTB ? val * 1024 : val;
        });
        return totalGB;
      };

      basePrice += (parseStorage(storage) - parseStorage(baseline.storage)) * 5;
    }

    // Intel Macs: catalog base is treated as i5-listed.
    // Cashify targets — i5 ≈ ₹20k, i7 ≈ ₹24k (1.2×), i3 ≈ ₹13k (0.65×).
    // Apple Silicon: only relative chip tier vs listed family (no Intel market cut).
    const catalogCpu =
      (variant && variant.processor) ||
      device.processorFamily ||
      '';
    const selectedCpu = selectedProcessor || catalogCpu;

    if (isIntelMacProcessor(selectedCpu) || isIntelMacProcessor(catalogCpu)) {
      // Always scale vs i5=1.0 so selecting i7/i3 actually changes price
      const selectedFactor = getMacCpuFactor(selectedCpu) || 1;
      const marketFactor = getMacIntelMarketFactor(device);
      basePrice = Math.round(basePrice * marketFactor * selectedFactor);
    } else {
      const catalogFactor = getMacCpuFactor(catalogCpu) || 1;
      const selectedFactor = getMacCpuFactor(selectedCpu) || 1;
      if (catalogFactor > 0 && selectedFactor !== catalogFactor) {
        basePrice = Math.round(basePrice * (selectedFactor / catalogFactor));
      }
    }

    // Apple age multipliers & deductions
    const ageMult = device.ageMultipliers?.[yearBracket] || 1;
    let currentPrice = Math.round(basePrice * ageMult);
    if (isMacBookPro2020(device)) {
      currentPrice += MACBOOK_PRO_2020_EXTRA;
    }
    const ageAdjustment = currentPrice - basePrice;

    let powerDeduction = 0;
    if (powerStatus === 'off') {
      powerDeduction = Math.round(basePrice * 0.95);
      currentPrice = Math.max(currentPrice - powerDeduction, 0);
    }

    let functionalDeduction = 0;
    const funcIssues = (functionalIssues || []).filter(i => i !== 'noIssues');
    for (const issue of funcIssues) {
      const pct = device.functionalDeductions?.[issue] || 0;
      if (pct > 0) {
        const deduction = Math.round(currentPrice * (pct / 100));
        functionalDeduction += deduction;
        currentPrice -= deduction;
      }
    }

    let screenDeduction = 0;
    const scrIssues = (screenIssues || []).filter(i => i !== 'noIssue');
    for (const issue of scrIssues) {
      const pct = device.screenDeductions?.[issue] || 0;
      if (pct > 0) {
        const deduction = Math.round(currentPrice * (pct / 100));
        screenDeduction += deduction;
        currentPrice -= deduction;
      }
    }

    let bodyDeduction = 0;
    for (const issue of (bodyIssues || [])) {
      const pct = device.bodyDeductions?.[issue] || 0;
      if (pct > 0) {
        const deduction = Math.round(currentPrice * (pct / 100));
        bodyDeduction += deduction;
        currentPrice -= deduction;
      }
    }

    const accList = Array.isArray(accessories) ? [...accessories] : [];
    if (yearBracket && yearBracket !== 'lessThan1' && !accList.includes('bill')) {
      accList.push('bill');
    }
    const accBonus = accList.reduce((sum, item) => sum + (device.accessoriesBonus?.[item] || 0), 0);
    currentPrice += accBonus;

    const finalPrice = Math.max(Math.round(currentPrice / 100) * 100, 0);

    return {
      basePrice,
      ageAdjustment,
      powerDeduction: -powerDeduction,
      functionalDeduction: -functionalDeduction,
      screenDeduction: -screenDeduction,
      bodyDeduction: -bodyDeduction,
      accessoriesBonus: accBonus,
      finalPrice,
    };
  } else {
    // ── UNIFIED ALGORITHM FOR NON-APPLE LAPTOPS (algorithm-prd.md) ──

    const totalIssueCount =
      (functionalIssues || []).filter(i => i !== 'noIssues').length +
      (screenIssues || []).filter(i => i !== 'noIssue').length +
      (bodyIssues || []).length;

    // 1. Component Base Price
    let componentBase = 0;

    // 1.1 CPU
    const getCpuPrice = (cpu) => {
      if (!cpu) return 3000;
      // Exact lookup
      if (CPU_PRICES[cpu]) return CPU_PRICES[cpu];

      // Fallback fuzz matching
      const c = cpu.toLowerCase();
      let base = 3000;
      if (c.includes('i3')) base = 3500;
      if (c.includes('i5') || c.includes('ryzen 5')) base = 6000;
      if (c.includes('i7') || c.includes('ryzen 7')) base = 9000;
      if (c.includes('i9') || c.includes('ryzen 9')) base = 12000;
      if (c.includes('11th')) base += 500;
      if (c.includes('12th')) base += 2000;
      if (c.includes('13th')) base += 4000;
      if (c.includes('14th')) base += 6000;
      return base;
    };

    const deviceProcessor = selections.processor || (device.generation ? `${device.processorFamily || ''} - ${device.generation}` : (device.processorFamily || ''));
    componentBase += getCpuPrice(deviceProcessor);

    // 1.2 RAM
    const getRamPrice = (r) => {
      if (!r) return 1500;
      if (RAM_PRICES[r]) return RAM_PRICES[r];

      const num = parseInt(r);
      if (num <= 4) return 800;
      if (num <= 8) return 1500;
      if (num <= 16) return 2800;
      if (num <= 32) return 5000;
      return 6000;
    };
    componentBase += getRamPrice(ram);

    // 1.3 Storage
    const getStoragePrice = (s) => {
      if (!s) return 1500;
      if (STORAGE_PRICES[s]) return STORAGE_PRICES[s];

      if (s.includes('512') && s.toLowerCase().includes('ssd')) return 2800;
      if (s.includes('1 TB') || s.includes('1TB')) return 4000;
      if (s.includes('256')) return 1500;
      return 1500;
    };
    componentBase += getStoragePrice(storage);

    // 1.4 GPU
    const getGpuPrice = (hasGpu, isGpuWorking) => {
      if (hasGpu && isGpuWorking) return 4000;
      return 0;
    };
    componentBase += getGpuPrice(selections.hasGpu, selections.isGpuWorking);

    // 1.5 Chassis (Screen Size)
    const getChassisPrice = (size) => {
      if (size === 'above15') return 6000;
      return 5000; // 12-14 inches
    };
    componentBase += getChassisPrice(screenSize);

    // Ensure strict bottom-up calculation per latest rule update
    // No manual overrides allowed.

    // 2. Generation Factor
    const getGenFactor = (cpuStr, gen) => {
      if (CPU_GEN_FACTORS[cpuStr]) return CPU_GEN_FACTORS[cpuStr];
      if (!gen) return 1.00;
      const g = gen.toLowerCase();
      if (g.includes('10th')) return 0.95;
      if (g.includes('11th')) return 1.00;
      if (g.includes('12th')) return 1.08;
      if (g.includes('13th')) return 1.15;
      if (g.includes('14th')) return 1.25;
      return 1.00;
    };
    const genFactor = getGenFactor(deviceProcessor, device.generation || selections.generation);

    // 3. Gaming Factor
    const gamingFactor = device.isGamingLaptop ? 1.02 : 1.00;

    // 4. Model Factor
    const getModelFactor = (brand, series) => {
      const b = (brand || '').toLowerCase();
      const s = (series || '').toLowerCase();
      if (b === 'hp' && s.includes('15')) return 1.000;
      if (b === 'asus' && (s.includes('zenbook') || s.includes('vivobook s'))) return 1.000;
      if (b === 'hp' && s.includes('victus')) return 1.000;
      if (b === 'dell' && s.includes('vostro')) return 1.068;
      if (b === 'dell' && s.includes('g15')) return 1.027;
      if (b === 'lenovo' && s.includes('ideapad 5')) return 1.108;
      if (b === 'dell' && s.includes('inspiron') && s.includes('gaming')) return 1.3804;
      return 1.000;
    };
    const modelFactor = getModelFactor(device.brand, device.modelName);

    // 5. Market Multiplier
    const marketMultiplier = 1.72;
    const marketValue = componentBase * modelFactor * genFactor * gamingFactor * marketMultiplier;

    // 6. Age Factor
    const getAgeFactor = (bracket) => {
      if (bracket === 'lessThan1') return 0.90;
      if (bracket === 'oneToTwo') return 0.80;
      if (bracket === 'twoToThree') return 0.70;
      return 0.60;
    };
    const ageFactor = getAgeFactor(yearBracket);

    // 7. Condition Factor
    const getConditionFactor = (issueCount) => {
      if (issueCount === 0) return 0.95;
      if (issueCount <= 2) return 0.80;
      if (issueCount <= 4) return 0.65;
      return 0.50;
    };
    const conditionFactor = getConditionFactor(totalIssueCount);

    // 8. Screen Size Factor
    const getScreenSizeFactor = (size) => {
      if (size === 'above15' || size === '15') return 1.02;
      return 1.00;
    };
    const screenFactor = getScreenSizeFactor(screenSize);

    // 9. Depreciated Value
    let depreciatedValue = marketValue * ageFactor * conditionFactor * screenFactor;

    // 10. Power status deduction (dead laptop)
    if (powerStatus === 'off') {
      depreciatedValue = depreciatedValue * 0.05;
    }

    // 11. Accessories Bonus
    const accList = Array.isArray(accessories) ? [...accessories] : [];
    const accessoryBonus = accList.includes('charger') ? 300 : 0;

    const finalPrice = Math.max(Math.round((depreciatedValue + accessoryBonus) / 10) * 10, 0);

    return {
      basePrice: Math.round(marketValue),
      ageAdjustment: Math.round(marketValue * (ageFactor - 1)),
      powerDeduction: powerStatus === 'off' ? Math.round(depreciatedValue * -19) : 0,
      functionalDeduction: 0,
      screenDeduction: 0,
      bodyDeduction: 0,
      accessoriesBonus: accessoryBonus,
      finalPrice,
    };
  }
}
