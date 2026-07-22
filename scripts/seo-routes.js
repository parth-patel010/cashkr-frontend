/**
 * Shared route list for sitemap and prerender generation.
 * Run: node scripts/seo-routes.js
 *
 * Full model routes go into the sitemap.
 * Prerender only uses a small high-priority set so `npm run build` stays fast.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://www.devicekart.in';
const API_BASE = process.env.VITE_API_BASE_URL || process.env.API_URL || 'http://localhost:5002/api';

const STATIC_ROUTES = [
  '/',
  '/about-us',
  '/partner',
  '/corporate',
  '/help-center',
  '/faq',
  '/privacy-policy',
  '/terms-and-conditions',
  '/cookie-policy',
  '/e-waste-policy',
  '/contact-us',
  '/careers',
  '/buy',
  '/compare/devicekart-vs-cashify',
  '/alternatives/cashify-alternatives',
  '/best-place-to-sell-old-phone-india',
  '/sell-old-mobile-phones/brand',
  '/sell-tablet/brand',
  '/sell-old-laptops/brand',
  '/sell-imac/brand',
  '/sell-old-iphone',
  '/sell-old-samsung-phone',
  '/sell-used-laptop',
  '/sell-old-ipad',
];

const CITIES = [
  'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune',
  'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'kochi', 'indore', 'nagpur',
  'coimbatore', 'visakhapatnam', 'bhopal', 'patna', 'vadodara', 'ludhiana',
  'surat', 'noida', 'gurgaon', 'thane', 'faridabad', 'ghaziabad', 'rajkot',
  'nashik', 'goa', 'mysore',
];

const CATEGORY_PATHS = {
  mobile: '/sell-old-mobile-phones',
  tablet: '/sell-tablet',
  laptop: '/sell-old-laptops',
  mac: '/sell-imac',
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.json();
}

/** Brand hub pages only — used for fast prerender. */
export async function collectBrandRoutes() {
  const routes = [...STATIC_ROUTES, ...CITIES.map((c) => `/sell-old-phone-in/${c}`)];

  await Promise.all(
    Object.entries(CATEGORY_PATHS).map(async ([category, pathPrefix]) => {
      try {
        const brands = await fetchJson(`${API_BASE}/devices/brands?category=${category}`);
        for (const b of brands) {
          routes.push(`${pathPrefix}/${b.brand.toLowerCase()}`);
        }
      } catch {
        console.warn(`Skipping ${category} brand routes — API not available at ${API_BASE}`);
      }
    }),
  );

  return [...new Set(routes)];
}

/** Full routes including every model page — used for sitemap only. */
export async function collectRoutes({ includeModels = true } = {}) {
  const routes = await collectBrandRoutes();
  if (!includeModels) return routes;

  for (const [category, pathPrefix] of Object.entries(CATEGORY_PATHS)) {
    try {
      const brands = await fetchJson(`${API_BASE}/devices/brands?category=${category}`);
      await Promise.all(
        brands.map(async (b) => {
          const brandSlug = b.brand.toLowerCase();
          try {
            const models = await fetchJson(
              `${API_BASE}/devices/models?brand=${brandSlug}&category=${category}`,
            );
            for (const m of models) {
              routes.push(`${pathPrefix}/${brandSlug}/${m.slug}`);
            }
          } catch {
            // skip models if API unavailable
          }
        }),
      );
    } catch {
      console.warn(`Skipping ${category} model routes — API not available at ${API_BASE}`);
    }
  }

  return [...new Set(routes)];
}

function buildSitemap(routes) {
  const today = new Date().toISOString().split('T')[0];
  const urls = routes.map((route) => {
    const priority =
      route === '/'
        ? '1.0'
        : route.includes('/brand') ||
            (route.startsWith('/sell-old-') && route.split('/').length <= 3)
          ? '0.9'
          : '0.8';
    const changefreq = route === '/' ? 'daily' : route.split('/').length > 3 ? 'weekly' : 'daily';
    return `  <url>
    <loc>${SITE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

async function main() {
  const fullSeo = process.env.FULL_SEO === '1' || process.argv.includes('--full');
  const publicDir = path.join(__dirname, '..', 'public');
  const routesFile = path.join(__dirname, '..', 'prerender-routes.json');

  // Fast path: static + brand hubs for prerender (default)
  const prerenderRoutes = await collectBrandRoutes();
  fs.writeFileSync(routesFile, JSON.stringify(prerenderRoutes, null, 2));

  // Sitemap: full model list only when --full / FULL_SEO=1
  let sitemapRoutes = prerenderRoutes;
  if (fullSeo) {
    console.log('--full — collecting all model routes for sitemap (slower)...');
    sitemapRoutes = await collectRoutes({ includeModels: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildSitemap(sitemapRoutes));
  console.log(
    `Generated sitemap.xml (${sitemapRoutes.length} urls) and prerender-routes.json (${prerenderRoutes.length} routes)`,
  );
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    const routes = [...STATIC_ROUTES, ...CITIES.map((c) => `/sell-old-phone-in/${c}`)];
    const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildSitemap(routes));
    fs.writeFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'prerender-routes.json'),
      JSON.stringify(routes, null, 2),
    );
    console.log(`Fallback: generated ${routes.length} static routes only`);
    process.exit(0);
  });
}

export { STATIC_ROUTES, CITIES, buildSitemap };
