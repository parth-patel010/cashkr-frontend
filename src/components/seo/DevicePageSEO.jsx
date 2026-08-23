import SEOHead from './SEOHead';
import { getDeviceSeoMeta, getModelSeoContent } from '../../utils/deviceSeo';
import { modelSellKeywords } from '../../data/seoKeywords';
import {
  buildSchemaGraph,
  breadcrumbSchema,
  faqPageSchema,
  organizationSchema,
  productSchema,
  websiteSchema,
} from '../../utils/schema';

export default function DevicePageSEO({
  device,
  brand,
  pathPrefix,
  breadcrumbItems,
  categoryLabel,
  categoryKey = 'mobile',
}) {
  if (!device) return null;

  const meta = getDeviceSeoMeta(device, { brand, pathPrefix, categoryLabel });
  const { faqs } = getModelSeoContent(device, meta.brandName);
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    productSchema({
      name: device.modelName,
      description: meta.description,
      image: device.imageUrl,
      brand: meta.brandName,
      minPrice: meta.minPrice,
      maxPrice: meta.maxPrice,
      url: meta.path,
    }),
    faqPageSchema(faqs),
    breadcrumbItems ? breadcrumbSchema(breadcrumbItems) : null,
  ]);

  return (
    <SEOHead
      title={meta.title}
      description={meta.description}
      path={meta.path}
      image={meta.image}
      imageAlt={`Sell ${device.modelName} online on DeviceKart`}
      keywords={modelSellKeywords(categoryKey, brand, device.modelName)}
      type="product"
      schema={schema}
    />
  );
}

export function CategoryPageSEO({ title, description, path, breadcrumbItems, keywords, faqs }) {
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    breadcrumbItems ? breadcrumbSchema(breadcrumbItems) : null,
    faqs?.length ? faqPageSchema(faqs) : null,
  ]);

  return (
    <SEOHead
      title={title}
      description={description}
      path={path}
      keywords={keywords}
      schema={schema}
    />
  );
}
