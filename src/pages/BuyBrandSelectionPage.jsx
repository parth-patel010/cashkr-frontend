import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import Breadcrumb from "../components/ui/Breadcrumb";
import Loader from "../components/ui/Loader";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import SelectionCard from "../components/layout/SelectionCard";
import { getBuyCategory } from "../constants/buyCategories";
import { BRANDS } from "../constants/devices";
import { deviceService } from "../services/device.service";

export default function BuyBrandSelectionPage() {
  const { category = "mobile" } = useParams();
  const cat = getBuyCategory(category);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    setLoading(true);
    deviceService
      .getBrands(category, "buy")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBrands(
          list
            .filter((b) => Number(b.modelCount) > 0)
            .sort((a, b) => a.brand.localeCompare(b.brand)),
        );
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, [category]);

  const getBrandColor = (name) => {
    const b = BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.color || "#0565E6";
  };

  const getBrandLogo = (name, logoUrl) => {
    if (logoUrl) return logoUrl;
    const b = BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.logo || null;
  };

  if (loading) return <Loader />;

  return (
    <PageCanvas>
      <SEOHead
        title={`Buy Refurbished ${cat.label}s`}
        description={`Buy certified refurbished ${cat.label.toLowerCase()}s online from DeviceKart with warranty and best prices.`}
        path={`/buy/${category}/brand`}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Buy", href: "/buy" },
          { label: cat.label },
        ]}
      />

      <PageShell
        bare
        eyebrow={`Buy ${cat.label}`}
        eyebrowIcon={ShoppingBag}
        eyebrowTone="blue"
        title="Select Your"
        titleAccent="Brand"
        subtitle={`Choose a brand to browse available refurbished ${cat.label.toLowerCase()}s.`}
      >
        {brands.length === 0 ? (
          <div className="text-center py-14 text-gray-500">
            <p className="text-lg font-semibold mb-2">No brands available yet</p>
            <p className="text-sm">
              Please check back soon for {cat.label.toLowerCase()} inventory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {brands.map((b) => {
              const brandSlug = (b.slug || b.brand).toLowerCase();
              const logo = getBrandLogo(b.brand, b.logoUrl || b.logo);
              const hasLogo = Boolean(logo && !failedLogos[b.brand]);
              const rawColor = b.color || getBrandColor(b.brand);
              const tileBg = hasLogo
                ? "#F8FAFC"
                : !rawColor || rawColor === "white"
                  ? "#F8FAFC"
                  : rawColor;

              return (
                <SelectionCard
                  key={b.brand}
                  compact
                  to={`/buy/${category}/${encodeURIComponent(brandSlug)}`}
                  state={{ brandName: b.brand }}
                  title={b.brand}
                  subtitle={`${b.modelCount} model${b.modelCount !== 1 ? "s" : ""}`}
                  image={
                    hasLogo ? (
                      <img
                        src={logo}
                        alt={b.brand}
                        className="max-h-[52px] sm:max-h-[60px] max-w-[88%] object-contain"
                        onError={() =>
                          setFailedLogos((prev) => ({ ...prev, [b.brand]: true }))
                        }
                      />
                    ) : (
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-slate-700 text-lg sm:text-xl font-bold border border-slate-100"
                        style={{ backgroundColor: tileBg }}
                      >
                        {b.brand[0]}
                      </div>
                    )
                  }
                />
              );
            })}
          </div>
        )}
      </PageShell>

      <TrustPills />
    </PageCanvas>
  );
}
