import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { buildSchemaGraph, faqPageSchema, organizationSchema, websiteSchema } from '../utils/schema';

const FAQ = {
  q: 'What is the best place to sell old phone in India?',
  a: 'DeviceKart is among the best places to sell old phones in India, offering instant online quotes, free doorstep pickup in 2,000+ cities, and immediate payment via UPI or bank transfer after device verification.',
};

const PLATFORMS = [
  { name: 'DeviceKart', type: 'Buyback platform', bestFor: 'Instant cash, free pickup, no haggling', link: '/sell-old-mobile-phones/brand' },
  { name: 'Cashify', type: 'Buyback platform', bestFor: 'Established brand, buy & sell', link: null },
  { name: 'OLX', type: 'Classifieds', bestFor: 'Direct buyer negotiation', link: null },
  { name: 'Local shops', type: 'Offline', bestFor: 'Immediate cash in hand', link: null },
];

export default function BestPlaceToSellPhone() {
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema([FAQ]),
  ]);

  return (
    <>
      <SEOHead
        title="Best Place to Sell Old Phone in India (2026) — DeviceKart"
        description="Discover the best place to sell your old phone in India. Compare buyback platforms and learn why DeviceKart offers instant quotes, free pickup, and transparent pricing."
        path="/best-place-to-sell-old-phone-india"
        schema={schema}
      />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Best Place to Sell Old Phone in India
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Selling your old smartphone in India has never been easier. Online buyback platforms like DeviceKart let you get an instant quote, schedule free pickup from home, and receive payment within minutes — without visiting a shop or haggling with buyers.
        </p>

        <h2 className="text-xl font-black text-gray-900 mb-4">Top options compared</h2>
        <div className="space-y-4 mb-10">
          {PLATFORMS.map((p) => (
            <div key={p.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-white border border-gray-100 rounded-xl">
              <span className="font-black text-gray-900 w-32">{p.name}</span>
              <span className="text-sm text-gray-500 w-36">{p.type}</span>
              <span className="text-sm text-gray-600 flex-1">{p.bestFor}</span>
              {p.link && (
                <Link to={p.link} className="text-[#0565E6] font-bold text-sm whitespace-nowrap hover:underline">
                  Sell now →
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#EEF4FF] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">Sell on DeviceKart in 3 steps</h2>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Select your phone brand and model for an instant price quote</li>
            <li>Verify your pincode and schedule free doorstep pickup</li>
            <li>Get paid via UPI, bank transfer, or cash after verification</li>
          </ol>
          <Link
            to="/sell-old-mobile-phones/brand"
            className="inline-flex mt-4 bg-[#0565E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#044ab8] transition-colors no-underline"
          >
            Get instant quote
          </Link>
        </div>

        <article className="border border-gray-100 rounded-2xl p-6">
          <h2 className="text-lg font-black text-gray-900 mb-2">{FAQ.q}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{FAQ.a}</p>
        </article>
      </div>
    </>
  );
}
