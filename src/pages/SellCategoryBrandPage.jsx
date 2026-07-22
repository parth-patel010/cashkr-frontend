import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import { CategoryPageSEO } from '../components/seo/DevicePageSEO';
import { getSellCategoryMeta, isGenericSellCategory } from '../constants/sellCategories';

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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-10 sm:pb-16">
      <CategoryPageSEO
        title={meta.title}
        description={meta.description}
        path={meta.pathPrefix + '/brand'}
        breadcrumbItems={[{ label: 'Home', href: '/' }, { label: meta.plural }]}
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: meta.plural }]} />

      <div className="text-center mb-4 sm:mb-4">
        <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-wider uppercase px-3.5 py-1 rounded-full mb-3">
          Sell Your {meta.label}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary mb-3">
          Select Your {meta.label} Brand
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto leading-relaxed">
          Choose your brand below and get an instant price quote with free doorstep pickup.
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-semibold mb-2">No brands available yet</p>
          <p className="text-sm">Please check back soon, or contact us for a custom quote.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {brands.map((b) => {
            const hasLogo = Boolean((b.logo || b.logoUrl) && !failedLogos[b.brand]);
            const rawColor = b.color || '#0565E6';
            const tileBg = hasLogo
              ? '#F8FAFC'
              : !rawColor || rawColor === 'white'
                ? '#F8FAFC'
                : rawColor;

            return (
              <Link
                key={b.brand}
                to={`${meta.pathPrefix}/${encodeURIComponent(b.brand.toLowerCase())}`}
                className="group flex flex-col items-center gap-3 bg-white rounded-2xl border border-border p-5 sm:p-6 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,101,230,0.12)] no-underline"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-slate-700 text-xl sm:text-2xl font-extrabold transition-transform duration-200 group-hover:scale-110 overflow-hidden border border-slate-100"
                  style={{ backgroundColor: tileBg }}
                >
                  {hasLogo ? (
                    <img
                      src={b.logo || b.logoUrl}
                      alt={b.brand}
                      className="w-full h-full object-contain p-2.5"
                      onError={() => setFailedLogos((prev) => ({ ...prev, [b.brand]: true }))}
                    />
                  ) : (
                    b.brand.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-primary transition-colors mb-0.5">
                    {b.brand}
                  </h3>
                  <p className="text-xs text-text-muted">{b.modelCount || 0} Models</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
