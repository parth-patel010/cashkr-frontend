/**
 * Cascading % price from CategoryQuiz answers (phone-style).
 * Accessories window: deductionValue applies when option is NOT selected.
 * Other multi windows: deduction applies when selected.
 * Single windows: deduction of the chosen option.
 */

function optionDeduction(quiz, optionId, deviceSlug) {
  if (!quiz || !optionId) return 0;

  if (quiz.deductionMode === 'model-wise' && deviceSlug) {
    const override = (quiz.modelDeductions || []).find(
      (d) => d.optionId === optionId && d.deviceSlug === deviceSlug,
    );
    if (override && Number.isFinite(Number(override.value))) {
      return Number(override.value);
    }
  }

  for (const win of quiz.windows || []) {
    const opt = (win.options || []).find((o) => o.id === optionId);
    if (opt) return Number(opt.deductionValue) || 0;
  }
  return 0;
}

/**
 * @param {object} params
 * @param {number} params.basePrice
 * @param {object} params.quiz - CategoryQuiz document
 * @param {Record<string, string|string[]>} params.answers - windowId → optionId or optionId[]
 * @param {string} [params.deviceSlug]
 */
export function calculateCategoryQuizPrice({ basePrice, quiz, answers = {}, deviceSlug }) {
  const breakdown = {};
  let currentPrice = Number(basePrice) || 0;

  const applyPct = (key, pct) => {
    const n = Number(pct) || 0;
    if (n <= 0) return;
    const deduction = Math.round(currentPrice * (n / 100));
    breakdown[key] = n;
    currentPrice = Math.max(currentPrice - deduction, 0);
  };

  for (const win of quiz?.windows || []) {
    const hasAnswer = Object.prototype.hasOwnProperty.call(answers, win.id);
    const ans = answers[win.id];

    if (win.id === 'accessories') {
      if (!hasAnswer) continue;
      for (const opt of win.options || []) {
        const selected = Array.isArray(ans) && ans.includes(opt.id);
        if (!selected) {
          applyPct(`missing_${opt.id}`, optionDeduction(quiz, opt.id, deviceSlug));
        }
      }
      continue;
    }

    if (win.choiceType === 'multi') {
      if (!hasAnswer) continue;
      const selected = Array.isArray(ans) ? ans : [];
      for (const optId of selected) {
        applyPct(`issue_${optId}`, optionDeduction(quiz, optId, deviceSlug));
      }
      continue;
    }

    // single
    if (typeof ans === 'string' && ans) {
      applyPct(`${win.id}_${ans}`, optionDeduction(quiz, ans, deviceSlug));
    }
  }

  const totalDeductionPct =
    basePrice > 0 ? Math.round(((basePrice - currentPrice) / basePrice) * 100) : 0;

  return {
    basePrice,
    totalDeductionPct,
    breakdown,
    finalPrice: Math.max(Math.round(currentPrice), 0),
    rejected: answers.power === 'power_no',
  };
}
