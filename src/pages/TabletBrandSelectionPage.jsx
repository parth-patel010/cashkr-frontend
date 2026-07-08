import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import { CategoryPageSEO } from '../components/seo/DevicePageSEO';
import { CATEGORY_SEO } from '../config/seo';
import { TABLET_BRANDS } from '../constants/devices';

const TabletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
  </svg>
);

const TABLET_BRAND_ORDER = ["Apple", "Samsung"];

const sortTabletBrands = (brandsList) => {
  return [...brandsList].sort((a, b) => {
    const aIndex = TABLET_BRAND_ORDER.findIndex(
      name => name.toLowerCase() === a.brand.toLowerCase()
    );
    const bIndex = TABLET_BRAND_ORDER.findIndex(
      name => name.toLowerCase() === b.brand.toLowerCase()
    );

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    return a.brand.localeCompare(b.brand);
  });
};

export default function TabletBrandSelectionPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState({});

  useEffect(() => {
    deviceService.getBrands('tablet').then(res => {
      setBrands(sortTabletBrands(res.data));
      setLoading(false);
    }).catch(() => {
      // Fallback to constants
      const fallback = TABLET_BRANDS.map(b => ({ 
        brand: b.name, 
        modelCount: b.models,
        logo: b.logo,
        color: b.color
      }));
      setBrands(sortTabletBrands(fallback));
      setLoading(false);
    });
  }, []);

  const getBrandColor = (name) => {
    const b = TABLET_BRANDS.find(br => br.name.toLowerCase() === name.toLowerCase());
    return b?.color || '#0565E6';
  };

  const getBrandLogo = (name) => {
    const b = TABLET_BRANDS.find(br => br.name.toLowerCase() === name.toLowerCase());
    return b?.logo || null;
  };

  const handleLogoError = (brandName) => {
    setFailedLogos(prev => ({...prev, [brandName]: true}));
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-10 sm:pb-16">
      <CategoryPageSEO
        title={CATEGORY_SEO.tablet.title}
        description={CATEGORY_SEO.tablet.description}
        path={CATEGORY_SEO.tablet.brandPath}
        breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'Tablets' }]}
      />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Tablets' },
      ]} />

      {/* Section Title */}
      <div className="text-center mb-4 sm:mb-4">
        <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-wider uppercase px-3.5 py-1 rounded-full mb-3">
          Sell Your Tablet
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary mb-3">Select Your Tablet Brand</h1>
        <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto leading-relaxed">
          Choose your tablet brand below and get an instant price quote with free doorstep pickup.
        </p>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {brands.map(b => (
          <Link
            key={b.brand}
            to={`/sell-tablet/${b.brand.toLowerCase()}`}
            className="group flex flex-col items-center gap-3 bg-white rounded-2xl border border-border p-5 sm:p-6 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,101,230,0.12)] no-underline"
          >
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-extrabold transition-transform duration-200 group-hover:scale-110 overflow-hidden"
              style={{ backgroundColor: getBrandColor(b.brand) }}
            >
              {getBrandLogo(b.brand) && !failedLogos[b.brand] ? (
                <img
                  src={getBrandLogo(b.brand)}
                  alt={b.brand}
                  className="w-full h-full object-contain p-2"
                  onError={() => handleLogoError(b.brand)}
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
        ))}
      </div>
    </div>
  );
}
