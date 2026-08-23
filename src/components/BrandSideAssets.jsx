import { useEffect, useState } from "react";
import ProgressiveImage from "./ui/ProgressiveImage";

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

function preloadBrandAssets(left, right) {
  const links = [left, right].map((href) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    document.head.appendChild(link);
    return link;
  });
  return () => links.forEach((link) => link.remove());
}

function BrandAssetSlot({
  src,
  alt,
  className,
  slideClass,
  priority = true,
  loaded,
  onLoaded,
}) {
  return (
    <div className={loaded ? slideClass : "brand-asset-enter-pending"}>
      <div className={loaded ? "brand-asset-float" : undefined}>
        <ProgressiveImage
          src={src}
          alt={alt}
          className={className}
          wrapperClassName="min-h-[8rem] sm:min-h-[10rem]"
          skeletonClassName="bg-gradient-to-br from-[#EEF4FF] via-[#F4F7FB] to-[#E8EEF5]"
          priority={priority}
          onLoaded={onLoaded}
        />
      </div>
    </div>
  );
}

export default function BrandSideAssets({ category = "mobile", children }) {
  const assets = getBrandSideAssets(category);
  const { left, right, alt } = assets;
  const leftDesktopClass = assets.leftDesktopClass || DEFAULT_LEFT_DESKTOP;
  const leftMobileClass = assets.leftMobileClass || DEFAULT_LEFT_MOBILE;
  const rightDesktopClass = assets.rightDesktopClass || DEFAULT_RIGHT_DESKTOP;
  const rightMobileClass = assets.rightMobileClass || DEFAULT_RIGHT_MOBILE;

  const [leftLoaded, setLeftLoaded] = useState(false);
  const [rightLoaded, setRightLoaded] = useState(false);

  useEffect(() => {
    setLeftLoaded(false);
    setRightLoaded(false);
    return preloadBrandAssets(left, right);
  }, [left, right, category]);

  return (
    <div className="relative w-full overflow-visible">
      <div
        aria-hidden="true"
        className="hidden lg:block pointer-events-none absolute -top-26 xl:-top-34 2xl:-top-42 w-screen left-1/2 -translate-x-1/2 z-0"
      >
        <div className="absolute left-0">
          <BrandAssetSlot
            src={left}
            alt=""
            className={leftDesktopClass}
            slideClass="brand-asset-slide-right"
            loaded={leftLoaded}
            onLoaded={() => setLeftLoaded(true)}
          />
        </div>
        <div className="absolute right-0">
          <BrandAssetSlot
            src={right}
            alt=""
            className={rightDesktopClass}
            slideClass="brand-asset-slide-from-right"
            loaded={rightLoaded}
            onLoaded={() => setRightLoaded(true)}
          />
        </div>
      </div>

      <div className="lg:hidden relative z-0 -mx-4 sm:-mx-6 -mt-5 mb-4 flex justify-start mr-6 -translate-x-2 sm:-translate-x-3 pointer-events-none">
        <BrandAssetSlot
          src={left}
          alt={alt}
          className={leftMobileClass}
          slideClass="brand-asset-slide-right"
          loaded={leftLoaded}
          onLoaded={() => setLeftLoaded(true)}
        />
      </div>

      <div className="relative z-10">{children}</div>

      <div className="lg:hidden relative z-0 mt-4 flex justify-end pr-0 sm:pr-1 translate-x-1 sm:translate-x-2 pointer-events-none">
        <BrandAssetSlot
          src={right}
          alt=""
          className={rightMobileClass}
          slideClass="brand-asset-slide-from-right"
          loaded={rightLoaded}
          onLoaded={() => setRightLoaded(true)}
        />
      </div>
    </div>
  );
}
