import SEOHead from './SEOHead';
import { getDeviceSeoMeta } from '../../utils/deviceSeo';
import { buildSchemaGraph, breadcrumbSchema, organizationSchema, productSchema, websiteSchema } from '../../utils/schema';

export default function DevicePageSEO({ device, brand, pathPrefix, breadcrumbItems, categoryLabel }) {
  if (!device) return null;

  const meta = getDeviceSeoMeta(device, { brand, pathPrefix, categoryLabel });
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
    breadcrumbItems ? breadcrumbSchema(breadcrumbItems) : null,
  ]);

  return (
    <SEOHead
      title={meta.title}
      description={meta.description}
      path={meta.path}
      image={meta.image}
      type="product"
      schema={schema}
    />
  );
}

export function CategoryPageSEO({ title, description, path, breadcrumbItems }) {
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    breadcrumbItems ? breadcrumbSchema(breadcrumbItems) : null,
  ]);

  return (
    <SEOHead title={title} description={description} path={path} schema={schema} />
  );
}
