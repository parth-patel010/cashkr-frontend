/** Cashify mobile calculator — field definitions (labels match live Cashify clicks). */

export const MOBILE_STEPS = [
  { id: 'warranty', label: 'Age & Warranty' },
  { id: 'screen', label: 'General & Screen' },
  { id: 'physical', label: 'Physical Condition' },
  { id: 'technical', label: 'Technical Issues' },
  { id: 'accessories', label: 'Accessories' },
];

export const MOBILE_ACCESSORIES = [
  { id: 'Bill', label: 'GST Valid Bill', desc: 'Valid GST invoice with same IMEI' },
  { id: 'Box', label: 'Original Box', desc: 'Original purchase box' },
  { id: 'Charger', label: 'Original Charger', desc: 'Original charging adapter' },
];

/** Multi-select screen/body defects — IDs map to MOBILE_PHYSICAL_LABELS on backend. */
export const MOBILE_PHYSICAL_ISSUES = [
  { id: 'glass_crack', label: 'Broken/scratch on device screen', desc: 'Screen glass is cracked or scratched' },
  { id: 'screen_spot', label: 'Dead Spot/Visible line and Discoloration on screen', desc: 'Spots, lines or discoloration on screen' },
  { id: 'back_panel', label: 'Scratch/Dent on device body', desc: 'Body scratches or dents' },
  { id: 'panel_missing', label: 'Device panel missing/broken', desc: 'Side or back panel missing or broken' },
  { id: 'camera_glass_broken', label: 'Camera Glass Broken', desc: 'Camera lens glass cracked/broken' },
];

export const MOBILE_TECHNICAL_ISSUES = [
  { id: 'battery_service', label: 'Battery Faulty', pct: '13%' },
  { id: 'front_camera', label: 'Front Camera not working', pct: '8%' },
  { id: 'back_camera', label: 'Back Camera not working', pct: '15%' },
  { id: 'volume_button', label: 'Volume Button not working', pct: '4%' },
  { id: 'wifi_issue', label: 'WiFi not working', pct: '39%' },
  { id: 'finger_touch', label: 'Finger Touch not working', pct: '26%' },
  { id: 'face_unlock', label: 'Face Sensor not working', pct: '26%' },
  { id: 'speaker_faulty', label: 'Speaker Faulty', pct: '4%' },
  { id: 'power_button', label: 'Power Button not working', pct: '2%' },
  { id: 'charging_port', label: 'Charging Port not working', pct: '10%' },
  { id: 'audio_receiver', label: 'Audio Receiver not working', pct: '7%' },
  { id: 'bluetooth', label: 'Bluetooth not working', pct: '39%' },
  { id: 'vibrator', label: 'Vibrator is not working', pct: '2%' },
  { id: 'microphone', label: 'Microphone not working', pct: '2%' },
  { id: 'proximity_sensor', label: 'Proximity Sensor not working', pct: '3%' },
  { id: 'silent_button', label: 'Silent Button not working', pct: '2%' },
];

/** Follow-up when screen defects are reported (Cashify screenPhysicalDetail). */
export const SCREEN_PHYSICAL_DETAIL_OPTIONS = [
  { key: 'minor12', label: '1-2 scratches on screen' },
  { key: 'more2', label: 'More than 2 scratches on screen' },
  { key: 'cracked', label: 'Screen cracked/ glass broken' },
  { key: 'chipped', label: 'Chipped/cracked outside display area' },
];

export const PANEL_CONDITION_OPTIONS = [
  { key: 'none', label: 'No defect on side or back panel' },
  { key: 'cracked', label: 'Cracked/ broken side or back panel' },
  { key: 'missing', label: 'Missing side or back panel' },
];

export const BENT_CONDITION_OPTIONS = [
  { key: 'none', label: 'Phone not bent' },
  { key: 'loose', label: 'Loose screen (Gap in screen and body)' },
  { key: 'bent', label: 'Bent/ curved panel' },
];

export const SCREEN_PHYSICAL_DETAIL_LABELS = {
  minor12: '1-2 scratches on screen',
  more2: 'More than 2 scratches on screen',
  cracked: 'Screen cracked/ glass broken',
  chipped: 'Chipped/cracked outside display area',
};

export const PANEL_CONDITION_LABELS = {
  none: 'No defect on side or back panel',
  cracked: 'Cracked/ broken side or back panel',
  missing: 'Missing side or back panel',
};

export const BENT_CONDITION_LABELS = {
  none: 'Phone not bent',
  loose: 'Loose screen (Gap in screen and body)',
  bent: 'Bent/ curved panel',
};

export const MOBILE_AGE_OPTIONS = [
  '0 - 3 Months',
  '3 - 6 Months',
  '6 - 11 Months',
  'Above 11 Months',
];

export const ESIM_OPTIONS = [
  { key: 'single', label: 'Single eSIM' },
  { key: 'dual', label: 'Dual eSIM' },
];

export function supportsESIM(modelName) {
  if (!modelName) return false;
  const name = modelName.toLowerCase();
  const allowed = [
    'iphone 13 pro', 'iphone 13 pro max',
    'iphone 14 pro', 'iphone 14 pro max',
    'iphone 15 pro', 'iphone 15 pro max',
    'iphone 16 pro', 'iphone 16 pro max',
    'iphone 17', 'iphone 17 air',
    'iphone 17 pro', 'iphone 17 pro max',
  ];
  return allowed.some((pattern) => name.includes(pattern));
}

/** Map UI eSIM choice to payload used by automation. */
export function toEsimPayload(key) {
  if (key === 'dual' || key === 'esim_only_global') return 'esim_only_global';
  return 'physical+esim';
}

export function fromEsimPayload(value) {
  if (value === 'esim_only_global' || value === 'dual') return 'dual';
  return 'single';
}

export const DEFAULT_MOBILE_QUIZ = {
  storage: '',
  deviceAge: null,
  underWarranty: null,
  eSIMSupport: null,
  ableToMakeCalls: null,
  isTouchScreenWorking: null,
  isScreenOriginal: null,
  physicalIssues: [],
  technicalIssues: [],
  accessories: [],
  screenPhysicalDetail: null,
  panelCondition: null,
  bentCondition: null,
};
