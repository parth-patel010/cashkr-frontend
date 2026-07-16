import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import { formatBrandLabel, getBuyCategory } from '../constants/buyCategories';
import { buyService } from '../services/buy.service';
import { formatCurrency } from '../utils/formatCurrency';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function BuyProductListPage() {
  const { category = 'mobile', brand } = useParams();
  const location = useLocation();
  const cat = getBuyCategory(category);
  const brandSlug = decodeURIComponent(brand || '');
  const brandName = location.state?.brandName || formatBrandLabel(brandSlug);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
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
      `${p.title || ''} ${p.modelName || ''} ${p.brand || ''}`.toLowerCase().includes(q),
    );
  }, [products, search]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <SEOHead
        title={`Buy Refurbished ${displayBrand} ${cat.label}s`}
        description={`Browse refurbished ${displayBrand} ${cat.label.toLowerCase()}s with warranty on DeviceKart.`}
        path={`/buy/${category}/${brandSlug}`}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Buy', href: '/buy' },
          { label: cat.label, href: `/buy/${category}/brand` },
          { label: displayBrand },
        ]}
      />

      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
          Buy {displayBrand} {cat.label}s
        </h1>
        <p className="text-sm text-text-muted">
          Select a model to view condition options and place your order.
        </p>
      </div>

      <div className="relative max-w-md mb-8">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder={`Search ${displayBrand} models...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border-[1.5px] border-border rounded-xl text-sm bg-white focus:border-[#0565E6] focus:shadow-[0_0_0_3px_rgba(5,101,230,0.15)] outline-none transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-semibold mb-2">No products found</p>
          <p className="text-sm">Try another brand or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((product) => (
            <Link
              key={product._id || product.slug}
              to={`/buy/${category}/${encodeURIComponent(brandSlug)}/${product.slug}`}
              state={{ brandName: displayBrand }}
              className="group bg-white rounded-2xl border border-border p-4 sm:p-5 transition-all duration-200 hover:border-[#0565E6] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,101,230,0.12)] no-underline flex flex-col"
            >
              <div className="bg-gray-50 rounded-xl h-28 sm:h-36 flex items-center justify-center mb-4 group-hover:bg-[#0565E6]/5 transition-colors">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title || product.modelName}
                    className="h-24 sm:h-28 object-contain"
                  />
                ) : (
                  <span className="text-3xl font-black text-gray-300">{(product.brand || 'D')[0]}</span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1 leading-tight">
                {product.title || product.modelName}
              </h3>
              <p className="text-xs text-text-muted mb-3">
                From {formatCurrency(product.minPrice || 0)}
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0565E6] bg-[#0565E6]/5 px-3 py-1.5 rounded-lg group-hover:bg-[#0565E6] group-hover:text-white transition-colors">
                  View details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
