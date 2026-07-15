import SEOHead from "../components/seo/SEOHead";
import { SUPPORT_EMAIL, LEGAL_NAME } from "../config/seo";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";

export default function EWastePolicyPage() {
  const schema = buildSchemaGraph([organizationSchema(), websiteSchema()]);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="E-waste Policy — DeviceKart"
        description="DeviceKart e-waste policy. How we recycle and responsibly dispose of electronic waste in India."
        path="/e-waste-policy"
        schema={schema}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-6">E-waste Policy</h1>
        <div className="prose prose-blue text-gray-600">
          <p className="mb-4">Last updated: July 2026</p>
          <p className="mb-4">
            {LEGAL_NAME} operates DeviceKart with a commitment to responsible recycling and extending the life of consumer electronics across India.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Our Approach</h2>
          <p className="mb-4">
            Devices collected through our buyback program are inspected, refurbished where viable, and resold. Devices that cannot be refurbished are channelled to authorized recyclers in line with applicable e-waste rules.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Data Security Before Recycling</h2>
          <p className="mb-4">
            Customers are advised to factory-reset devices and remove SIM/memory cards before pickup. We follow secure handling practices during inspection and processing.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Consumer Responsibility</h2>
          <p className="mb-4">
            Do not dispose of electronic waste with regular household garbage. Use authorized collection points or DeviceKart pickup where available.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Contact</h2>
          <p className="mb-4">
            For e-waste related queries, contact {SUPPORT_EMAIL}.
          </p>
        </div>
      </div>
    </div>
  );
}
