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
    q: 'Can I sell my old phone online in India?',
    a: 'Yes. With DeviceKart you can sell your old phone online from anywhere in India with a serviceable pincode. Get an instant quote, book free doorstep pickup, and receive payment after verification.',
  },
  {
    q: 'How long does online phone sell take?',
    a: 'Quotes are instant. Pickup is scheduled at your convenience. Payment is released after device verification — often the same day depending on your slot and location.',
  },
  {
    q: 'Which devices can I sell online?',
    a: 'Sell mobiles, tablets, laptops, and Mac devices online on DeviceKart. Start from the category hubs or the main sell flow.',
  },
];

export default function SellOldPhoneOnlineIndia() {
  const path = '/sell-old-phone-online-india';
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema(FAQ),
    breadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: 'Sell old phone online India', href: path },
    ]),
  ]);

  return (
    <>
      <SEOHead
        title="Sell Old Phone Online in India — Free Pickup & Instant Cash | DeviceKart"
        description="Sell your old phone online in India with DeviceKart. Instant quote, free doorstep pickup in 2,000+ cities, and secure UPI/bank payment. Start selling used mobiles today."
        path={path}
        keywords={moneyPageKeywords('online-india')}
        imageAlt="Sell old phone online India — DeviceKart free pickup"
        schema={schema}
      />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <nav className="text-xs text-gray-500 mb-4 flex flex-wrap gap-1">
          <Link to="/" className="hover:text-[#0565E6] no-underline">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Sell old phone online India</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Sell Old Phone Online in India
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Selling a used phone online in India should be simple: know your price, get free pickup, and get
          paid securely. DeviceKart lets you sell old phones, tablets, and laptops from home with an instant
          online quote and doorstep pickup across thousands of cities.
        </p>

        <h2 className="text-xl font-black text-gray-900 mb-4">How online sell works</h2>
        <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside mb-8">
          <li>Choose your brand and model on DeviceKart</li>
          <li>Answer a short condition quiz for an accurate quote</li>
          <li>Enter your pincode and schedule free doorstep pickup</li>
          <li>Complete verification and receive UPI, bank, or cash payment</li>
        </ol>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/sell-old-mobile-phones/brand"
            className="inline-flex bg-[#0565E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#044ab8] transition-colors no-underline"
          >
            Sell mobile online
          </Link>
          <Link
            to="/sell"
            className="inline-flex border border-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl hover:border-[#0565E6] hover:text-[#0565E6] transition-colors no-underline"
          >
            All categories
          </Link>
          <Link
            to="/best-old-phone-selling-website"
            className="inline-flex border border-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl hover:border-[#0565E6] hover:text-[#0565E6] transition-colors no-underline"
          >
            Best selling website
          </Link>
        </div>

        <h2 className="text-lg font-black text-gray-900 mb-3">Sell by city</h2>
        <div className="flex flex-wrap gap-2 mb-10">
          {TOP_SEO_CITIES.map((c) => (
            <Link
              key={c.slug}
              to={`/sell-old-phone-in/${c.slug}`}
              className="text-sm text-[#0565E6] hover:underline no-underline px-2 py-1"
            >
              {c.name}
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
          Also read:{' '}
          <Link to="/best-place-to-sell-old-phone-india" className="text-[#0565E6] hover:underline">
            Best place to sell old phone
          </Link>
          {' · '}
          <Link to="/compare/devicekart-vs-cashify" className="text-[#0565E6] hover:underline">
            DeviceKart vs Cashify
          </Link>
        </p>
      </div>
    </>
  );
}
