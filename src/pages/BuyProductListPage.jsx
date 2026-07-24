import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import Breadcrumb from "../components/ui/Breadcrumb";
import Loader from "../components/ui/Loader";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import SelectionCard from "../components/layout/SelectionCard";
import { formatBrandLabel, getBuyCategory } from "../constants/buyCategories";
import { buyService } from "../services/buy.service";
import { formatCurrency } from "../utils/formatCurrency";

export default function BuyProductListPage() {
  const { category = "mobile", brand } = useParams();
  const location = useLocation();
  const cat = getBuyCategory(category);
  const brandSlug = decodeURIComponent(brand || "");
  const brandName = location.state?.brandName || formatBrandLabel(brandSlug);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    buyService
      .getProducts({ category, brand: brandSlug })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, brandSlug]);

  const displayBrand = products[0]?.brand || brandName;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      `${p.title || ""} ${p.modelName || ""} ${p.brand || ""}`.toLowerCase().includes(q),
    );
  }, [products, search]);

  if (loading) return <Loader />;

  return (
    <PageCanvas>
      <SEOHead
        title={`Buy Refurbished ${displayBrand} ${cat.label}s`}
        description={`Browse refurbished ${displayBrand} ${cat.label.toLowerCase()}s with warranty on DeviceKart.`}
        path={`/buy/${category}/${brandSlug}`}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Buy", href: "/buy" },
          { label: cat.label, href: `/buy/${category}/brand` },
          { label: displayBrand },
        ]}
      />

      <PageShell
        eyebrow="Choose Model"
        eyebrowTone="blue"
        title={`Buy ${displayBrand}`}
        titleAccent={`${cat.label}s`}
        subtitle="Select a model to view condition options and place your order."
        headerAlign="left"
      >
        <div className="relative max-w-md mb-6 sm:mb-8">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder={`Search ${displayBrand} models...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-[1.5px] border-[#E8EEF5] rounded-xl text-sm bg-[#F7F9FC] focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(5,101,230,0.12)] outline-none transition-all"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14 text-gray-500">
            <p className="text-lg font-semibold mb-2">No products found</p>
            <p className="text-sm">Try another brand or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((product) => (
              <SelectionCard
                key={product._id || product.slug}
                to={`/buy/${category}/${encodeURIComponent(brandSlug)}/${product.slug}`}
                state={{ brandName: displayBrand }}
                title={product.title || product.modelName}
                subtitle={`From ${formatCurrency(product.minPrice || 0)}`}
                image={
                  product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title || product.modelName}
                      className="max-h-[88px] sm:max-h-[100px] max-w-[90%] object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-3xl font-black text-gray-300">
                      {(product.brand || "D")[0]}
                    </span>
                  )
                }
                footer={
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    View details
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
