import { Link, useParams } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import PincodeBox from '../components/PincodeBox';
import { getCityBySlug } from '../data/cities';
import { buildSchemaGraph, localBusinessSchema, organizationSchema, websiteSchema } from '../utils/schema';
import NotFoundPage from './NotFoundPage';

const TOP_BRANDS = [
  { name: 'Apple', path: '/sell-old-mobile-phones/apple' },
  { name: 'Samsung', path: '/sell-old-mobile-phones/samsung' },
  { name: 'OnePlus', path: '/sell-old-mobile-phones/oneplus' },
  { name: 'Xiaomi', path: '/sell-old-mobile-phones/xiaomi' },
  { name: 'Vivo', path: '/sell-old-mobile-phones/vivo' },
  { name: 'Oppo', path: '/sell-old-mobile-phones/oppo' },
];

export default function CityLandingPage() {
  const { city: citySlug } = useParams();
  const city = getCityBySlug(citySlug);

  if (!city) return <NotFoundPage />;

  const path = `/sell-old-phone-in/${city.slug}`;
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    localBusinessSchema(city.name),
  ]);

  return (
    <>
      <SEOHead
        title={`Sell Old Phone in ${city.name} — Free Pickup & Instant Cash`}
        description={`Sell your old mobile phone in ${city.name}, ${city.state} with DeviceKart. Free doorstep pickup, instant online quote, and secure payment across ${city.name}.`}
        path={path}
        schema={schema}
      />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Sell Old Phone in {city.name}
        </h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          DeviceKart offers free doorstep pickup in {city.name}, {city.state}. Sell your used smartphone online without visiting a shop — get an instant quote, schedule pickup from home, and receive payment via UPI or bank transfer after verification.
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
              Sell {brand.name}
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { step: '1', title: 'Get instant quote', desc: 'Select your phone model and condition' },
            { step: '2', title: 'Free pickup in ' + city.name, desc: 'Schedule at your convenience' },
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

        <Link
          to="/sell-old-mobile-phones/brand"
          className="inline-flex bg-[#0565E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#044ab8] transition-colors no-underline"
        >
          Start selling in {city.name}
        </Link>
      </div>
    </>
  );
}
