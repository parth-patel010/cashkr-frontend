import SEOHead from "../components/seo/SEOHead";
import { SUPPORT_EMAIL, LEGAL_NAME } from "../config/seo";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";

export default function CareersPage() {
  const schema = buildSchemaGraph([organizationSchema(), websiteSchema()]);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Careers — DeviceKart"
        description="Join DeviceKart and Swastika Innovation. Explore career opportunities in India's device buyback platform."
        path="/careers"
        schema={schema}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Careers at DeviceKart</h1>
        <div className="prose prose-blue text-gray-600">
          <p className="mb-4">
            {LEGAL_NAME} is building India&apos;s most trusted platform to sell and recycle used devices. We look for people who care about customer trust, operations excellence, and sustainable tech.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Open roles</h2>
          <p className="mb-4">
            We post openings for operations, customer success, engineering, and city partnership roles as they become available. Share your resume even if you do not see a perfect match — we hire continuously for high-caliber talent.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How to apply</h2>
          <p className="mb-4">
            Email your resume and a short note about the role you want to{" "}
            <a className="text-[#0565E6]" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
            with the subject line &quot;Career — DeviceKart&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}
