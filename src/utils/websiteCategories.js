import api from '../services/api';
import mobileDeviceImg from '../assets/devices/mobile.png';
import tabletDeviceImg from '../assets/devices/tablet.png';
import laptopDeviceImg from '../assets/devices/laptop.png';
import macDeviceImg from '../assets/devices/mac.png';
import tvDeviceImg from '../assets/devices/tv.png';
import earbudsDeviceImg from '../assets/devices/earbuds.png';
import refrigeratorDeviceImg from '../assets/devices/refrigerator.png';
import smartwatchDeviceImg from '../assets/devices/smartwatch.png';

export const CATEGORY_FALLBACK_IMAGES = {
  mobile: mobileDeviceImg,
  tablet: tabletDeviceImg,
  laptop: laptopDeviceImg,
  mac: macDeviceImg,
  tv: tvDeviceImg,
  earbuds: earbudsDeviceImg,
  refrigerator: refrigeratorDeviceImg,
  smartwatch: smartwatchDeviceImg,
};

/** Fallback if public settings API is unavailable */
export const FALLBACK_WEBSITE_CATEGORIES = [
  { key: 'mobile', label: 'Mobile', sellPath: '/sell-old-mobile-phones/brand', buyPath: '/buy/mobile/brand', enabledSell: true, enabledBuy: true, imageUrl: '', sortOrder: 1 },
  { key: 'tablet', label: 'Tablet', sellPath: '/sell-tablet/brand', buyPath: '/buy/tablet/brand', enabledSell: true, enabledBuy: true, imageUrl: '', sortOrder: 2 },
  { key: 'laptop', label: 'Laptop', sellPath: '/sell-old-laptops/brand', buyPath: '/buy/laptop/brand', enabledSell: true, enabledBuy: true, imageUrl: '', sortOrder: 3 },
  { key: 'mac', label: 'Mac', sellPath: '/sell-imac/brand', buyPath: '/buy/mac/brand', enabledSell: true, enabledBuy: true, imageUrl: '', sortOrder: 4 },
  { key: 'tv', label: 'TV', sellPath: '/sell/tv/brand', buyPath: '/buy/tv/brand', enabledSell: true, enabledBuy: true, imageUrl: '', sortOrder: 5 },
  { key: 'earbuds', label: 'Earbuds', sellPath: '/sell/earbuds/brand', buyPath: '/buy/earbuds/brand', enabledSell: true, enabledBuy: true, imageUrl: '', sortOrder: 6 },
  { key: 'refrigerator', label: 'Refrigerator', sellPath: '/sell/refrigerator/brand', buyPath: '/buy/refrigerator/brand', enabledSell: true, enabledBuy: true, imageUrl: '', sortOrder: 7 },
  { key: 'smartwatch', label: 'Smartwatch', sellPath: '/sell/smartwatch/brand', buyPath: '/buy/smartwatch/brand', enabledSell: false, enabledBuy: true, imageUrl: '', sortOrder: 8 },
];

export async function fetchWebsiteCategories() {
  try {
    const { data } = await api.get('/app-settings');
    if (Array.isArray(data.categories) && data.categories.length) {
      return data.categories;
    }
  } catch {
    // fallback below
  }
  return FALLBACK_WEBSITE_CATEGORIES;
}

export function sellCategories(list = []) {
  return list.filter((c) => c.enabledSell !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function buyCategories(list = []) {
  return list.filter((c) => c.enabledBuy !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

export function categoryImage(cat) {
  if (cat?.imageUrl) return cat.imageUrl;
  return CATEGORY_FALLBACK_IMAGES[cat?.key] || CATEGORY_FALLBACK_IMAGES.mobile;
}
