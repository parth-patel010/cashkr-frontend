import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import { PHONE, SUPPORT_EMAIL } from "../config/seo";
import { buildSchemaGraph, organizationSchema, websiteSchema } from "../utils/schema";

export default function HelpCenterPage() {
  const schema = buildSchemaGraph([organizationSchema(), websiteSchema()]);

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="DeviceKart Help Center — FAQs & Support"
        description="Contact DeviceKart support for help selling your old phone, laptop, or tablet. Phone, email, and WhatsApp support available across India."
        path="/help-center"
        schema={schema}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">How can we help?</h1>
          <p className="text-lg text-gray-600">Get in touch with our support team for any queries or assistance.</p>
          <p className="mt-4">
            <Link to="/faq" className="text-[#0565E6] font-bold hover:underline">
              Browse FAQs →
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Contact Info */}
            <div className="bg-[#0565E6] p-10 text-white">
              <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 mt-1 text-blue-200" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Phone Support</h3>
                    <p className="text-blue-100">{PHONE}</p>
                    <p className="text-sm text-blue-200 mt-1">Mon-Sat from 9am to 6pm IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 mt-1 text-blue-200" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <p className="text-blue-100">{SUPPORT_EMAIL}</p>
                    <p className="text-sm text-blue-200 mt-1">We aim to reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 mt-1 text-blue-200" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Service Area</h3>
                    <p className="text-blue-100">Pan-India — 2,000+ cities<br />Operated by Swastika Innovation Pvt. Ltd.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0565E6] focus:ring-1 focus:ring-[#0565E6]" placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0565E6] focus:ring-1 focus:ring-[#0565E6]" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0565E6] focus:ring-1 focus:ring-[#0565E6]" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" className="w-full bg-[#0565E6] text-white font-bold rounded-xl py-3 hover:bg-blue-700 transition duration-200">
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
