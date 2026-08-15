import { Link, useParams } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import PincodeBox from '../components/PincodeBox';
import { CITIES, getCityBySlug, TOP_SEO_CITIES } from '../data/cities';
import { cityKeywords } from '../data/seoKeywords';
import {
  breadcrumbSchema,
  buildSchemaGraph,
  faqPageSchema,
  localBusinessSchema,
  organizationSchema,
  websiteSchema,
} from '../utils/schema';
import NotFoundPage from './NotFoundPage';

const TOP_BRANDS = [
  { name: 'Apple', path: '/sell-old-mobile-phones/apple' },
  { name: 'Samsung', path: '/sell-old-mobile-phones/samsung' },
  { name: 'OnePlus', path: '/sell-old-mobile-phones/oneplus' },
  { name: 'Xiaomi', path: '/sell-old-mobile-phones/xiaomi' },
  { name: 'Vivo', path: '/sell-old-mobile-phones/vivo' },
  { name: 'Oppo', path: '/sell-old-mobile-phones/oppo' },
];

function cityFaqs(city) {
  return [
    {
      q: `How do I sell my old phone in ${city.name}?`,
      a: `On DeviceKart, select your brand and model, get an instant online quote, verify your ${city.name} pincode, and schedule free doorstep pickup. After verification you are paid via UPI, bank transfer, or cash.`,
    },
    {
      q: `Is phone pickup free in ${city.name}?`,
      a: `Yes. DeviceKart offers free doorstep pickup across serviceable areas in ${city.name}, ${city.state}, with no hidden pickup charges.`,
    },
    {
      q: `What is the best place to sell an old phone in ${city.name}?`,
      a: `DeviceKart is a trusted online buyback option in ${city.name} for instant quotes, transparent pricing, and same-city doorstep pickup — without visiting a local shop or negotiating on classifieds.`,
    },
    {
      q: `Can I sell iPhone and Samsung phones in ${city.name}?`,
      a: `Yes. You can sell Apple iPhone, Samsung, OnePlus, Xiaomi, Vivo, Oppo and more in ${city.name} through DeviceKart’s online sell flow.`,
    },
  ];
}

export default function CityLandingPage() {
  const { city: citySlug } = useParams();
  const city = getCityBySlug(citySlug);

  if (!city) return <NotFoundPage />;

  const path = `/sell-old-phone-in/${city.slug}`;
  const faqs = cityFaqs(city);
  const nearby = CITIES.filter((c) => c.slug !== city.slug && c.state === city.state).slice(0, 6);
  const moreCities = (nearby.length >= 4 ? nearby : TOP_SEO_CITIES.filter((c) => c.slug !== city.slug)).slice(0, 10);

  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    localBusinessSchema(city.name, path),
    faqPageSchema(faqs),
    breadcrumbSchema([
      { label: 'Home', href: '/' },
      { label: `Sell old phone in ${city.name}`, href: path },
    ]),
  ]);

  return (
    <>
      <SEOHead
        title={`Sell Old Phone in ${city.name} — Free Pickup & Instant Cash | DeviceKart`}
        description={`Best way to sell old phone in ${city.name}, ${city.state}. Instant online quote, free doorstep pickup, and secure UPI/bank payment with DeviceKart — a trusted Cashify alternative.`}
        path={path}
        keywords={cityKeywords(city.name)}
        imageAlt={`Sell old phone in ${city.name} with DeviceKart doorstep pickup`}
        schema={schema}
      />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <nav className="text-xs text-gray-500 mb-4 flex flex-wrap gap-1">
          <Link to="/" className="hover:text-[#0565E6] no-underline">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Sell old phone in {city.name}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Sell Old Phone in {city.name} for Instant Cash
        </h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Looking for the best place to sell your old phone in {city.name}? DeviceKart offers free doorstep
          pickup in {city.name}, {city.state}. Get an instant online quote, schedule pickup from home, and
          receive payment via UPI or bank transfer after verification — no shop visit, no haggling.
        </p>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-3">Check serviceability in {city.name}</h2>
          <PincodeBox onVerified={() => {}} />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-4">Popular brands in {city.name}</h2>
        <div className="flex flex-wrap gap-3 mb-10">
          {TOP_BRANDS.map((brand) => (
            <Link
              key={brand.name}
              to={brand.path}
              className="bg-[#F8FAFF] border border-gray-200 rounded-xl px-5 py-3 text-sm font-bold text-gray-700 hover:border-[#0565E6] hover:text-[#0565E6] transition-colors no-underline"
            >
              Sell {brand.name} in {city.name}
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { step: '1', title: 'Get instant quote', desc: 'Select your phone model and condition' },
            { step: '2', title: `Free pickup in ${city.name}`, desc: 'Schedule at your convenience' },
            { step: '3', title: 'Instant payment', desc: 'UPI, bank transfer, or cash' },
          ].map((s) => (
            <div key={s.step} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="w-8 h-8 bg-[#0565E6] text-white rounded-full flex items-center justify-center font-black text-sm mb-3">
                {s.step}
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          People in {city.name} search for phone buyback, doorstep pickup, sell iPhone for cash, and Cashify
          alternatives. DeviceKart covers mobiles, tablets, and laptops with transparent pricing. Compare us on{' '}
          <Link to="/compare/devicekart-vs-cashify" className="text-[#0565E6] font-semibold hover:underline">
            DeviceKart vs Cashify
          </Link>
          , explore the{' '}
          <Link to="/best-old-phone-selling-website" className="text-[#0565E6] font-semibold hover:underline">
            best old phone selling website
          </Link>
          , or sell online across India via{' '}
          <Link to="/sell-old-phone-online-india" className="text-[#0565E6] font-semibold hover:underline">
            sell old phone online India
          </Link>
          .
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            to="/sell-old-mobile-phones/brand"
            className="inline-flex bg-[#0565E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#044ab8] transition-colors no-underline"
          >
            Start selling in {city.name}
          </Link>
          <Link
            to="/sell"
            className="inline-flex border border-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl hover:border-[#0565E6] hover:text-[#0565E6] transition-colors no-underline"
          >
            All categories
          </Link>
          <Link
            to="/best-place-to-sell-old-phone-india"
            className="inline-flex border border-gray-200 text-gray-800 font-bold px-6 py-3 rounded-xl hover:border-[#0565E6] hover:text-[#0565E6] transition-colors no-underline"
          >
            Best place to sell
          </Link>
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-4">FAQs — sell phone in {city.name}</h2>
        <div className="space-y-4 mb-10">
          {faqs.map((faq) => (
            <article key={faq.q} className="border border-gray-100 rounded-2xl p-5 bg-white">
              <h3 className="font-bold text-gray-900 text-sm mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </article>
          ))}
        </div>

        <h2 className="text-lg font-black text-gray-900 mb-3">Sell in other cities</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {moreCities.map((c) => (
            <Link
              key={c.slug}
              to={`/sell-old-phone-in/${c.slug}`}
              className="text-sm text-[#0565E6] hover:underline no-underline px-2 py-1"
            >
              Sell old phone in {c.name}
            </Link>
          ))}
        </div>

        <div className="text-sm text-gray-500">
          Also see:{' '}
          <Link to="/sell-old-mobile-phones/brand" className="text-[#0565E6] hover:underline">Sell mobiles</Link>
          {' · '}
          <Link to="/sell-old-laptops/brand" className="text-[#0565E6] hover:underline">Sell laptops</Link>
          {' · '}
          <Link to="/alternatives/cashify-alternatives" className="text-[#0565E6] hover:underline">Cashify alternatives</Link>
        </div>
      </div>
    </>
  );
}
