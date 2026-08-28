export const MOBILE_STEPS = [
  { id: 'warranty', label: 'Age & Warranty' },
  { id: 'screen', label: 'General & Screen' },
  { id: 'physical', label: 'Physical Issues' },
  { id: 'technical', label: 'Technical Issues' },
  { id: 'accessories', label: 'Accessories' },
];

export const MOBILE_ACCESSORIES = [
  { id: 'Bill', label: 'GST Valid Bill' },
  { id: 'Box', label: 'Original Box' },
  { id: 'Charger', label: 'Original Charger' },
];

export const MOBILE_PHYSICAL_ISSUES = [
  { id: 'glass_crack', label: 'Glass Crack' },
  { id: 'back_panel', label: 'Back Panel Damage' },
  { id: 'camera_glass_broken', label: 'Camera Glass Broken' },
];

export const MOBILE_TECHNICAL_ISSUES = [
  { id: 'battery_service', label: 'Battery Warning' },
  { id: 'front_camera', label: 'Front Camera faulty' },
  { id: 'back_camera', label: 'Back Camera faulty' },
  { id: 'volume_button', label: 'Volume button issue' },
  { id: 'wifi_issue', label: 'Wifi issue' },
  { id: 'finger_touch', label: 'Finger touch issue' },
  { id: 'face_unlock', label: 'Face unlock issue' },
  { id: 'speaker_faulty', label: 'Speaker faulty' },
  { id: 'power_button', label: 'Power button issue' },
  { id: 'charging_port', label: 'Charging port issue' },
  { id: 'audio_receiver', label: 'Audio receiver issue' },
  { id: 'bluetooth', label: 'Bluetooth issue' },
  { id: 'vibrator', label: 'Vibrator issue' },
  { id: 'microphone', label: 'Microphone issue' },
  { id: 'proximity_sensor', label: 'Proximity sensor' },
];

export const MOBILE_AGE_OPTIONS = [
  '0 - 3 Months',
  '3 - 6 Months',
  '6 - 11 Months',
  'Above 11 Months',
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

export const DEFAULT_MOBILE_QUIZ = {
  storage: '',
  deviceAge: '3 - 6 Months',
  underWarranty: true,
  eSIMSupport: 'physical+esim',
  ableToMakeCalls: true,
  isTouchScreenWorking: true,
  isScreenOriginal: true,
  physicalIssues: [],
  technicalIssues: [],
  accessories: [],
};
