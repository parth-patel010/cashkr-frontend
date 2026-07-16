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
];

export const getBuyCategory = (key = 'mobile') =>
  BUY_CATEGORIES.find((c) => c.key === key) || BUY_CATEGORIES[0];

export const formatBrandLabel = (brand = '') =>
  decodeURIComponent(brand)
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Brand';
