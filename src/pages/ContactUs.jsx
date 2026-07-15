import SEOHead from "../components/seo/SEOHead";
import { SUPPORT_EMAIL, PHONE, WHATSAPP, LEGAL_NAME } from "../config/seo";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";

export default function ContactUsPage() {
  const schema = buildSchemaGraph([organizationSchema(), websiteSchema()]);
  const whatsappLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi, I need help with DeviceKart.")}`;

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Contact Us — DeviceKart"
        description="Contact DeviceKart support for sell pickup, payments, and account help across India."
        path="/contact-us"
        schema={schema}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Reach the DeviceKart team operated by {LEGAL_NAME}. We typically respond within one business day.
        </p>
        <div className="space-y-4 text-gray-700">
          <p>
            <span className="font-bold text-gray-900">Email:</span>{" "}
            <a className="text-[#0565E6]" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
          <p>
            <span className="font-bold text-gray-900">Phone:</span>{" "}
            <a className="text-[#0565E6]" href={`tel:${PHONE}`}>{PHONE}</a>
          </p>
          <p>
            <span className="font-bold text-gray-900">WhatsApp:</span>{" "}
            <a className="text-[#0565E6]" href={whatsappLink} target="_blank" rel="noopener noreferrer">
              Chat with support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
