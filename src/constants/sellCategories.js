/** Sell flow categories that use /sell/:category/... routes */
export const GENERIC_SELL_CATEGORIES = ['tv', 'earbuds', 'refrigerator', 'smartwatch'];

export const SELL_CATEGORY_META = {
  tv: {
    key: 'tv',
    label: 'TV',
    plural: 'TVs',
    pathPrefix: '/sell/tv',
    title: 'Sell Old TVs Online — Instant Cash | DeviceKart',
    description:
      'Sell your used LED, LCD or Smart TV online. Instant quotes, free pickup, and secure payment with DeviceKart.',
  },
  earbuds: {
    key: 'earbuds',
    label: 'Earbuds',
    plural: 'Earbuds',
    pathPrefix: '/sell/earbuds',
    title: 'Sell Old Earbuds Online — Instant Cash | DeviceKart',
    description:
      'Sell your used wireless earbuds online. Get instant quotes, free pickup, and secure payment with DeviceKart.',
  },
  refrigerator: {
    key: 'refrigerator',
    label: 'Refrigerator',
    plural: 'Refrigerators',
    pathPrefix: '/sell/refrigerator',
    title: 'Sell Old Refrigerators Online — Instant Cash | DeviceKart',
    description:
      'Sell your used refrigerator online. Instant quotes, free doorstep pickup, and secure payment with DeviceKart.',
  },
  smartwatch: {
    key: 'smartwatch',
    label: 'Smartwatch',
    plural: 'Smartwatches',
    pathPrefix: '/sell/smartwatch',
    title: 'Sell Old Smartwatches Online — Instant Cash | DeviceKart',
    description:
      'Sell your used smartwatch online. Instant quotes, free pickup, and secure payment with DeviceKart.',
  },
};

export function getSellCategoryMeta(category) {
  return SELL_CATEGORY_META[category] || null;
}

export function isGenericSellCategory(category) {
  return GENERIC_SELL_CATEGORIES.includes(category);
}
