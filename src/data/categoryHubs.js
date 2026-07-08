export const CATEGORY_HUBS = [
  {
    slug: 'sell-old-iphone',
    title: 'Sell Old iPhone Online in India',
    description:
      'Sell your used iPhone online at the best price with DeviceKart. Instant quotes for all iPhone models, free doorstep pickup, and secure payment across India.',
    brand: 'apple',
    category: 'mobile',
    path: '/sell-old-mobile-phones/apple',
    keywords: ['iPhone', 'Apple phone', 'sell iPhone India'],
  },
  {
    slug: 'sell-old-samsung-phone',
    title: 'Sell Old Samsung Phone Online in India',
    description:
      'Sell your used Samsung Galaxy phone online with DeviceKart. Get instant cash, free pickup, and transparent pricing for all Samsung models.',
    brand: 'samsung',
    category: 'mobile',
    path: '/sell-old-mobile-phones/samsung',
    keywords: ['Samsung', 'Galaxy phone', 'sell Samsung India'],
  },
  {
    slug: 'sell-used-laptop',
    title: 'Sell Used Laptop Online in India',
    description:
      'Sell your used laptop online — Dell, HP, Lenovo, Asus, Apple and more. DeviceKart offers instant quotes, free pickup, and fast payment.',
    brand: null,
    category: 'laptop',
    path: '/sell-old-laptops/brand',
    keywords: ['laptop', 'used laptop', 'sell laptop India'],
  },
  {
    slug: 'sell-old-ipad',
    title: 'Sell Old iPad Online in India',
    description:
      'Sell your used iPad or iPad Pro online with DeviceKart. Instant price check, free doorstep pickup, and secure payment after verification.',
    brand: 'apple',
    category: 'tablet',
    path: '/sell-tablet/apple',
    keywords: ['iPad', 'tablet', 'sell iPad India'],
  },
];

export function getCategoryHubBySlug(slug) {
  return CATEGORY_HUBS.find((h) => h.slug === slug);
}
