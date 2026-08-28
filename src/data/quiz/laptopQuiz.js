export const LAPTOP_STEPS = [
  { id: 'specs', label: 'Specs' },
  { id: 'power', label: 'Power Status' },
  { id: 'screenSize', label: 'Screen Size' },
  { id: 'functional', label: 'Functional Issues' },
  { id: 'screen', label: 'Screen Assessment' },
  { id: 'body', label: 'Body Condition' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'age', label: 'Device Age' },
];

export const LAPTOP_AGE_OPTIONS = [
  { key: 'lessThan1', label: 'Less than 1 year (in warranty)' },
  { key: 'oneToTwo', label: 'Between 1 and 3 years' },
  { key: 'twoToThree', label: 'More than 3 years' },
];

export const LAPTOP_SCREEN_SIZE_OPTIONS = [
  { key: '10-11', label: '10-11 inches' },
  { key: '12-13', label: '12-13 inches' },
  { key: '14-15', label: '14-15 inches' },
  { key: 'above15', label: 'Above 15 inches' },
];

export const LAPTOP_FUNCTIONAL_OPTIONS = [
  { id: 'keyboard', label: 'Keyboard not working / key(s) missing' },
  { id: 'cdDrive', label: 'CD/DVD Drive not working' },
  { id: 'trackpad', label: 'Touchpad not working / click faulty' },
  { id: 'battery', label: 'Battery dead / backup < 60 mins' },
  { id: 'speakers', label: 'Speakers faulty / cracked sound' },
  { id: 'wifi', label: 'Wi-Fi not working' },
  { id: 'ports', label: 'USB Port not working' },
  { id: 'webcam', label: 'Web Cam not working' },
  { id: 'charging', label: 'Charging Port not working' },
  { id: 'hardDisk', label: 'Hard Drive Missing / Defective' },
  { id: 'motherboard', label: 'Motherboard issue (restart/hang/heat)' },
  { id: 'bluetooth', label: 'Bluetooth not working' },
];

export const LAPTOP_SCREEN_OPTIONS = [
  { id: 'screenCracked', label: 'Screen cracked or broken' },
  { id: 'lineDiscolour', label: 'Line, discolouration or spot' },
];

export const LAPTOP_BODY_OPTIONS = [
  { id: 'minorDentTop', label: 'Minor dent on top panel' },
  { id: 'minorDentBase', label: 'Minor dent on base panel' },
  { id: 'majorDentTop', label: 'Major dent on top panel' },
  { id: 'majorDentBase', label: 'Major dent on base panel' },
  { id: 'minorScratch', label: 'Minor scratch on body' },
  { id: 'majorScratch', label: 'Major scratch on body' },
];

export const LAPTOP_ACCESSORY_OPTIONS = [
  { id: 'bill', label: 'GST Valid Bill' },
  { id: 'box', label: 'Original Box' },
  { id: 'charger', label: 'Original Charger' },
];

export const DEFAULT_LAPTOP_QUIZ = {
  processor: '',
  ram: '',
  storage: '',
  powerStatus: 'on',
  screenSize: '14-15',
  hasGpu: 'no',
  isGpuWorking: null,
  issuesList: [],
  screenIssuesList: [],
  bodyIssuesList: [],
  accessories: [],
  age: 'oneToTwo',
};
