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
