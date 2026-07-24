import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { deviceService } from "../services/device.service";
import Breadcrumb from "../components/ui/Breadcrumb";
import Loader from "../components/ui/Loader";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import SelectionCard from "../components/layout/SelectionCard";
import { formatCurrency } from "../utils/formatCurrency";
import { getSellCategoryMeta } from "../constants/sellCategories";

export default function SellCategoryModelPage() {
  const { category, brand } = useParams();
  const meta = getSellCategoryMeta(category);
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const brandName = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : "";

  useEffect(() => {
    if (!meta || !brand) return;
    setLoading(true);
    deviceService
      .getModels(brand, category)
      .then((res) => setModels(res.data || []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, [brand, category, meta]);

  if (!meta) return <Navigate to="/" replace />;
  if (loading) return <Loader />;

  const filtered = models.filter((m) =>
    m.modelName.toLowerCase().includes(search.toLowerCase()),
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: meta.plural, href: `${meta.pathPrefix}/brand` },
    { label: brandName },
  ];

  return (
    <PageCanvas>
      <Breadcrumb items={breadcrumbItems} />

      <PageShell
        eyebrow="Choose Model"
        eyebrowTone="blue"
        title={`Sell Old ${brandName}`}
        titleAccent={meta.plural}
        subtitle="Select your model below to get an accurate buyback price."
        headerAlign="left"
      >
        <div className="relative max-w-md mb-6 sm:mb-8">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder={`Search ${brandName} models...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-[1.5px] border-[#E8EEF5] rounded-xl text-sm bg-[#F7F9FC] focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(5,101,230,0.12)] outline-none transition-all"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-500">
            <p className="text-lg font-semibold mb-2">No models found</p>
            <p className="text-sm">Try a different search term, or add devices from Admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((model) => (
              <SelectionCard
                key={model.slug}
                to={`${meta.pathPrefix}/${brand}/${model.slug}`}
                title={model.modelName}
                subtitle={
                  model.maxPrice != null ? `Up to ${formatCurrency(model.maxPrice)}` : undefined
                }
                image={
                  <img
                    src={
                      model.imageUrl ||
                      "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"
                    }
                    alt={model.modelName}
                    className="max-h-[88px] sm:max-h-[100px] max-w-[90%] object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                }
                footer={
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    Get Quote
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </span>
                }
              />
            ))}
          </div>
        )}
      </PageShell>

      <TrustPills />
    </PageCanvas>
  );
}
