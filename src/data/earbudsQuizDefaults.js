/** Frontend earbuds quiz defaults + option detail bullets for UI cards. */

export const EARBUDS_OPTION_DETAILS = {
  power_yes: [
    'The device turns on!',
    'The device connects to devices successfully!',
  ],
  power_no: [
    'The device does not turn on!',
    'The device does not connect to devices successfully!',
  ],
  voice_ok: ['Mic works correctly!', 'Speaker works correctly and produces clear sound!'],
  voice_faulty: [
    'Mic does not work correctly!',
    'Speaker does not work correctly and/or does not produce clear sound!',
  ],
  conn_ok: [
    'Connects successfully to devices!',
    'Does not drop connections unexpectedly',
  ],
  conn_faulty: [
    'Does not connect successfully to devices!',
    'Drops connections unexpectedly',
  ],
  physical_ok: [
    "Device body & charging case is intact!",
    'Buttons are intact and working!',
  ],
  physical_damaged: [
    'Device body and/or charging case is damaged!',
    'Buttons are damaged and/or not working!',
  ],
  age_0_3: ['Bill Mandatory', 'Warranty must be valid'],
  age_3_6: ['Bill Mandatory', 'Warranty must be valid'],
  age_6_11: ['Bill Mandatory', 'Warranty must be valid'],
  age_11_plus: ['Bill Mandatory'],
};

export const DEFAULT_EARBUDS_QUIZ = {
  category: 'earbuds',
  deductionMode: 'universal',
  modelDeductions: [],
  isActive: true,
  windows: [
    {
      id: 'power',
      title: 'Power On',
      question: 'Does Your Device Switch On Successfully?',
      choiceType: 'single',
      options: [
        { id: 'power_yes', label: 'Yes', deductionValue: 0 },
        { id: 'power_no', label: 'No', deductionValue: 90 },
      ],
    },
    {
      id: 'voice_mic',
      title: 'Voice / Mic',
      question: 'Does Your Device Have Voice And/Or Mic Issues?',
      choiceType: 'single',
      options: [
        { id: 'voice_ok', label: 'Working Properly', deductionValue: 0 },
        { id: 'voice_faulty', label: 'Faulty Voice/Mic', deductionValue: 20 },
      ],
    },
    {
      id: 'connectivity',
      title: 'Connectivity',
      question: 'Does Your Device Have Connectivity Issues?',
      choiceType: 'single',
      options: [
        { id: 'conn_ok', label: 'Working Properly', deductionValue: 0 },
        { id: 'conn_faulty', label: 'Faulty Connectivity', deductionValue: 35 },
      ],
    },
    {
      id: 'physical',
      title: 'Physical Damage',
      question: 'Does Your Device Have Any Physical Damage?',
      choiceType: 'single',
      options: [
        { id: 'physical_ok', label: 'No Damage', deductionValue: 0 },
        { id: 'physical_damaged', label: 'Damaged Physically', deductionValue: 40 },
      ],
    },
    {
      id: 'accessories',
      title: 'Accessories',
      question: 'Select Original Accessories You Have?',
      choiceType: 'multi',
      options: [
        { id: 'acc_box', label: 'Box', deductionValue: 5 },
        { id: 'acc_case', label: 'Charging Case', deductionValue: 25 },
        { id: 'acc_cable', label: 'Charging Cable', deductionValue: 3 },
        { id: 'acc_bill', label: 'Bill', deductionValue: 0 },
      ],
    },
    {
      id: 'age',
      title: 'Device Age',
      question: 'How Old Is Your Device?',
      choiceType: 'single',
      options: [
        { id: 'age_0_3', label: 'Below 3 Months', deductionValue: 0 },
        { id: 'age_3_6', label: 'Between 3-6 Months', deductionValue: 7 },
        { id: 'age_6_11', label: 'Between 6-11 Months', deductionValue: 10 },
        { id: 'age_11_plus', label: 'Above 11 Months', deductionValue: 15 },
      ],
    },
  ],
};
