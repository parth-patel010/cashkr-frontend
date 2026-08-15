import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { TOP_SEO_CITIES } from '../data/cities';
import { moneyPageKeywords } from '../data/seoKeywords';
import {
  breadcrumbSchema,
  buildSchemaGraph,
  faqPageSchema,
  organizationSchema,
  websiteSchema,
} from '../utils/schema';

const FAQ = [
  {
    q: 'What is the best old phone selling website in India?',
    a: 'DeviceKart is among the best old phone selling websites in India, offering instant online quotes, free doorstep pickup in 2,000+ cities, transparent pricing, and payment via UPI or bank transfer after verification.',
  },
  {
    q: 'How is DeviceKart different from Cashify?',
    a: 'Both are online buyback platforms. DeviceKart focuses on instant quotes, free pickup, and clear condition-based pricing. Compare features on our DeviceKart vs Cashify page.',
  },
  {
    q: 'Can I sell my phone without visiting a shop?',
    a: 'Yes. Get a quote online, schedule free doorstep pickup, and get paid after the device is verified at your location or as per the scheduled process.',
  },
];

const REASONS = [
  { title: 'Instant online quote', desc: 'Know your phone’s resale value in seconds before you commit.' },
  { title: 'Free doorstep pickup', desc: 'No courier fees or shop visits across serviceable pincodes.' },
  { title: 'Secure payment', desc: 'UPI, bank transfer, or cash after verification — no haggling.' },
  { title: 'Pan-India coverage', desc: 'Sell from metros and tier-2 cities with the same digital flow.' },
];

export default function BestOldPhoneSellingWebsite() {
  const path = '/best-old-phone-selling-website';
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema(FAQ),
    breadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Best old phone selling website', href: path },
    ]),
  ]);

  return (
    <>
      <SEOHead
        title="Best Old Phone Selling Website in India (2026) — DeviceKart"
        description="Looking for the best old phone selling website in India? DeviceKart gives instant quotes, free doorstep pickup, and secure payment. Compare buyback options and sell online today."
        path={path}
        keywords={moneyPageKeywords('best-website')}
        imageAlt="Best old phone selling website India — DeviceKart"
        schema={schema}
      />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <nav className="text-xs text-gray-500 mb-4 flex flex-wrap gap-1">
          <Link to="/" className="hover:text-[#0565E6] no-underline">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Best old phone selling website</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Best Old Phone Selling Website in India
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          If you searched for the best old phone selling website, you want fair pricing, pickup convenience,
          and trusted payment. DeviceKart is built for that: check your price online, book free doorstep
          pickup, and get paid after verification — without classifieds or local shop haggling.
        </p>

        <h2 className="text-xl font-black text-gray-900 mb-4">Why DeviceKart ranks among the best</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {REASONS.map((r) => (
            <div key={r.title} className="bg-white border border-gray-100 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>
              <p className="text-sm text-gray-500">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#EEF4FF] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">Sell in 3 steps</h2>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Select brand and model for an instant quote</li>
            <li>Verify pincode and schedule free pickup</li>
            <li>Get paid via UPI, bank transfer, or cash</li>
          </ol>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              to="/sell-old-mobile-phones/brand"
              className="inline-flex bg-[#0565E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#044ab8] transition-colors no-underline"
            >
              Get instant quote
            </Link>
            <Link
              to="/compare/devicekart-vs-cashify"
              className="inline-flex border border-[#0565E6]/30 text-[#0565E6] font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors no-underline"
            >
              vs Cashify
            </Link>
          </div>
        </div>

        <h2 className="text-lg font-black text-gray-900 mb-3">Popular city pages</h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {TOP_SEO_CITIES.slice(0, 12).map((c) => (
            <Link
              key={c.slug}
              to={`/sell-old-phone-in/${c.slug}`}
              className="text-sm text-[#0565E6] hover:underline no-underline px-2 py-1"
            >
              Sell in {c.name}
            </Link>
          ))}
        </div>

        <div className="space-y-4 mb-8">
          {FAQ.map((faq) => (
            <article key={faq.q} className="border border-gray-100 rounded-2xl p-6 bg-white">
              <h2 className="text-lg font-black text-gray-900 mb-2">{faq.q}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </article>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Related:{' '}
          <Link to="/best-place-to-sell-old-phone-india" className="text-[#0565E6] hover:underline">
            Best place to sell old phone India
          </Link>
          {' · '}
          <Link to="/sell-old-phone-online-india" className="text-[#0565E6] hover:underline">
            Sell old phone online India
          </Link>
          {' · '}
          <Link to="/alternatives/cashify-alternatives" className="text-[#0565E6] hover:underline">
            Cashify alternatives
          </Link>
        </p>
      </div>
    </>
  );
}
