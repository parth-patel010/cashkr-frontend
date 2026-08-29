/**
 * Build human-readable quiz answer rows for admin (Users / Orders View Details).
 * @param {object} quiz - CategoryQuiz with windows/options
 * @param {Record<string, string|string[]>} answers - windowId → optionId or optionId[]
 * @returns {{ question: string, answer: string }[]}
 */
export function formatCategoryQuizAnswerSummary(quiz, answers = {}) {
  const rows = [];
  if (!quiz?.windows?.length) return rows;

  for (const win of quiz.windows) {
    const hasAnswer = Object.prototype.hasOwnProperty.call(answers, win.id);
    if (!hasAnswer) continue;

    const ans = answers[win.id];
    const opts = win.options || [];
    const title = win.title || win.question || win.id;

    if (win.id === 'accessories' || win.choiceType === 'multi') {
      const selected = Array.isArray(ans) ? ans : [];
      if (win.id === 'accessories') {
        const labels = opts
          .filter((o) => selected.includes(o.id))
          .map((o) => o.label || o.id);
        rows.push({
          question: title,
          answer: labels.length ? labels.join(', ') : 'None selected',
        });
      } else {
        const labels = selected
          .map((id) => opts.find((o) => o.id === id)?.label || id)
          .filter(Boolean);
        rows.push({
          question: title,
          answer: labels.length ? labels.join(', ') : 'No issues',
        });
      }
      continue;
    }

    if (typeof ans === 'string' && ans) {
      const opt = opts.find((o) => o.id === ans);
      rows.push({ question: title, answer: opt?.label || ans });
    }
  }

  return rows;
}

/**
 * Laptop quiz answer summary for admin.
 */
export function formatLaptopQuizAnswerSummary({
  specs = {},
  age,
  ageLabel,
  powerStatus,
  screenSize,
  hasTouchScreen,
  isTouchScreenWorking,
  hasGpu,
  isGpuWorking,
  functionalIssues = [],
  screenIssues = [],
  bodyIssues = [],
  accessories = [],
} = {}) {
  const screenLabels = {
    '10-11': '10-11 inches',
    '12-13': '12-13 inches',
    '14-15': '14-15 inches',
    above15: 'Above 15 inches',
  };

  const rows = [];
  if (specs.processor) rows.push({ question: 'Processor', answer: specs.processor });
  if (specs.generation) rows.push({ question: 'Generation', answer: specs.generation });
  if (specs.ram) rows.push({ question: 'RAM', answer: specs.ram });
  if (specs.storage) rows.push({ question: 'Storage', answer: specs.storage });
  if (powerStatus) {
    rows.push({
      question: 'Power Status',
      answer: powerStatus === 'on' ? 'Turns On' : 'Does Not Turn On',
    });
  }
  if (screenSize) {
    rows.push({
      question: 'Screen Size',
      answer: screenLabels[screenSize] || screenSize,
    });
  }
  if (hasTouchScreen === true || hasTouchScreen === 'yes') {
    const working =
      isTouchScreenWorking === true || isTouchScreenWorking === 'yes' ? 'Working' : 'Not Working';
    rows.push({ question: 'Touch Screen', answer: `Available (${working})` });
  } else if (hasTouchScreen === false || hasTouchScreen === 'no') {
    rows.push({ question: 'Touch Screen', answer: 'Not Available' });
  }
  if (hasGpu === true || hasGpu === 'yes') {
    const working =
      isGpuWorking === true || isGpuWorking === 'yes' ? 'Working' : 'Not Working';
    rows.push({ question: 'Graphic Card', answer: `Dedicated (${working})` });
  } else if (hasGpu === false || hasGpu === 'no') {
    rows.push({ question: 'Graphic Card', answer: 'Not Available' });
  }
  rows.push({
    question: 'Functional Issues',
    answer: functionalIssues?.length ? functionalIssues.join(', ') : 'No Issues',
  });
  rows.push({
    question: 'Screen Issues',
    answer: screenIssues?.length ? screenIssues.join(', ') : 'No Issues',
  });
  rows.push({
    question: 'Body Issues',
    answer: bodyIssues?.length ? bodyIssues.join(', ') : 'No Issues',
  });
  rows.push({
    question: 'Accessories',
    answer: accessories?.length ? accessories.join(', ') : 'None',
  });
  if (ageLabel || age) {
    rows.push({ question: 'Device Age', answer: ageLabel || age });
  }
  return rows;
}

const MOBILE_PHYSICAL_LABELS = {
  glass_crack: 'Broken/scratch on device screen',
  screen_spot: 'Dead Spot/Visible line and Discoloration on screen',
  back_panel: 'Scratch/Dent on device body',
  panel_missing: 'Device panel missing/broken',
  camera_glass_broken: 'Camera Glass Broken',
};

const MOBILE_TECHNICAL_LABELS = {
  battery_service: 'Battery Faulty',
  front_camera: 'Front Camera not working',
  back_camera: 'Back Camera not working',
  volume_button: 'Volume Button not working',
  wifi_issue: 'WiFi not working',
  finger_touch: 'Finger Touch not working',
  face_unlock: 'Face Sensor not working',
  speaker_faulty: 'Speaker Faulty',
  power_button: 'Power Button not working',
  charging_port: 'Charging Port not working',
  audio_receiver: 'Audio Receiver not working',
  bluetooth: 'Bluetooth not working',
  vibrator: 'Vibrator is not working',
  microphone: 'Microphone not working',
  proximity_sensor: 'Proximity Sensor not working',
  silent_button: 'Silent Button not working',
};

const MOBILE_ACCESSORY_LABELS = {
  Bill: 'GST Valid Bill',
  Box: 'Original Box',
  Charger: 'Original Charger',
};

const SCREEN_PHYSICAL_DETAIL_LABELS = {
  minor12: '1-2 scratches on screen',
  more2: 'More than 2 scratches on screen',
  cracked: 'Screen cracked/ glass broken',
  chipped: 'Chipped/cracked outside display area',
};

const PANEL_CONDITION_LABELS = {
  none: 'No defect on side or back panel',
  cracked: 'Cracked/ broken side or back panel',
  missing: 'Missing side or back panel',
};

const BENT_CONDITION_LABELS = {
  none: 'Phone not bent',
  loose: 'Loose screen (Gap in screen and body)',
  bent: 'Bent/ curved panel',
};

function yesNoLabel(val) {
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  return val == null ? '—' : String(val);
}

/**
 * Mobile quiz answer summary for admin / pricing agent.
 */
export function formatMobileQuizAnswerSummary({
  deviceAge,
  ableToMakeCalls,
  isTouchScreenWorking,
  isScreenOriginal,
  underWarranty,
  eSIMSupport,
  physicalIssues = [],
  technicalIssues = [],
  accessories = [],
  screenPhysicalDetail,
  panelCondition,
  bentCondition,
} = {}) {
  const rows = [];

  if (deviceAge) rows.push({ question: 'Device Age', answer: deviceAge });
  if (underWarranty != null) {
    rows.push({ question: 'Under Warranty', answer: yesNoLabel(underWarranty) });
  }
  if (eSIMSupport) {
    const esimLabel = eSIMSupport === 'esim_only_global' || eSIMSupport === 'dual'
      ? 'Dual eSIM / eSIM only'
      : 'Single eSIM / Physical + eSIM';
    rows.push({ question: 'SIM Type', answer: esimLabel });
  }
  if (ableToMakeCalls != null) {
    rows.push({ question: 'Able to Make Calls', answer: yesNoLabel(ableToMakeCalls) });
  }
  if (isTouchScreenWorking != null) {
    rows.push({ question: 'Touch Screen Working', answer: yesNoLabel(isTouchScreenWorking) });
  }
  if (isScreenOriginal != null) {
    rows.push({ question: 'Original Screen', answer: yesNoLabel(isScreenOriginal) });
  }

  const physicalLabels = physicalIssues.map((id) => MOBILE_PHYSICAL_LABELS[id] || id);
  rows.push({
    question: 'Physical Issues',
    answer: physicalLabels.length ? physicalLabels.join(', ') : 'None',
  });

  if (screenPhysicalDetail) {
    rows.push({
      question: 'Screen Scratch/Crack Detail',
      answer: SCREEN_PHYSICAL_DETAIL_LABELS[screenPhysicalDetail] || screenPhysicalDetail,
    });
  }
  if (panelCondition) {
    rows.push({
      question: 'Panel Condition',
      answer: PANEL_CONDITION_LABELS[panelCondition] || panelCondition,
    });
  }
  if (bentCondition) {
    rows.push({
      question: 'Bent / Loose Screen',
      answer: BENT_CONDITION_LABELS[bentCondition] || bentCondition,
    });
  }

  const technicalLabels = technicalIssues.map((id) => MOBILE_TECHNICAL_LABELS[id] || id);
  rows.push({
    question: 'Technical Issues',
    answer: technicalLabels.length ? technicalLabels.join(', ') : 'None',
  });

  const accessoryLabels = accessories.map((id) => MOBILE_ACCESSORY_LABELS[id] || id);
  rows.push({
    question: 'Accessories',
    answer: accessoryLabels.length ? accessoryLabels.join(', ') : 'None',
  });

  return rows;
}
