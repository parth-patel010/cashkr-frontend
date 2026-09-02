import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, Wrench, ShoppingBag } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';

const FEATURE_META = {
  buy: {
    title: 'Buy Refurbished',
    description: 'Buy refurbished phones, laptops, and gadgets on DeviceKart — launching soon.',
    icon: ShoppingBag,
    hint: 'We are preparing certified refurbished devices with warranty and easy checkout.',
  },
  repair: {
    title: 'Repair Device',
    description: 'Book mobile and laptop repair on DeviceKart — launching soon.',
    icon: Wrench,
    hint: 'Doorstep repair with genuine parts and trained experts is on its way.',
  },
};

export default function ComingSoonPage({ feature = 'buy', title: titleProp }) {
  const meta = FEATURE_META[feature] || FEATURE_META.buy;
  const title = titleProp || meta.title;
  const Icon = meta.icon;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <SEOHead
        title={`${title} — Coming Soon`}
        description={meta.description}
        path={feature === 'repair' ? '/repair' : '/buy'}
      />
      <div className="w-20 h-20 rounded-3xl bg-[#E8F1FF] text-[#0565E6] flex items-center justify-center mb-8 shadow-sm">
        <Icon size={36} strokeWidth={1.8} aria-hidden />
      </div>
      <div className="inline-flex items-center gap-2 text-[#0565E6] text-xs font-black uppercase tracking-widest mb-4">
        <Clock size={16} aria-hidden />
        Coming Soon
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-[#111827] mb-3 tracking-tight">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-gray-500 font-semibold max-w-md leading-relaxed mb-10">
        {meta.hint}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0565E6] text-white font-black text-sm hover:bg-[#0452B9] transition-colors no-underline"
        >
          <ArrowLeft size={18} aria-hidden />
          Back to Home
        </Link>
        <Link
          to="/sell-old-mobile-phones/brand"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-800 font-black text-sm hover:border-[#0565E6] hover:text-[#0565E6] transition-colors no-underline"
        >
          Sell a Device
        </Link>
      </div>
    </div>
  );
}
