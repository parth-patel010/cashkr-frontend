/**
 * Custom quiz option images from /public/quiz_icons.
 * Filenames keep spaces/special chars as provided — encoded when used as URLs.
 */

const ICON_DIR = '/quiz_icons';

function iconUrl(filename) {
  if (!filename) return null;
  return `${ICON_DIR}/${encodeURIComponent(filename)}`;
}

/** Mobile physical defect IDs → filename */
export const MOBILE_PHYSICAL_ICON_FILES = {
  glass_crack: 'phone_broken_scratches_on_device_screen.png',
  screen_spot: 'Dead_spot_visible_line-and-discoloration_on_screen.png',
  back_panel: 'scratch_dent_on_device_body.png',
  panel_missing: 'device_panel_missing_broken.png',
  camera_glass_broken: 'camera-glass-broken.png',
};

/** Mobile technical issue IDs → filename */
export const MOBILE_TECHNICAL_ICON_FILES = {
  battery_service: 'battery-in-service-{more-then-80%}.png',
  front_camera: 'front_camera not working.png',
  back_camera: 'back_camera_not working.png',
  volume_button: 'volume button not working.png',
  wifi_issue: 'wifi_not_working.png',
  finger_touch: 'finger_touch_notworking.png',
  face_unlock: 'face-sensor-not-working.png',
  speaker_faulty: 'speaker_faulty.png',
  // power_button: pending
  charging_port: 'Charging Port not working.png',
  audio_receiver: 'audio-reciver-not-working.png',
  bluetooth: 'bluethooth-not-working.png',
  vibrator: 'vibrator-is-not-working.png',
  microphone: 'microphone-not-working.png',
  proximity_sensor: 'proximity-sensor-not-working.png',
  silent_button: 'silent-button-not-working.png',
};

/** Mobile accessory IDs → filename */
export const MOBILE_ACCESSORY_ICON_FILES = {
  // Bill: pending
  Box: 'originial-box-with-emi.png',
  Charger: 'originol charger this device.png',
};

/** Laptop functional issue IDs → filename */
export const LAPTOP_FUNCTIONAL_ICON_FILES = {
  keyboard: 'leptop-keyboard-not-working--and-keys-missing-and-not-working.png',
  cdDrive: 'cd-driver-is-not-working.png',
  trackpad: 'leptop-touch-not-working-right-left-touch-faulty.png',
  battery: 'Battery dead-backup- 60 mins-health-80%-cycle-count-800.png',
  speakers: 'Speakers not working;-faulty-cracked-sound.png',
  wifi: 'Wi-Fi not working.png',
  // ports: pending (USB Port not working)
  webcam: 'web-cem not working.png',
  charging: 'Charging Port not working.png',
  hardDisk: 'Hard Drive Missing-Defective.png',
  // motherboard: pending
};

/** Laptop accessory IDs → filename */
export const LAPTOP_ACCESSORY_ICON_FILES = {
  // bill: pending
  box: 'originial-box-with-emi.png',
  charger: 'originol charger this device.png',
};

export function getQuizIconSrc(map, id) {
  const file = map?.[id];
  return file ? iconUrl(file) : null;
}

/**
 * Icons still needed (no matching PNG in public/quiz_icons yet).
 * Keep this list in sync when assets are added.
 */
export const PENDING_QUIZ_ICONS = {
  mobile: {
    technical: ['power_button — Power Button not working'],
    accessories: ['Bill — GST Valid Bill'],
    screenDetail: [
      'minor12 — 1-2 scratches on screen',
      'more2 — More than 2 scratches on screen',
      'cracked — Screen cracked/ glass broken',
      'chipped — Chipped/cracked outside display area',
    ],
    panelCondition: [
      'none — No defect on side or back panel',
      'cracked — Cracked/ broken side or back panel',
      'missing — Missing side or back panel',
    ],
    bentCondition: [
      'none — Phone not bent',
      'loose — Loose screen (Gap in screen and body)',
      'bent — Bent/ curved panel',
    ],
    generalScreen: [
      'ableToMakeCalls yes/no',
      'touchScreen yes/no',
      'originalScreen yes / copy screen',
      'single eSIM / dual eSIM',
    ],
    warranty: [
      'device age brackets (0-3 / 3-6 / 6-11 / Above 11)',
      'under warranty yes/no',
    ],
  },
  laptop: {
    functional: [
      'ports — USB Port not working',
      'motherboard — Motherboard issue',
    ],
    accessories: ['bill — GST Valid Bill'],
    screenBody: [
      'Laptop screen scratch / spots / lines / discoloration options',
      'Laptop body scratch / dent / hinges / panel options',
      'GPU yes/no / working options',
      'Age / power / screen size options',
    ],
  },
  unusedAssets: [
    'battery-helth 80 to 85.png (not mapped — no matching quiz option yet)',
    'finger_touch_not.png (duplicate of finger_touch_notworking.png)',
    'charging-pot-not-working.png (duplicate of Charging Port…)',
    'Wi-Fi not working.png (mobile uses wifi_not_working.png; laptop uses this)',
  ],
};
