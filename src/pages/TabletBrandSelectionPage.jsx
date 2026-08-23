import { useState, useEffect } from "react";
import { Tablet } from "lucide-react";
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
import { CATEGORY_SEO } from "../config/seo";
import { TABLET_BRANDS } from "../constants/devices";
import { categorySellKeywords } from "../data/seoKeywords";
import { getCategoryBrandFaqs } from "../data/categoryBrandContent";

const TABLET_BRAND_ORDER = ["Apple", "Samsung"];

const sortTabletBrands = (brandsList) =>
  [...brandsList].sort((a, b) => {
    const aIndex = TABLET_BRAND_ORDER.findIndex(
      (name) => name.toLowerCase() === a.brand.toLowerCase(),
    );
    const bIndex = TABLET_BRAND_ORDER.findIndex(
      (name) => name.toLowerCase() === b.brand.toLowerCase(),
    );
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.brand.localeCompare(b.brand);
  });

export default function TabletBrandSelectionPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    deviceService
      .getBrands("tablet")
      .then((res) => {
        setBrands(sortTabletBrands(res.data));
        setLoading(false);
      })
      .catch(() => {
        const fallback = TABLET_BRANDS.map((b) => ({
          brand: b.name,
          modelCount: b.models,
          logo: b.logo,
          color: b.color,
        }));
        setBrands(sortTabletBrands(fallback));
        setLoading(false);
      });
  }, []);

  const getBrandColor = (name) => {
    const b = TABLET_BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.color || "#0565E6";
  };

  const getBrandLogo = (name) => {
    const b = TABLET_BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.logo || null;
  };

  if (loading) return <Loader />;

  return (
    <>
    <PageCanvas>
      <CategoryPageSEO
        title={CATEGORY_SEO.tablet.title}
        description={CATEGORY_SEO.tablet.description}
        path={CATEGORY_SEO.tablet.brandPath}
        keywords={categorySellKeywords('tablet')}
        faqs={getCategoryBrandFaqs('tablet')}
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Tablets" }]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Tablets" }]} />

      <PageShell
        bare
        bodyClassName="overflow-visible"
        headerAlign="center"
        eyebrow="Sell Your Tablet"
        eyebrowIcon={Tablet}
        eyebrowTone="blue"
        title="Select Your"
        titleAccent="Tablet Brand"
        subtitle="Choose your tablet brand below and get an instant price quote with free doorstep pickup."
      >
        <BrandSideAssets category="tablet">
          <div className="brand-cards-fade-up grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-4.5 w-full max-w-[54rem] mx-auto">
            {brands.map((b) => (
              <SelectionCard
                key={b.brand}
                compactMedium
                to={`/sell-tablet/${b.brand.toLowerCase()}`}
                title={b.brand}
                subtitle={`${b.modelCount || 0} Models`}
                image={
                  getBrandLogo(b.brand) && !failedLogos[b.brand] ? (
                    <img
                      src={getBrandLogo(b.brand)}
                      alt={b.brand}
                      className="max-h-[56px] sm:max-h-[64px] max-w-[88%] object-contain"
                      onError={() =>
                        setFailedLogos((prev) => ({ ...prev, [b.brand]: true }))
                      }
                    />
                  ) : (
                    <div
                      className="w-14 h-14 sm:w-[3.75rem] sm:h-[3.75rem] rounded-xl flex items-center justify-center text-white text-lg sm:text-xl font-bold"
                      style={{ backgroundColor: getBrandColor(b.brand) }}
                    >
                      {b.brand.substring(0, 2).toUpperCase()}
                    </div>
                  )
                }
              />
            ))}
          </div>
        </BrandSideAssets>

        <BrandModelSearch category="tablet" />
      </PageShell>

      <TrustPills />
    </PageCanvas>

    <BrandPageBottom category="tablet" />
    </>
  );
}
