import { useState, useEffect } from "react";
import { Laptop } from "lucide-react";
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
import { LAPTOP_BRANDS } from "../constants/devices";
import { categorySellKeywords } from "../data/seoKeywords";
import { getCategoryBrandFaqs } from "../data/categoryBrandContent";

const LAPTOP_BRAND_ORDER = ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft"];

const sortLaptopBrands = (brandsList) =>
  [...brandsList].sort((a, b) => {
    const aIndex = LAPTOP_BRAND_ORDER.findIndex(
      (name) => name.toLowerCase() === a.brand.toLowerCase(),
    );
    const bIndex = LAPTOP_BRAND_ORDER.findIndex(
      (name) => name.toLowerCase() === b.brand.toLowerCase(),
    );
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.brand.localeCompare(b.brand);
  });

export default function LaptopBrandSelectionPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    deviceService
      .getBrands("laptop")
      .then((res) => {
        setBrands(sortLaptopBrands(res.data));
        setLoading(false);
      })
      .catch(() => {
        const fallback = LAPTOP_BRANDS.map((b) => ({ brand: b.name, modelCount: b.models }));
        setBrands(sortLaptopBrands(fallback));
        setLoading(false);
      });
  }, []);

  const getBrandColor = (name) => {
    const b = LAPTOP_BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.color || "#0565E6";
  };

  const getBrandLogo = (name) => {
    const b = LAPTOP_BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.logo || null;
  };

  if (loading) return <Loader />;

  return (
    <>
    <PageCanvas>
      <CategoryPageSEO
        title={CATEGORY_SEO.laptop.title}
        description={CATEGORY_SEO.laptop.description}
        path={CATEGORY_SEO.laptop.brandPath}
        keywords={categorySellKeywords('laptop')}
        faqs={getCategoryBrandFaqs('laptop')}
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Laptops" }]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Laptops" }]} />

      <PageShell
        bare
        bodyClassName="overflow-visible"
        headerAlign="center"
        eyebrow="Sell Your Laptop"
        eyebrowIcon={Laptop}
        eyebrowTone="blue"
        title="Select Your"
        titleAccent="Laptop Brand"
        subtitle="Choose your laptop brand below and get an instant price quote with free doorstep pickup."
      >
        <BrandSideAssets category="laptop">
          <div className="brand-cards-fade-up grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-4.5 w-full max-w-[54rem] mx-auto">
            {brands.map((b) => (
              <SelectionCard
                key={b.brand}
                compactMedium
                to={`/sell-old-laptops/${b.brand.toLowerCase()}`}
                title={b.brand}
                subtitle={`${b.modelCount || ""} model${b.modelCount !== 1 ? "s" : ""}`.trim()}
                image={
                  !failedLogos[b.brand] && getBrandLogo(b.brand) ? (
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
                      {b.brand[0]}
                    </div>
                  )
                }
              />
            ))}
          </div>
        </BrandSideAssets>

        <BrandModelSearch category="laptop" />
      </PageShell>

      <TrustPills />
    </PageCanvas>

    <BrandPageBottom category="laptop" />
    </>
  );
}
