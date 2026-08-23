/**
 * Side branding art for sell brand pages (desktop flanks + mobile stack).
 * Same layout as the phone brand page; assets differ per category.
 */

/** Shared scale for 1536×1024 landscape assets (laptop / tablet / wearables / gaming). */
const LANDSCAPE_SIZES = {
  leftDesktopClass:
    "ml-0 -translate-x-4 xl:-translate-x-6 2xl:-translate-x-8 w-[22.5rem] xl:w-[25.5rem] 2xl:w-[27.5rem] h-auto object-contain",
  leftMobileClass: "w-[12.25rem] sm:w-[13.75rem] h-auto object-contain ml-0",
  rightDesktopClass:
    "mr-0 translate-x-1 xl:translate-x-2 2xl:translate-x-3 w-[24rem] xl:w-[27rem] 2xl:w-[29rem] h-auto object-contain",
  rightMobileClass: "w-52 sm:w-[15rem] h-auto object-contain",
};

/** Slightly smaller than landscape — iMac art reads bigger at the same width. */
const IMAC_SIZES = {
  leftDesktopClass:
    "ml-0 -translate-x-4 xl:-translate-x-6 2xl:-translate-x-8 w-[21rem] xl:w-[24rem] 2xl:w-[26rem] h-auto object-contain",
  leftMobileClass: "w-[11.5rem] sm:w-[13rem] h-auto object-contain ml-0",
  rightDesktopClass:
    "mr-0 translate-x-1 xl:translate-x-2 2xl:translate-x-3 w-[22.5rem] xl:w-[25.5rem] 2xl:w-[27.5rem] h-auto object-contain",
  rightMobileClass: "w-48 sm:w-[14rem] h-auto object-contain",
};

export const BRAND_SIDE_ASSETS = {
  mobile: {
    left: "/Branding_asset_1.png",
    right: "/Branding_asset_2.png",
    alt: "Sell your mobile phone",
  },
  laptop: {
    left: "/Laptop_Branding_asset_1.png",
    right: "/Laptop_Branding_asset_2.png",
    alt: "Sell your laptop",
    ...LANDSCAPE_SIZES,
  },
  tablet: {
    left: "/Tablet_Branding_asset_1.png",
    right: "/Tablet_Branding_asset_2.png",
    alt: "Sell your tablet",
    ...LANDSCAPE_SIZES,
  },
  smartwatch: {
    left: "/Smartwatch_Branding_asset_1.png",
    right: "/Smartwatch_Branding_asset_2.png",
    alt: "Sell your smartwatch",
    ...LANDSCAPE_SIZES,
  },
  earbuds: {
    left: "/Earbuds_Branding_asset_1.png",
    right: "/Earbuds_Branding_asset_2.png",
    alt: "Sell your earbuds",
    ...LANDSCAPE_SIZES,
  },
  gaming: {
    left: "/GamingConsole_Branding_asset_1.png",
    right: "/GamingConsole_Branding_asset_2.png",
    alt: "Sell your gaming console",
    ...LANDSCAPE_SIZES,
  },
  // Dedicated iMac side art
  mac: {
    left: "/imac_Branding_asset_1.png",
    right: "/imac_Branding_asset_2.png",
    alt: "Sell your iMac",
    ...IMAC_SIZES,
  },
};

const DEFAULT_LEFT_DESKTOP =
  "ml-0 -translate-x-4 xl:-translate-x-6 2xl:-translate-x-8 w-[22rem] xl:w-[25rem] 2xl:w-[27rem] h-auto object-contain";
const DEFAULT_LEFT_MOBILE = "w-48 sm:w-56 h-auto object-contain ml-0";
const DEFAULT_RIGHT_DESKTOP =
  "mr-0 translate-x-1 xl:translate-x-2 2xl:translate-x-3 w-[27rem] xl:w-[30rem] 2xl:w-[32rem] h-auto object-contain";
const DEFAULT_RIGHT_MOBILE = "w-60 sm:w-[17rem] h-auto object-contain";

export function getBrandSideAssets(category = "mobile") {
  return BRAND_SIDE_ASSETS[category] || BRAND_SIDE_ASSETS.mobile;
}

export default function BrandSideAssets({ category = "mobile", children }) {
  const assets = getBrandSideAssets(category);
  const { left, right, alt } = assets;
  const leftDesktopClass = assets.leftDesktopClass || DEFAULT_LEFT_DESKTOP;
  const leftMobileClass = assets.leftMobileClass || DEFAULT_LEFT_MOBILE;
  const rightDesktopClass = assets.rightDesktopClass || DEFAULT_RIGHT_DESKTOP;
  const rightMobileClass = assets.rightMobileClass || DEFAULT_RIGHT_MOBILE;

  return (
    <div className="relative w-full overflow-visible">
      <div
        aria-hidden="true"
        className="hidden lg:block pointer-events-none absolute -top-26 xl:-top-34 2xl:-top-42 w-screen left-1/2 -translate-x-1/2 z-10"
      >
        <div className="absolute left-0 brand-asset-slide-right">
          <div className="brand-asset-float">
            <img
              src={left}
              alt=""
              className={leftDesktopClass}
              loading="lazy"
            />
          </div>
        </div>
        <div className="absolute right-0 brand-asset-slide-from-right">
          <div className="brand-asset-float">
            <img
              src={right}
              alt=""
              className={rightDesktopClass}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden -mx-4 sm:-mx-6 -mt-5 mb-4 flex justify-start mr-6 -translate-x-2 sm:-translate-x-3">
        <div className="brand-asset-slide-right">
          <div className="brand-asset-float">
            <img
              src={left}
              alt={alt}
              className={leftMobileClass}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {children}

      <div className="lg:hidden mt-4 flex justify-end pr-0 sm:pr-1 translate-x-1 sm:translate-x-2">
        <div className="brand-asset-slide-from-right">
          <div className="brand-asset-float">
            <img
              src={right}
              alt=""
              aria-hidden="true"
              className={rightMobileClass}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
