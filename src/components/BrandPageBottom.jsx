import HowBuybackWorks from "./HowBuybackWorks";
import BrandWhySellPhone from "./BrandWhySellPhone";
import TopSellingMobiles from "./TopSellingMobiles";
import BrandPhoneTestimonials from "./BrandPhoneTestimonials";
import BrandSellSeoContent from "./BrandSellSeoContent";
import BrandMobileFaqs from "./BrandMobileFaqs";

/**
 * Shared bottom stack for sell brand pages.
 * Same layout/assets; category only swaps copy (and mobile top-sellers).
 */
export default function BrandPageBottom({ category = "mobile" }) {
  return (
    <>
      <HowBuybackWorks variant="brand" category={category} />
      <BrandWhySellPhone category={category} />
      {category === "mobile" ? <TopSellingMobiles /> : null}
      <BrandPhoneTestimonials category={category} />
      <BrandSellSeoContent category={category} />
      <BrandMobileFaqs category={category} />
    </>
  );
}
