import { Link, useParams, useLocation } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead';
import { getCategoryHubBySlug } from '../data/categoryHubs';
import { EXPANDED_FAQS } from '../data/faqs';
import { buildSchemaGraph, faqPageSchema, organizationSchema, websiteSchema } from '../utils/schema';
import NotFoundPage from './NotFoundPage';

export default function CategoryHubPage() {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  const slug = paramSlug || location.pathname.replace(/^\//, '');
  const hub = getCategoryHubBySlug(slug);

  if (!hub) return <NotFoundPage />;

  const path = `/${hub.slug}`;
  const relevantFaqs = EXPANDED_FAQS.filter((f) =>
    hub.keywords.some((kw) => f.q.toLowerCase().includes(kw.toLowerCase()) || f.a.toLowerCase().includes(kw.toLowerCase()))
  ).slice(0, 4);

  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema(relevantFaqs.length ? relevantFaqs : EXPANDED_FAQS.slice(0, 3)),
  ]);

  return (
    <>
      <SEOHead title={hub.title} description={hub.description} path={path} schema={schema} />
      <div className="max-w-[900px] mx-auto px-4 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">{hub.title}</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">{hub.description}</p>

        <div className="prose prose-sm max-w-none text-gray-600 mb-8 space-y-4">
          <p>
            DeviceKart makes it simple to sell your used {hub.keywords[0]} in India. Our smart pricing algorithm gives you a fair, transparent quote based on your device model, storage, and condition — with no last-minute haggling at pickup.
          </p>
          <p>
            Once you accept the quote, schedule a free doorstep pickup at a time that works for you. A verified DeviceKart agent will inspect your device, and you'll receive instant payment via UPI, bank transfer, or cash after verification.
          </p>
          <h2 className="text-xl font-black text-gray-900">How pricing works</h2>
          <p>
            Your final price depends on the exact model, storage variant, physical condition, and functional status. Answer our condition quiz honestly for the most accurate quote. DeviceKart serves customers across 2,000+ cities in India.
          </p>
        </div>

        <Link
          to={hub.path}
          className="inline-flex bg-[#0565E6] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#044ab8] transition-colors no-underline mb-10"
        >
          Get instant quote →
        </Link>

        {relevantFaqs.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-4">Common questions</h2>
            <div className="space-y-4">
              {relevantFaqs.map((faq) => (
                <article key={faq.q} className="border border-gray-100 rounded-xl p-5 bg-white">
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
