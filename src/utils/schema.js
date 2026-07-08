import {
  SITE_URL,
  SITE_NAME,
  LEGAL_NAME,
  DEFAULT_OG_IMAGE,
  PHONE,
  SUPPORT_EMAIL,
  SAME_AS,
} from '../config/seo';

function baseContext() {
  return { '@context': 'https://schema.org' };
}

export function organizationSchema(overrides = {}) {
  return {
    ...baseContext(),
    '@type': 'Organization',
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    sameAs: SAME_AS,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: PHONE,
      email: SUPPORT_EMAIL,
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    ...overrides,
  };
}

export function websiteSchema() {
  return {
    ...baseContext(),
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@type': 'Organization', name: SITE_NAME },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/sell-old-mobile-phones/brand?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function faqPageSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    ...baseContext(),
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumbSchema(items) {
  if (!items?.length) return null;
  return {
    ...baseContext(),
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}` } : {}),
    })),
  };
}

export function productSchema({ name, description, image, brand, minPrice, maxPrice, url }) {
  const schema = {
    ...baseContext(),
    '@type': 'Product',
    name,
    description,
    brand: { '@type': 'Brand', name: brand },
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
  };
  if (image) schema.image = image;
  if (minPrice != null || maxPrice != null) {
    schema.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: minPrice ?? maxPrice,
      highPrice: maxPrice ?? minPrice,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    };
  }
  return schema;
}

export function howToSchema(steps) {
  return {
    ...baseContext(),
    '@type': 'HowTo',
    name: 'How to sell your old device on DeviceKart',
    description: 'Get instant cash for your old phone, tablet, laptop or Mac in three simple steps.',
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.desc,
    })),
  };
}

export function localBusinessSchema(cityName) {
  return {
    ...baseContext(),
    '@type': 'LocalBusiness',
    name: `${SITE_NAME} — ${cityName}`,
    url: SITE_URL,
    telephone: PHONE,
    areaServed: { '@type': 'City', name: cityName, containedInPlace: { '@type': 'Country', name: 'India' } },
    parentOrganization: { '@type': 'Organization', name: SITE_NAME },
  };
}

export function buildSchemaGraph(schemas) {
  const filtered = schemas.filter(Boolean);
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0];
  return { ...baseContext(), '@graph': filtered };
}
