import { Link } from 'react-router-dom';
import { getModelSeoContent } from '../../utils/deviceSeo';

export default function ModelSeoContent({ device, brandName }) {
  if (!device) return null;
  const { paragraph, faqs } = getModelSeoContent(device, brandName);

  return (
    <section className="mt-12 pt-10 border-t border-gray-100">
      <h2 className="text-xl font-black text-gray-900 mb-4">
        Sell {device.modelName} on DeviceKart
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-8">{paragraph}</p>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <article key={faq.q} className="bg-[#F8FAFF] rounded-xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm mb-2">{faq.q}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{faq.a}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 text-xs text-gray-400">
        <Link to="/faq" className="text-[#0565E6] hover:underline">
          View all FAQs
        </Link>
        {' · '}
        <Link to="/compare/devicekart-vs-cashify" className="text-[#0565E6] hover:underline">
          Compare with Cashify
        </Link>
      </p>
    </section>
  );
}
