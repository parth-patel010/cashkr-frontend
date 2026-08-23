import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Tag } from "lucide-react";
import { deviceService } from "../services/device.service";
import Breadcrumb from "../components/ui/Breadcrumb";
import Loader from "../components/ui/Loader";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import SelectionCard from "../components/layout/SelectionCard";
import BrandSideAssets from "../components/BrandSideAssets";
import BrandModelSearch from "../components/BrandModelSearch";
import BrandPageBottom from "../components/BrandPageBottom";
import { CategoryPageSEO } from "../components/seo/DevicePageSEO";
import { getSellCategoryMeta, isGenericSellCategory } from "../constants/sellCategories";
import { isFormSellCategory, FORM_SELL_CATEGORY_PATHS } from "../utils/websiteCategories";
import { categorySellKeywords } from "../data/seoKeywords";
import { getCategoryBrandFaqs } from "../data/categoryBrandContent";

const BRAND_PAGE_BOTTOM_CATEGORIES = new Set(["earbuds", "smartwatch", "gaming"]);
const SIDE_ASSET_CATEGORIES = new Set(["earbuds", "smartwatch", "gaming"]);

export default function SellCategoryBrandPage() {
  const { category } = useParams();
  const meta = getSellCategoryMeta(category);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});
  const formOnly = isFormSellCategory(category);
  const showBottom = BRAND_PAGE_BOTTOM_CATEGORIES.has(category);
  const showSideAssets = SIDE_ASSET_CATEGORIES.has(category);

  useEffect(() => {
    if (formOnly || !isGenericSellCategory(category)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    deviceService
      .getBrands(category)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBrands(list.sort((a, b) => a.brand.localeCompare(b.brand)));
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, [category, formOnly]);

  if (formOnly) {
    return <Navigate to={FORM_SELL_CATEGORY_PATHS[category]} replace />;
  }

  if (!meta) return <Navigate to="/" replace />;
  if (loading) return <Loader />;

  const brandGrid = brands.length === 0 ? (
    <div className="text-center py-14 text-gray-500">
      <p className="text-lg font-semibold mb-2">No brands available yet</p>
      <p className="text-sm">Please check back soon, or contact us for a custom quote.</p>
    </div>
  ) : (
    <div
      className={
        showSideAssets
          ? "brand-cards-fade-up grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-4.5 w-full max-w-[54rem] mx-auto"
          : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
      }
    >
      {brands.map((b) => {
        const hasLogo = Boolean((b.logo || b.logoUrl) && !failedLogos[b.brand]);
        const rawColor = b.color || "#0565E6";
        const tileBg = hasLogo
          ? "#F8FAFC"
          : !rawColor || rawColor === "white"
            ? "#F8FAFC"
            : rawColor;

        return (
          <SelectionCard
            key={b.brand}
            {...(showSideAssets ? { compactMedium: true } : { compact: true })}
            to={`${meta.pathPrefix}/${encodeURIComponent(b.brand.toLowerCase())}`}
            title={b.brand}
            subtitle={`${b.modelCount || 0} Models`}
            image={
              hasLogo ? (
                <img
                  src={b.logo || b.logoUrl}
                  alt={b.brand}
                  className={
                    showSideAssets
                      ? "max-h-[56px] sm:max-h-[64px] max-w-[88%] object-contain"
                      : "max-h-[52px] sm:max-h-[60px] max-w-[88%] object-contain"
                  }
                  onError={() =>
                    setFailedLogos((prev) => ({ ...prev, [b.brand]: true }))
                  }
                />
              ) : (
                <div
                  className={
                    showSideAssets
                      ? "w-14 h-14 sm:w-[3.75rem] sm:h-[3.75rem] rounded-xl flex items-center justify-center text-slate-700 text-lg sm:text-xl font-bold border border-slate-100"
                      : "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-slate-700 text-lg sm:text-xl font-bold border border-slate-100"
                  }
                  style={{ backgroundColor: tileBg }}
                >
                  {b.brand.substring(0, 2).toUpperCase()}
                </div>
              )
            }
          />
        );
      })}
    </div>
  );

  return (
    <>
      <PageCanvas>
        <CategoryPageSEO
          title={meta.title}
          description={meta.description}
          path={meta.pathPrefix + "/brand"}
          keywords={categorySellKeywords(category)}
          faqs={showBottom ? getCategoryBrandFaqs(category) : undefined}
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: meta.plural }]}
        />
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: meta.plural }]} />

        <PageShell
          bare
          bodyClassName={showSideAssets ? "overflow-visible" : undefined}
          headerAlign={showSideAssets ? "center" : undefined}
          eyebrow={`Sell Your ${meta.label}`}
          eyebrowIcon={Tag}
          eyebrowTone="blue"
          title="Select Your"
          titleAccent={`${meta.label} Brand`}
          subtitle="Choose your brand below and get an instant price quote with free doorstep pickup."
        >
          {showSideAssets ? (
            <BrandSideAssets category={category}>{brandGrid}</BrandSideAssets>
          ) : (
            brandGrid
          )}

          {showBottom ? <BrandModelSearch category={category} /> : null}
        </PageShell>

        <TrustPills />
      </PageCanvas>

      {showBottom ? <BrandPageBottom category={category} /> : null}
    </>
  );
}
