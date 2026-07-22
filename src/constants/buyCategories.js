export const BUY_CATEGORIES = [
  {
    key: 'mobile',
    label: 'Phone',
    description: 'Certified refurbished smartphones with warranty',
  },
  {
    key: 'laptop',
    label: 'Laptop',
    description: 'Refurbished laptops tested and ready to use',
  },
  {
    key: 'tablet',
    label: 'Tablet',
    description: 'Quality refurbished tablets at great prices',
  },
  {
    key: 'smartwatch',
    label: 'Smartwatch',
    description: 'Refurbished smartwatches with warranty',
  },
  {
    key: 'mac',
    label: 'Mac',
    description: 'Refurbished Mac and iMac devices with warranty',
  },
  {
    key: 'tv',
    label: 'TV',
    description: 'Refurbished TVs tested and ready for home',
  },
  {
    key: 'earbuds',
    label: 'Earbuds',
    description: 'Certified refurbished earbuds at great prices',
  },
  {
    key: 'refrigerator',
    label: 'Refrigerator',
    description: 'Refurbished refrigerators with warranty',
  },
];

export const getBuyCategory = (key = 'mobile') =>
  BUY_CATEGORIES.find((c) => c.key === key) || {
    key,
    label: key ? key.charAt(0).toUpperCase() + key.slice(1) : 'Device',
    description: 'Certified refurbished devices with warranty',
  };

export const formatBrandLabel = (brand = '') =>
  decodeURIComponent(brand)
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Brand';
