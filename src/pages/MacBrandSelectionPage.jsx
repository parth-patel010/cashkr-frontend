import { useState, useEffect } from "react";
import { Monitor } from "lucide-react";
import { deviceService } from "../services/device.service";
import Breadcrumb from "../components/ui/Breadcrumb";
import Loader from "../components/ui/Loader";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import SelectionCard from "../components/layout/SelectionCard";
import { CategoryPageSEO } from "../components/seo/DevicePageSEO";
import { CATEGORY_SEO } from "../config/seo";
import { IMAC_BRANDS } from "../constants/devices";

const IMAC_BRAND_ORDER = ["Apple"];

const sortIMacBrands = (brandsList) =>
  [...brandsList].sort((a, b) => {
    const aIndex = IMAC_BRAND_ORDER.findIndex(
      (n) => n.toLowerCase() === a.brand.toLowerCase(),
    );
    const bIndex = IMAC_BRAND_ORDER.findIndex(
      (n) => n.toLowerCase() === b.brand.toLowerCase(),
    );
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.brand.localeCompare(b.brand);
  });

export default function MacBrandSelectionPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    deviceService
      .getBrands("mac")
      .then((res) => {
        setBrands(sortIMacBrands(res.data));
        setLoading(false);
      })
      .catch(() => {
        const fallback = IMAC_BRANDS.map((b) => ({ brand: b.name, modelCount: b.models }));
        setBrands(sortIMacBrands(fallback));
        setLoading(false);
      });
  }, []);

  const getBrandColor = (name) => {
    const b = IMAC_BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.color || "#0565E6";
  };

  const getBrandLogo = (name) => {
    const b = IMAC_BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.logo || null;
  };

  if (loading) return <Loader />;

  return (
    <PageCanvas>
      <CategoryPageSEO
        title={CATEGORY_SEO.mac.title}
        description={CATEGORY_SEO.mac.description}
        path={CATEGORY_SEO.mac.brandPath}
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "iMac / Mac" }]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "iMac / Mac" }]} />

      <PageShell
        eyebrow="Sell Your iMac"
        eyebrowIcon={Monitor}
        eyebrowTone="blue"
        title="Select Your"
        titleAccent="iMac Brand"
        subtitle="Choose your iMac brand below and get an instant price quote with free doorstep pickup."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {brands.map((b) => (
            <SelectionCard
              key={b.brand}
              to={`/sell-imac/${b.brand.toLowerCase()}`}
              title={b.brand}
              subtitle={`${b.modelCount || ""} model${b.modelCount !== 1 ? "s" : ""}`.trim()}
              image={
                !failedLogos[b.brand] && getBrandLogo(b.brand) ? (
                  <img
                    src={getBrandLogo(b.brand)}
                    alt={b.brand}
                    className="max-h-[64px] sm:max-h-[72px] max-w-[80%] object-contain"
                    onError={() =>
                      setFailedLogos((prev) => ({ ...prev, [b.brand]: true }))
                    }
                  />
                ) : (
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-extrabold"
                    style={{ backgroundColor: getBrandColor(b.brand) }}
                  >
                    {b.brand[0]}
                  </div>
                )
              }
            />
          ))}
        </div>
      </PageShell>

      <TrustPills />
    </PageCanvas>
  );
}
