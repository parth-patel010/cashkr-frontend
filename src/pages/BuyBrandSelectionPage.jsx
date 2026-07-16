import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import { getBuyCategory } from '../constants/buyCategories';
import { BRANDS } from '../constants/devices';
import { deviceService } from '../services/device.service';

export default function BuyBrandSelectionPage() {
  const { category = 'mobile' } = useParams();
  const cat = getBuyCategory(category);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    setLoading(true);
    deviceService
      .getBrands(category, 'buy')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setBrands(
          list.filter((b) => Number(b.modelCount) > 0).sort((a, b) => a.brand.localeCompare(b.brand)),
        );
      })
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, [category]);

  const getBrandColor = (name) => {
    const b = BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.color || '#0565E6';
  };

  const getBrandLogo = (name, logoUrl) => {
    if (logoUrl) return logoUrl;
    const b = BRANDS.find((br) => br.name.toLowerCase() === name.toLowerCase());
    return b?.logo || null;
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-10 sm:pb-16">
      <SEOHead
        title={`Buy Refurbished ${cat.label}s`}
        description={`Buy certified refurbished ${cat.label.toLowerCase()}s online from DeviceKart with warranty and best prices.`}
        path={`/buy/${category}/brand`}
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Buy', href: '/buy' },
          { label: cat.label },
        ]}
      />

      <div className="text-center mb-8 sm:mb-10">
        <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-wider uppercase px-3.5 py-1 rounded-full mb-3">
          Buy {cat.label}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary mb-3">
          Select Your Brand
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto leading-relaxed">
          Choose a brand to browse available refurbished {cat.label.toLowerCase()}s.
        </p>
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg font-semibold mb-2">No brands available yet</p>
          <p className="text-sm">Please check back soon for {cat.label.toLowerCase()} inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {brands.map((b) => {
            const brandSlug = (b.slug || b.brand).toLowerCase();
            const logo = getBrandLogo(b.brand, b.logoUrl);
            return (
              <Link
                key={b.brand}
                to={`/buy/${category}/${encodeURIComponent(brandSlug)}`}
                state={{ brandName: b.brand }}
                className="group flex flex-col items-center gap-3 bg-white rounded-2xl border border-border p-5 sm:p-6 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,101,230,0.12)] no-underline"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-extrabold transition-transform duration-200 group-hover:scale-110 overflow-hidden"
                  style={{ backgroundColor: b.color || getBrandColor(b.brand) }}
                >
                  {!failedLogos[b.brand] && logo ? (
                    <img
                      src={logo}
                      alt={b.brand}
                      className="w-full h-full object-contain p-2"
                      onError={() => setFailedLogos((prev) => ({ ...prev, [b.brand]: true }))}
                    />
                  ) : (
                    b.brand[0]
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm sm:text-base font-bold text-text-primary">{b.brand}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {b.modelCount} model{b.modelCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
