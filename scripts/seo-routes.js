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

// Prefer shared city list from src (ESM).
let CITY_SLUGS = null;
try {
  const citiesMod = await import('../src/data/cities.js');
  CITY_SLUGS = citiesMod.CITIES.map((c) => c.slug);
} catch {
  CITY_SLUGS = null;
}

const SITE_URL = 'https://www.devicekart.in';
const API_BASE = process.env.VITE_API_BASE_URL || process.env.API_URL || 'http://localhost:5002/api';

const STATIC_ROUTES = [
  '/',
  '/sell',
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
  '/best-old-phone-selling-website',
  '/sell-old-phone-online-india',
  '/sell-old-mobile-phones/brand',
  '/sell-tablet/brand',
  '/sell-old-laptops/brand',
  '/sell-imac/brand',
  '/sell-old-iphone',
  '/sell-old-samsung-phone',
  '/sell-used-laptop',
  '/sell-old-ipad',
];

const FALLBACK_CITIES = [
  'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune',
  'ahmedabad', 'jaipur', 'lucknow', 'chandigarh', 'kochi', 'indore', 'nagpur',
  'coimbatore', 'visakhapatnam', 'bhopal', 'patna', 'vadodara', 'ludhiana',
  'surat', 'noida', 'gurgaon', 'thane', 'faridabad', 'ghaziabad', 'rajkot',
  'nashik', 'goa', 'mysore',
];

const CITIES = CITY_SLUGS?.length ? CITY_SLUGS : FALLBACK_CITIES;

/** High-priority prerender: home, money pages, sell hub, top cities, brand hubs */
const PRERENDER_PRIORITY = [
  '/',
  '/sell',
  '/best-old-phone-selling-website',
  '/sell-old-phone-online-india',
  '/best-place-to-sell-old-phone-india',
  '/compare/devicekart-vs-cashify',
  '/alternatives/cashify-alternatives',
  '/sell-old-mobile-phones/brand',
  '/sell-tablet/brand',
  '/sell-old-laptops/brand',
  '/sell-imac/brand',
  '/sell-old-iphone',
  '/sell-old-samsung-phone',
  ...CITIES.slice(0, 20).map((c) => `/sell-old-phone-in/${c}`),
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

/** Brand hub pages + static SEO routes — used for sitemap base & full prerender list. */
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

/** Compact high-priority set for fast prerender. */
export function collectPriorityPrerenderRoutes() {
  return [...new Set(PRERENDER_PRIORITY)];
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
        : route.includes('best-old-phone') ||
            route.includes('sell-old-phone-online') ||
            route.includes('best-place-to-sell')
          ? '0.95'
          : route.includes('/brand') ||
              route.startsWith('/sell-old-phone-in/') ||
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

  // Prerender: high-priority money + top cities (fast). Full brand list still generated for sitemap base.
  const brandRoutes = await collectBrandRoutes();
  const prerenderRoutes = collectPriorityPrerenderRoutes();
  fs.writeFileSync(routesFile, JSON.stringify(prerenderRoutes, null, 2));

  let sitemapRoutes = brandRoutes;
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
      JSON.stringify(collectPriorityPrerenderRoutes(), null, 2),
    );
    console.log(`Fallback: generated ${routes.length} static routes only`);
    process.exit(0);
  });
}

export { STATIC_ROUTES, CITIES, buildSitemap };
