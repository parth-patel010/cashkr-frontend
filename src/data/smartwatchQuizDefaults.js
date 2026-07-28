/**
 * Frontend mirror of smartwatch quiz defaults (fallback if API unavailable).
 * Screen/physical bullet copy for the sell quiz UI.
 */

export const SMARTWATCH_SCREEN_DETAILS = {
  screen_flawless: [
    'Screen working fine, no issue',
    'No white or coloured spots, visible gap, glass lifted from screen',
    'No Lines, Discoloration, Crack(s), broken screen',
  ],
  screen_good: [
    'Minor scratches (1-2 light scratches)',
    'No white or coloured spots, visible gap, glass lifted from screen',
    'No Lines, Discoloration, Crack(s), broken screen',
  ],
  screen_average: [
    'Major scratches (>2 scratches or any scratch >5mm)',
    'No white or coloured spots, visible gap, glass lifted from screen',
    'No Lines, Discoloration, Crack(s), broken screen',
  ],
  screen_damaged: [
    'Screen touch not working',
    'White or coloured spots, visible line on screen',
    'Visible gap between screen and body, glass lifted',
    'Cracked or broken screen',
  ],
};

export const SMARTWATCH_PHYSICAL_DETAILS = {
  physical_flawless: ['Looks Like Brand new!', 'No imperfections!'],
  physical_good: ['Minor scratches', 'Normal signs of usage', 'No dents or bent on Corners'],
  physical_average: ['Moderate to heavy scratches', 'Slight wear, dent'],
  physical_broken: ['Deep Scratches', 'Major dents or warping', 'Glass Broken'],
};

export const DEFAULT_SMARTWATCH_QUIZ = {
  category: 'smartwatch',
  deductionMode: 'universal',
  modelDeductions: [],
  isActive: true,
  windows: [
    {
      id: 'power',
      title: 'Power On',
      question: 'Does the watch Switch On ?',
      choiceType: 'single',
      options: [
        { id: 'power_yes', label: 'Yes', deductionValue: 0 },
        { id: 'power_no', label: 'No', deductionValue: 90 },
      ],
    },
    {
      id: 'screen',
      title: 'Screen Condition',
      question: 'Please select your device screen condition',
      choiceType: 'single',
      options: [
        { id: 'screen_flawless', label: 'Flawless', deductionValue: 0 },
        { id: 'screen_good', label: 'Good', deductionValue: 8 },
        { id: 'screen_average', label: 'Average', deductionValue: 20 },
        { id: 'screen_damaged', label: 'Damaged', deductionValue: 65 },
      ],
    },
    {
      id: 'physical',
      title: 'Physical Condition',
      question: 'Please select your device physical condition.',
      choiceType: 'single',
      options: [
        { id: 'physical_flawless', label: 'Flawless', deductionValue: 0 },
        { id: 'physical_good', label: 'Good', deductionValue: 5 },
        { id: 'physical_average', label: 'Average', deductionValue: 17 },
        { id: 'physical_broken', label: 'Below Average/Broken', deductionValue: 40 },
      ],
    },
    {
      id: 'functional',
      title: 'Functional or Physical Problems',
      question: 'Please choose appropriate condition to get accurate quote',
      choiceType: 'multi',
      options: [
        { id: 'sw_battery', label: 'Battery health less than 89% / battery service', deductionValue: 13 },
        { id: 'sw_wifi', label: 'Wifi is faulty', deductionValue: 39 },
        { id: 'sw_speakers', label: 'Speakers is faulty', deductionValue: 4 },
        { id: 'sw_charging', label: 'Magnetic charging port is faulty', deductionValue: 10 },
        { id: 'sw_crown', label: 'Digital crown is faulty', deductionValue: 4 },
        { id: 'sw_side_button', label: 'Side button is faulty', deductionValue: 2 },
        { id: 'sw_heart', label: 'Optical heart sensor is faulty', deductionValue: 3 },
        { id: 'sw_bluetooth', label: 'Bluetooth is faulty', deductionValue: 39 },
      ],
    },
    {
      id: 'accessories',
      title: 'Do you have the following?',
      question: 'Please select accessories which are available.',
      choiceType: 'multi',
      options: [
        { id: 'acc_charger', label: 'Charger available', deductionValue: 3 },
        { id: 'acc_strap', label: 'Strap Available', deductionValue: 5 },
        { id: 'acc_box', label: 'Box available', deductionValue: 5 },
        { id: 'acc_bill', label: 'Valid GST Bill Available', deductionValue: 0 },
      ],
    },
  ],
};
