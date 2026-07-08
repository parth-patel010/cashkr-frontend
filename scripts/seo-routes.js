/**
 * Shared route list for sitemap and prerender generation.
 * Run: node scripts/seo-routes.js
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

export async function collectRoutes() {
  const routes = [...STATIC_ROUTES, ...CITIES.map((c) => `/sell-old-phone-in/${c}`)];

  for (const [category, pathPrefix] of Object.entries(CATEGORY_PATHS)) {
    try {
      const brands = await fetchJson(`${API_BASE}/devices/brands?category=${category}`);
      for (const b of brands) {
        const brandSlug = b.brand.toLowerCase();
        routes.push(`${pathPrefix}/${brandSlug}`);
        try {
          const models = await fetchJson(`${API_BASE}/devices/models?brand=${brandSlug}&category=${category}`);
          for (const m of models) {
            routes.push(`${pathPrefix}/${brandSlug}/${m.slug}`);
          }
        } catch {
          // skip models if API unavailable
        }
      }
    } catch {
      console.warn(`Skipping ${category} device routes — API not available at ${API_BASE}`);
    }
  }

  return [...new Set(routes)];
}

function buildSitemap(routes) {
  const today = new Date().toISOString().split('T')[0];
  const urls = routes.map((route) => {
    const priority = route === '/' ? '1.0' : route.includes('/brand') || route.startsWith('/sell-old-') && route.split('/').length <= 3 ? '0.9' : '0.8';
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
  const routes = await collectRoutes();
  const publicDir = path.join(__dirname, '..', 'public');
  const routesFile = path.join(__dirname, '..', 'prerender-routes.json');

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildSitemap(routes));
  fs.writeFileSync(routesFile, JSON.stringify(routes, null, 2));
  console.log(`Generated sitemap.xml and prerender-routes.json with ${routes.length} routes`);
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    // Still write static-only sitemap if API fails
    const routes = [...STATIC_ROUTES, ...CITIES.map((c) => `/sell-old-phone-in/${c}`)];
    const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildSitemap(routes));
    fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'prerender-routes.json'), JSON.stringify(routes, null, 2));
    console.log(`Fallback: generated ${routes.length} static routes only`);
    process.exit(0);
  });
}

export { STATIC_ROUTES, CITIES, buildSitemap };
