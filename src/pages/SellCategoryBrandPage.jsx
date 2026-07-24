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
import { CategoryPageSEO } from "../components/seo/DevicePageSEO";
import { getSellCategoryMeta, isGenericSellCategory } from "../constants/sellCategories";

export default function SellCategoryBrandPage() {
  const { category } = useParams();
  const meta = getSellCategoryMeta(category);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    if (!isGenericSellCategory(category)) return;
    setLoading(true);
    deviceService
      .getBrands(category)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBrands(list.sort((a, b) => a.brand.localeCompare(b.brand)));
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, [category]);

  if (!meta) return <Navigate to="/" replace />;
  if (loading) return <Loader />;

  return (
    <PageCanvas>
      <CategoryPageSEO
        title={meta.title}
        description={meta.description}
        path={meta.pathPrefix + "/brand"}
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: meta.plural }]}
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: meta.plural }]} />

      <PageShell
        eyebrow={`Sell Your ${meta.label}`}
        eyebrowIcon={Tag}
        eyebrowTone="blue"
        title="Select Your"
        titleAccent={`${meta.label} Brand`}
        subtitle="Choose your brand below and get an instant price quote with free doorstep pickup."
      >
        {brands.length === 0 ? (
          <div className="text-center py-14 text-gray-500">
            <p className="text-lg font-semibold mb-2">No brands available yet</p>
            <p className="text-sm">Please check back soon, or contact us for a custom quote.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
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
                  to={`${meta.pathPrefix}/${encodeURIComponent(b.brand.toLowerCase())}`}
                  title={b.brand}
                  subtitle={`${b.modelCount || 0} Models`}
                  image={
                    hasLogo ? (
                      <img
                        src={b.logo || b.logoUrl}
                        alt={b.brand}
                        className="max-h-[64px] sm:max-h-[72px] max-w-[80%] object-contain"
                        onError={() =>
                          setFailedLogos((prev) => ({ ...prev, [b.brand]: true }))
                        }
                      />
                    ) : (
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-slate-700 text-xl sm:text-2xl font-extrabold border border-slate-100"
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
        )}
      </PageShell>

      <TrustPills />
    </PageCanvas>
  );
}
