import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { buildSchemaGraph, organizationSchema, websiteSchema } from '../utils/schema';

const COMPARISON_ROWS = [
  { feature: 'Free doorstep pickup', devicekart: 'Yes — 2,000+ cities', cashify: 'Yes — major cities' },
  { feature: 'Instant online quote', devicekart: 'Yes', cashify: 'Yes' },
  { feature: 'Payment methods', devicekart: 'UPI, bank transfer, cash', cashify: 'UPI, bank transfer, wallet' },
  { feature: 'Device categories', devicekart: 'Mobile, tablet, laptop, iMac', cashify: 'Mobile, laptop, tablet, more' },
  { feature: 'Transparent pricing', devicekart: 'Fixed quote — no haggling', cashify: 'Quote-based pricing' },
  { feature: 'Corporate bulk disposal', devicekart: 'Yes — dedicated program', cashify: 'Yes' },
  { feature: 'Data security', devicekart: 'Verified agents, reset guidance', cashify: 'Data wipe services' },
  { feature: 'Official invoice', devicekart: 'Yes', cashify: 'Yes' },
];

export default function CompareDeviceKartVsCashify() {
  const schema = buildSchemaGraph([organizationSchema(), websiteSchema()]);

  return (
    <>
      <SEOHead
        title="DeviceKart vs Cashify — Compare Device Buyback Platforms in India"
        description="Compare DeviceKart and Cashify for selling old phones, laptops and tablets in India. Features, pickup, payment, and pricing compared side by side."
        path="/compare/devicekart-vs-cashify"
        schema={schema}
      />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          DeviceKart vs Cashify
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          An honest comparison of two leading device buyback platforms in India. Both help you sell old electronics online with doorstep pickup — here's how they compare on key features.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFF]">
                <th className="text-left p-4 font-black text-gray-900">Feature</th>
                <th className="text-left p-4 font-black text-[#0565E6]">DeviceKart</th>
                <th className="text-left p-4 font-black text-gray-700">Cashify</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="border-t border-gray-100">
                  <td className="p-4 font-semibold text-gray-800">{row.feature}</td>
                  <td className="p-4 text-gray-600">{row.devicekart}</td>
                  <td className="p-4 text-gray-600">{row.cashify}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[#EEF4FF] rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">Why choose DeviceKart?</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            DeviceKart focuses on transparent, no-haggle pricing with free pickup across 2,000+ Indian cities. Get an instant quote, schedule pickup from home, and receive payment immediately after verification.
          </p>
          <Link
            to="/sell-old-mobile-phones/brand"
            className="inline-flex items-center gap-2 bg-[#0565E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#044ab8] transition-colors no-underline"
          >
            Sell your device on DeviceKart
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          This comparison is based on publicly available information and DeviceKart's service offerings. Features may vary. Cashify is a registered trademark of its respective owner.
        </p>
      </div>
    </>
  );
}
