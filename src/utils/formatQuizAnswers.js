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
  glass_crack: 'Glass Crack',
  back_panel: 'Back Panel Damage',
  camera_glass_broken: 'Camera Glass Broken',
};

const MOBILE_TECHNICAL_LABELS = {
  battery_service: 'Battery Warning',
  front_camera: 'Front Camera faulty',
  back_camera: 'Back Camera faulty',
  volume_button: 'Volume button issue',
  wifi_issue: 'Wifi issue',
  finger_touch: 'Finger touch issue',
  face_unlock: 'Face unlock issue',
  speaker_faulty: 'Speaker faulty',
  power_button: 'Power button issue',
  charging_port: 'Charging port issue',
  audio_receiver: 'Audio receiver issue',
  bluetooth: 'Bluetooth issue',
  vibrator: 'Vibrator issue',
  microphone: 'Microphone issue',
  proximity_sensor: 'Proximity sensor',
};

const MOBILE_ACCESSORY_LABELS = {
  Bill: 'GST Valid Bill',
  Box: 'Original Box',
  Charger: 'Original Charger',
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
} = {}) {
  const rows = [];

  if (deviceAge) rows.push({ question: 'Device Age', answer: deviceAge });
  if (underWarranty != null) {
    rows.push({ question: 'Under Warranty', answer: yesNoLabel(underWarranty) });
  }
  if (eSIMSupport) {
    const esimLabel = eSIMSupport === 'esim_only_global'
      ? 'eSIM only (Global variant)'
      : 'Physical SIM + eSIM';
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
