/**
 * Frontend mirror of gaming console quiz defaults + physical detail bullets.
 */

export const GAMING_PHYSICAL_DETAILS = {
  physical_flawless: ['Looks like brand new', 'No imperfections'],
  physical_good: ['Minor scratches', 'Normal signs of usage', 'No dents or bent on Corners'],
  physical_average: ['Moderate to heavy scratches', 'Wear dent or bent on Corners'],
  physical_below: ['Cracked or broken parts', 'Physical damage'],
};

export const DEFAULT_GAMING_QUIZ = {
  category: 'gaming',
  deductionMode: 'universal',
  modelDeductions: [],
  isActive: true,
  windows: [
    {
      id: 'power',
      title: 'Power On',
      question: 'Does the Gaming Console switch on?',
      choiceType: 'single',
      options: [
        { id: 'power_yes', label: 'Yes', deductionValue: 0 },
        { id: 'power_no', label: 'No', deductionValue: 90 },
      ],
    },
    {
      id: 'physical',
      title: 'Physical Condition',
      question: 'Please select your device physical condition',
      choiceType: 'single',
      options: [
        { id: 'physical_flawless', label: 'Flawless', deductionValue: 0 },
        { id: 'physical_good', label: 'Good', deductionValue: 5 },
        { id: 'physical_average', label: 'Average', deductionValue: 17 },
        { id: 'physical_below', label: 'Below Average', deductionValue: 40 },
      ],
    },
    {
      id: 'functional',
      title: 'Functional Condition',
      question: 'Please choose appropriate condition to get accurate quote',
      choiceType: 'multi',
      options: [
        { id: 'gc_cd_drive', label: 'CD Drive not working', deductionValue: 15 },
        { id: 'gc_usb', label: 'USB/Charging port not working', deductionValue: 10 },
        { id: 'gc_hdmi', label: 'HDMI output port not working', deductionValue: 20 },
        { id: 'gc_lan', label: 'LAN port not working', deductionValue: 5 },
        { id: 'gc_bluetooth', label: 'Bluetooth not working', deductionValue: 39 },
        { id: 'gc_wifi', label: 'WiFi not working', deductionValue: 39 },
      ],
    },
    {
      id: 'accessories',
      title: 'Do you have the following?',
      question: 'Please select accessories which are available',
      choiceType: 'multi',
      options: [
        { id: 'acc_controller', label: 'Original Controller', deductionValue: 10 },
        { id: 'acc_charger', label: 'Original Adapter/Charger', deductionValue: 3 },
        { id: 'acc_box', label: 'Box', deductionValue: 5 },
        { id: 'acc_bill', label: 'Bill', deductionValue: 0 },
        { id: 'acc_extra_controller', label: 'Extra Controller', deductionValue: -3 },
      ],
    },
    {
      id: 'game_cds',
      title: 'How many Game CDs do you have?',
      question: 'The Games should be compatible with the Console',
      choiceType: 'single',
      options: [
        { id: 'cds_0', label: '0', deductionValue: 0 },
        { id: 'cds_1', label: '1', deductionValue: -1 },
        { id: 'cds_2', label: '2', deductionValue: -2 },
        { id: 'cds_3', label: '3', deductionValue: -3 },
        { id: 'cds_4', label: '4', deductionValue: -4 },
        { id: 'cds_5', label: '5', deductionValue: -5 },
        { id: 'cds_6', label: '6', deductionValue: -6 },
        { id: 'cds_7', label: '7', deductionValue: -7 },
        { id: 'cds_8', label: '8', deductionValue: -8 },
        { id: 'cds_9', label: '9', deductionValue: -9 },
        { id: 'cds_10', label: '10', deductionValue: -10 },
      ],
    },
  ],
};
