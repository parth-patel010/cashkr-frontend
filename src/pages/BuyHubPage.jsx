import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import Breadcrumb from '../components/ui/Breadcrumb';
import {
  fetchWebsiteCategories,
  buyCategories,
  categoryImage,
  FALLBACK_WEBSITE_CATEGORIES,
} from '../utils/websiteCategories';

const BUY_DESCRIPTIONS = {
  mobile: 'Certified refurbished smartphones with warranty',
  laptop: 'Refurbished laptops tested and ready to use',
  tablet: 'Quality refurbished tablets at great prices',
  smartwatch: 'Refurbished smartwatches with warranty',
  mac: 'Refurbished Mac and iMac devices with warranty',
  tv: 'Refurbished TVs tested and ready for home',
  earbuds: 'Certified refurbished earbuds at great prices',
  refrigerator: 'Refurbished refrigerators with warranty',
};

export default function BuyHubPage() {
  const [categories, setCategories] = useState(() => buyCategories(FALLBACK_WEBSITE_CATEGORIES));

  useEffect(() => {
    fetchWebsiteCategories().then((list) => setCategories(buyCategories(list)));
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-5 sm:pt-8 pb-10 sm:pb-16">
      <SEOHead
        title="Buy Refurbished Devices Online"
        description="Buy certified refurbished phones, laptops, tablets, TVs, earbuds and more from DeviceKart with warranty and best prices across India."
        path="/buy"
      />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Buy' }]} />

      <div className="text-center mb-8 sm:mb-10">
        <span className="inline-block bg-primary-light text-primary text-xs font-bold tracking-wider uppercase px-3.5 py-1 rounded-full mb-3">
          Buy Refurbished
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-text-primary mb-3">
          Choose a Category
        </h1>
        <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto leading-relaxed">
          Browse certified refurbished devices with warranty. Pick a category to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            to={cat.buyPath || `/buy/${cat.key}/brand`}
            className="group bg-white rounded-2xl border border-border p-6 transition-all duration-200 hover:border-primary hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(5,101,230,0.12)] no-underline"
          >
            <div className="h-24 flex items-center justify-center mb-4 bg-gray-50 rounded-xl overflow-hidden">
              <img
                src={categoryImage(cat)}
                alt={cat.label}
                className="h-full w-auto max-w-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <h2 className="text-lg font-extrabold text-text-primary group-hover:text-primary transition-colors mb-2">
              {cat.label}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              {BUY_DESCRIPTIONS[cat.key] || `Browse refurbished ${cat.label.toLowerCase()} devices`}
            </p>
            <span className="inline-flex text-xs font-bold text-primary bg-primary-light px-3 py-1.5 rounded-lg">
              Browse {cat.label} →
            </span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-12 sm:mt-16">
        {['Quality Checked', 'Warranty Included', 'Secure Checkout'].map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs sm:text-sm text-text-muted font-medium">
            <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
