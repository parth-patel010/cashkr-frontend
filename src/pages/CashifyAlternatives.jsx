import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { buildSchemaGraph, faqPageSchema, organizationSchema, websiteSchema } from '../utils/schema';

const ALTERNATIVES = [
  {
    name: 'DeviceKart',
    highlight: true,
    description: 'India\'s trusted buyback platform with instant quotes, free doorstep pickup across 2,000+ cities, and payment via UPI, bank transfer, or cash.',
    pros: ['Transparent no-haggle pricing', 'Free pickup in 2,000+ cities', 'Mobile, laptop, tablet, iMac'],
    url: '/sell-old-mobile-phones/brand',
  },
  {
    name: 'Cashify',
    highlight: false,
    description: 'Established Indian re-commerce platform for selling and buying used smartphones, laptops, and electronics with store and online options.',
    pros: ['Wide brand recognition', 'Buy and sell options', 'Physical store network'],
    url: null,
  },
  {
    name: 'OLX',
    highlight: false,
    description: 'Peer-to-peer classifieds marketplace where you list devices and negotiate directly with buyers.',
    pros: ['Direct buyer contact', 'Wide category coverage', 'Free listings'],
    url: null,
  },
  {
    name: 'Amazon / Flipkart Exchange',
    highlight: false,
    description: 'Exchange programs when buying a new device — trade-in credit applied to your new purchase rather than direct cash.',
    pros: ['Convenient during upgrade', 'Trusted e-commerce brands', 'Exchange during checkout'],
    url: null,
  },
];

const FAQ = {
  q: 'What are the best Cashify alternatives in India?',
  a: 'Top Cashify alternatives for selling old devices in India include DeviceKart (instant quotes and free pickup), OLX (peer-to-peer listings), and exchange programs on Amazon or Flipkart when upgrading to a new device.',
};

export default function CashifyAlternatives() {
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema([FAQ]),
  ]);

  return (
    <>
      <SEOHead
        title="Best Cashify Alternatives in India (2026) — Sell Old Devices Online"
        description="Looking for Cashify alternatives? Compare DeviceKart, OLX, and exchange programs for selling old phones, laptops and tablets in India with free pickup and instant cash."
        path="/alternatives/cashify-alternatives"
        schema={schema}
      />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Best Cashify Alternatives in India
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          If you're exploring options beyond Cashify to sell your old phone, laptop, or tablet, here are the leading alternatives in India — including DeviceKart, which offers instant quotes and free doorstep pickup nationwide.
        </p>

        <div className="space-y-6">
          {ALTERNATIVES.map((alt) => (
            <article
              key={alt.name}
              className={`rounded-2xl p-6 border ${alt.highlight ? 'border-[#0565E6] bg-[#EEF4FF] shadow-md' : 'border-gray-100 bg-white shadow-sm'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xl font-black text-gray-900">{alt.name}</h2>
                {alt.highlight && (
                  <span className="text-xs font-bold bg-[#0565E6] text-white px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{alt.description}</p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                {alt.pros.map((pro) => (
                  <li key={pro} className="flex items-center gap-2">
                    <span className="text-[#0565E6] font-bold">✓</span> {pro}
                  </li>
                ))}
              </ul>
              {alt.url && (
                <Link to={alt.url} className="text-[#0565E6] font-bold text-sm hover:underline">
                  Get instant quote on DeviceKart →
                </Link>
              )}
            </article>
          ))}
        </div>

        <div className="mt-10 p-6 bg-white border border-gray-100 rounded-2xl">
          <h2 className="text-lg font-black text-gray-900 mb-2">{FAQ.q}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{FAQ.a}</p>
        </div>
      </div>
    </>
  );
}
