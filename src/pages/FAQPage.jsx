import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { EXPANDED_FAQS } from '../data/faqs';
import { buildSchemaGraph, faqPageSchema, organizationSchema, websiteSchema } from '../utils/schema';

export default function FAQPage() {
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema(EXPANDED_FAQS),
  ]);

  return (
    <>
      <SEOHead
        title="DeviceKart FAQs — Sell Old Devices Online in India"
        description="Find answers about selling old phones, laptops, tablets and iMac on DeviceKart. Pricing, free pickup, payment methods, and Cashify alternatives explained."
        path="/faq"
        schema={schema}
      />
      <div className="max-w-[800px] mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Everything you need to know about selling your old devices on DeviceKart — India's trusted buyback platform.
        </p>
        <div className="space-y-6">
          {EXPANDED_FAQS.map((faq) => (
            <article key={faq.q} className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-sm text-gray-500">
          Still have questions?{' '}
          <Link to="/help-center" className="text-[#0565E6] font-bold hover:underline">
            Contact our support team
          </Link>
          .
        </p>
      </div>
    </>
  );
}
