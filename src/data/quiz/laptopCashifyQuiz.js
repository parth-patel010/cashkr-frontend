/** Cashify laptop calculator — field definitions (labels match live Cashify API). */

export const BODY_SCRATCH_OPTIONS = [
  { key: 'none', label: 'No Scratches' },
  { key: 'minor', label: 'Minor Scratch on Body' },
  { key: 'major', label: 'Major Scratch on Body' },
];

export const DENT_TOP_OPTIONS = [
  { key: 'none', label: 'No Dents on top panel' },
  { key: 'minor2', label: 'Upto 2 Minor Dents' },
  { key: 'minorMore2', label: 'More than 2 Minor Dents' },
  { key: 'major', label: '1 or more Major Dents' },
];

export const DENT_BASE_OPTIONS = [
  { key: 'none', label: 'No Dents on base panel' },
  { key: 'minor2', label: 'Upto 2 Minor Dents' },
  { key: 'minorMore2', label: 'More than 2 Minor Dents' },
  { key: 'major', label: '1 or more Major Dents' },
];

export const LOOSE_HINGES_OPTIONS = [
  { key: 'no', label: 'No Loose Hinges' },
  { key: 'yes', label: 'Yes - Loose Hinges' },
];

export const PANEL_OPTIONS = [
  { key: 'none', label: 'No Cracked or Loose Panel' },
  { key: 'loose', label: 'Loose Panel' },
  { key: 'crack', label: 'Crack/Damage Panel' },
];

export const SCREEN_SCRATCH_OPTIONS = [
  { key: 'none', label: 'No scratches on screen' },
  { key: 'minor12', label: '1-2 scratches on screen' },
  { key: 'minorMore2', label: 'More than 2 scratches on screen' },
  { key: 'cracked', label: 'Screen Cracked or Broken' },
];

export const SCREEN_DISCOLOUR_OPTIONS = [
  { key: 'none', label: 'No Discolouration' },
  { key: 'minor', label: 'Minor Discolouration' },
  { key: 'major', label: 'Major Discolouration' },
];

export const SCREEN_SPOTS_OPTIONS = [
  { key: 'none', label: 'No spots on screen' },
  { key: 'minor12', label: '1-2 minor spots on screen' },
  { key: 'heavy', label: 'Large/ heavy visible spots on screen' },
];

export const SCREEN_LINES_OPTIONS = [
  { key: 'none', label: 'No Lines' },
  { key: 'visible', label: 'Visible lines on Screen' },
  { key: 'flickering', label: 'Display Flickering' },
  { key: 'blackDots', label: 'Black Dots on Screen' },
];

export const SCREEN_ORIGINAL_OPTIONS = [
  { key: 'yes', label: 'Screen is original' },
  { key: 'no', label: 'Screen replaced (not original)' },
];

export const SOFTWARE_OPTIONS = [
  { key: 'no', label: 'No software issue' },
  { key: 'yes', label: 'Laptop have Software issue' },
];

export const CASHIFY_BODY_LABELS = {
  bodyScratch: { none: 'No Scratches', minor: 'Minor Scratch on Body', major: 'Major Scratch on Body' },
  dentTop: { none: 'No Dents on top panel', minor2: 'Upto 2 Minor Dents', minorMore2: 'More than 2 Minor Dents', major: '1 or more Major Dents' },
  dentBase: { none: 'No Dents on base panel', minor2: 'Upto 2 Minor Dents', minorMore2: 'More than 2 Minor Dents', major: '1 or more Major Dents' },
  looseHinges: { no: 'No Loose Hinges', yes: 'Yes - Loose Hinges' },
  panelCondition: { none: 'No Cracked or Loose Panel', loose: 'Loose Panel', crack: 'Crack/Damage Panel' },
};

export const CASHIFY_SCREEN_LABELS = {
  screenScratch: { none: 'No scratches on screen', minor12: '1-2 scratches on screen', minorMore2: 'More than 2 scratches on screen', cracked: 'Screen Cracked or Broken' },
  screenDiscolouration: { none: 'No Discolouration', minor: 'Minor Discolouration', major: 'Major Discolouration' },
  screenSpots: { none: 'No spots on screen', minor12: '1-2 minor spots on screen', heavy: 'Large/ heavy visible spots on screen' },
  screenLines: { none: 'No Lines', visible: 'Visible lines on Screen', flickering: 'Display Flickering', blackDots: 'Black Dots on Screen' },
  softwareIssue: { no: 'No software issue', yes: 'Laptop have Software issue' },
};

export const DEFAULT_CASHIFY_BODY = {
  bodyScratch: 'none',
  dentTop: 'none',
  dentBase: 'none',
  looseHinges: 'no',
  panelCondition: 'none',
};

export const DEFAULT_CASHIFY_SCREEN = {
  screenScratch: 'none',
  screenDiscolouration: 'none',
  screenSpots: 'none',
  screenLines: 'none',
  isScreenOriginal: 'yes',
};

/** Derive legacy issue arrays for internal price calculator. */
export function toLegacyBodyIssues(body = {}) {
  const issues = [];
  if (body.bodyScratch === 'minor') issues.push('minorScratch');
  if (body.bodyScratch === 'major') issues.push('majorScratch');
  if (['minor2', 'minorMore2'].includes(body.dentTop)) issues.push('minorDentTop');
  if (body.dentTop === 'major') issues.push('majorDentTop');
  if (['minor2', 'minorMore2'].includes(body.dentBase)) issues.push('minorDentBase');
  if (body.dentBase === 'major') issues.push('majorDentBase');
  if (body.looseHinges === 'yes') issues.push('looseHinges');
  if (body.panelCondition === 'loose') issues.push('loosePanel');
  if (body.panelCondition === 'crack') issues.push('crackedPanel');
  return issues;
}

export function toLegacyScreenIssues(screen = {}) {
  const issues = [];
  if (screen.screenScratch === 'cracked') issues.push('screenCracked');
  if (['minor12', 'minorMore2'].includes(screen.screenScratch)) issues.push('screenScratch');
  if (['minor', 'major'].includes(screen.screenDiscolouration)) issues.push('lineDiscolour');
  if (['minor12', 'heavy'].includes(screen.screenSpots)) issues.push('screenSpots');
  if (['visible', 'flickering', 'blackDots'].includes(screen.screenLines)) issues.push('lineDiscolour');
  return [...new Set(issues)];
}

export function deriveScreenOverall(screen = {}) {
  if (screen.screenScratch === 'cracked') return 'Damaged';
  if (['major'].includes(screen.screenDiscolouration) || screen.screenSpots === 'heavy') return 'Damaged';
  if (['minor12', 'minorMore2'].includes(screen.screenScratch)
    || ['minor', 'major'].includes(screen.screenDiscolouration)
    || ['minor12', 'heavy'].includes(screen.screenSpots)
    || ['visible', 'flickering', 'blackDots'].includes(screen.screenLines)) {
    return 'Average';
  }
  if (screen.screenScratch === 'minorMore2') return 'Good';
  return 'Flawless';
}

function pickLabel(options, key) {
  return options.find((o) => o.key === key)?.label || key || '—';
}

export function buildCashifyAnswerSummary(fields = {}) {
  const rows = [];
  if (fields.bodyScratch) rows.push({ question: 'Scratch on Body', answer: pickLabel(BODY_SCRATCH_OPTIONS, fields.bodyScratch) });
  if (fields.dentTop) rows.push({ question: 'Dent on Top Panel', answer: pickLabel(DENT_TOP_OPTIONS, fields.dentTop) });
  if (fields.dentBase) rows.push({ question: 'Dent on Base Panel', answer: pickLabel(DENT_BASE_OPTIONS, fields.dentBase) });
  if (fields.looseHinges) rows.push({ question: 'Loose Hinges', answer: pickLabel(LOOSE_HINGES_OPTIONS, fields.looseHinges) });
  if (fields.panelCondition) rows.push({ question: 'Cracked or Loose Panel', answer: pickLabel(PANEL_OPTIONS, fields.panelCondition) });
  if (fields.screenScratch) rows.push({ question: 'Scratch or Broken on Screen', answer: pickLabel(SCREEN_SCRATCH_OPTIONS, fields.screenScratch) });
  if (fields.screenDiscolouration) rows.push({ question: 'Discolouration on Screen', answer: pickLabel(SCREEN_DISCOLOUR_OPTIONS, fields.screenDiscolouration) });
  if (fields.screenSpots) rows.push({ question: 'Spots on Screen', answer: pickLabel(SCREEN_SPOTS_OPTIONS, fields.screenSpots) });
  if (fields.screenLines) rows.push({ question: 'Lines on Screen', answer: pickLabel(SCREEN_LINES_OPTIONS, fields.screenLines) });
  if (fields.isScreenOriginal) rows.push({ question: 'Screen Original', answer: pickLabel(SCREEN_ORIGINAL_OPTIONS, fields.isScreenOriginal) });
  if (fields.softwareIssue) rows.push({ question: 'Software Issue', answer: pickLabel(SOFTWARE_OPTIONS, fields.softwareIssue) });
  return rows;
}
