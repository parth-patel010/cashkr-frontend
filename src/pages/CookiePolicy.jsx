import SEOHead from "../components/seo/SEOHead";
import { SUPPORT_EMAIL, LEGAL_NAME } from "../config/seo";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";

export default function CookiePolicyPage() {
  const schema = buildSchemaGraph([organizationSchema(), websiteSchema()]);

  return (
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Cookie Policy — DeviceKart"
        description="Learn how DeviceKart uses cookies and similar technologies on devicekart.in."
        path="/cookie-policy"
        schema={schema}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Cookie Policy</h1>
        <div className="prose prose-blue text-gray-600">
          <p className="mb-4">Last updated: July 2026</p>
          <p className="mb-4">
            This Cookie Policy explains how {LEGAL_NAME} (&quot;DeviceKart&quot;) uses cookies and similar technologies when you visit devicekart.in.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. What Are Cookies?</h2>
          <p className="mb-4">
            Cookies are small text files stored on your device that help websites remember preferences, keep you signed in, and understand how the site is used.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Cookies</h2>
          <p className="mb-4">
            We use essential cookies for authentication and security, analytics cookies to improve our sell-device experience, and marketing cookies (such as Meta Pixel) to measure campaign performance where permitted.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Managing Cookies</h2>
          <p className="mb-4">
            You can control cookies through your browser settings. Disabling certain cookies may affect login, checkout, and personalization features.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Contact</h2>
          <p className="mb-4">
            Questions about this policy can be sent to {SUPPORT_EMAIL}.
          </p>
        </div>
      </div>
    </div>
  );
}
