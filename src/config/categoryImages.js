/** Category images copied from DeviceKart Application */
export const SELL_CATEGORY_IMAGES = {
  mobile: "/category_assets/sell/phone.png",
  tablet: "/category_assets/sell/tablet.png",
  laptop: "/category_assets/sell/laptop.png",
  mac: "/category_assets/service/imac.png",
  tv: "/category_assets/sell/tv.png",
  earbuds: "/category_assets/sell/earbuds.png",
  refrigerator: "/category_assets/service/refri.png",
  smartwatch: "/category_assets/sell/smart-watch.png",
  speaker: "/category_assets/sell/speaker.png",
};

export const BUY_CATEGORY_IMAGES = {
  mobile: "/category_assets/buy/phone.png",
  tablet: "/category_assets/buy/tablet.png",
  laptop: "/category_assets/buy/laptop.png",
  mac: "/category_assets/service/imac.png",
  tv: "/category_assets/sell/tv.png",
  earbuds: "/category_assets/buy/audio_devices.png",
  refrigerator: "/category_assets/service/refri.png",
  smartwatch: "/category_assets/buy/smart_watches.png",
  gaming: "/category_assets/buy/gaming_console.png",
  camera: "/category_assets/buy/camera.png",
};

export const SELL_CATEGORY_DESCS = {
  mobile: "Get the best price for your old smartphone in minutes",
  tablet: "Sell your tablet with free doorstep pickup",
  laptop: "Transparent laptop buyback with instant payment",
  mac: "Sell iMac & Mac devices securely online",
  tv: "Sell your old TV with free pickup",
  earbuds: "Quick quotes for earbuds and audio devices",
  refrigerator: "Sell refrigerators with verified pickup partners",
  smartwatch: "Sell smartwatches at the best market value",
};

export const BUY_CATEGORY_DESCS = {
  mobile: "Certified refurbished smartphones with warranty",
  laptop: "Refurbished laptops tested and ready to use",
  tablet: "Quality refurbished tablets at great prices",
  smartwatch: "Refurbished smartwatches with warranty",
  mac: "Refurbished Mac and iMac devices with warranty",
  tv: "Refurbished TVs tested and ready for home",
  earbuds: "Certified refurbished audio devices",
  refrigerator: "Refurbished refrigerators with warranty",
};

export function sellCategoryImage(key) {
  return SELL_CATEGORY_IMAGES[key] || SELL_CATEGORY_IMAGES.mobile;
}

export function buyCategoryImage(key) {
  return BUY_CATEGORY_IMAGES[key] || BUY_CATEGORY_IMAGES.mobile;
}
