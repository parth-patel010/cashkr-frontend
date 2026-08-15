/**
 * Post-build: write route HTML files with city/money SEO meta already in <head>
 * so View Source / crawlers see title, description, and keywords like Cashify
 * (no Puppeteer / Chrome required — works on Vercel).
 *
 * Run after vite build: node scripts/inject-seo-html.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CITIES } from '../src/data/cities.js';
import {
  cityKeywords,
  homeKeywords,
  moneyPageKeywords,
} from '../src/data/seoKeywords.js';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  formatSeoTitle,
} from '../src/config/seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function outputPathForRoute(route) {
  if (route === '/') return path.join(distDir, 'index.html');
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  return path.join(distDir, clean, 'index.html');
}

function applySeo(html, { title, description, path: routePath, keywords, imageAlt }) {
  const fullTitle = formatSeoTitle(title);
  const canonical = absoluteUrl(routePath);
  const ogImage = DEFAULT_OG_IMAGE.startsWith('http')
    ? DEFAULT_OG_IMAGE
    : absoluteUrl(DEFAULT_OG_IMAGE);
  const alt = imageAlt || fullTitle;

  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(fullTitle)}</title>`);

  if (/<meta\s+name=["']description["']/i.test(out)) {
    out = out.replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
      `<meta name="description" content="${escapeAttr(description)}" />`,
    );
  } else {
    out = out.replace(
      /<\/title>/i,
      `</title>\n    <meta name="description" content="${escapeAttr(description)}" />`,
    );
  }

  const keywordsTag = keywords
    ? `<meta name="keywords" content="${escapeAttr(keywords)}" />`
    : '';

  if (/<meta\s+name=["']keywords["']/i.test(out)) {
    out = out.replace(
      /<meta\s+name=["']keywords["']\s+content=["'][^"']*["']\s*\/?>/i,
      keywordsTag || '',
    );
  } else if (keywordsTag) {
    out = out.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      (m) => `${m}\n    ${keywordsTag}`,
    );
  }

  const headExtras = [
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`,
    `<meta property="og:image" content="${escapeAttr(ogImage)}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(alt)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`,
  ].join('\n    ');

  // Remove prior injected SEO block if re-running
  out = out.replace(/\n?\s*<!-- dk-seo-inject -->[\s\S]*?<!-- \/dk-seo-inject -->\n?/g, '\n');

  out = out.replace(
    /<\/head>/i,
    `    <!-- dk-seo-inject -->\n    ${headExtras}\n    <!-- /dk-seo-inject -->\n  </head>`,
  );

  return out;
}

function cityPages() {
  return CITIES.map((city) => {
    const routePath = `/sell-old-phone-in/${city.slug}`;
    return {
      route: routePath,
      seo: {
        title: `Sell Your Old Mobile Phone in ${city.name} | DeviceKart`,
        description: `Sell your old Mobile Phone in ${city.name} via DeviceKart. It is the best place to quickly sell your old Mobile Phone in ${city.name} and get instant cash online while staying at home.`,
        path: routePath,
        keywords: cityKeywords(city.name),
        imageAlt: `Sell your Mobile Phone in ${city.name} with DeviceKart`,
      },
    };
  });
}

function staticMoneyPages() {
  return [
    {
      route: '/',
      seo: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        path: '/',
        keywords: homeKeywords(),
        imageAlt: DEFAULT_TITLE,
      },
    },
    {
      route: '/best-old-phone-selling-website',
      seo: {
        title: 'Best Old Phone Selling Website in India | DeviceKart',
        description:
          'Looking for the best old phone selling website in India? DeviceKart offers instant quotes, free doorstep pickup, and secure UPI/bank payment across 2,000+ cities.',
        path: '/best-old-phone-selling-website',
        keywords: moneyPageKeywords('best-website'),
      },
    },
    {
      route: '/sell-old-phone-online-india',
      seo: {
        title: 'Sell Old Phone Online in India — Instant Cash | DeviceKart',
        description:
          'Sell your old phone online in India with DeviceKart. Instant valuation, free doorstep pickup, and fast UPI or bank payment — no shop visit needed.',
        path: '/sell-old-phone-online-india',
        keywords: moneyPageKeywords('online-india'),
      },
    },
    {
      route: '/best-place-to-sell-old-phone-india',
      seo: {
        title: 'Best Place to Sell Old Phone in India | DeviceKart',
        description:
          'Best place to sell your old phone in India online. Get a fair instant quote, free pickup, and secure payment with DeviceKart.',
        path: '/best-place-to-sell-old-phone-india',
        keywords: moneyPageKeywords('best-website'),
      },
    },
  ];
}

function main() {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('dist/index.html not found — run vite build first');
    process.exit(1);
  }

  // Snapshot shell once before overwriting home
  const shell = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const shellPath = path.join(distDir, '_spa-shell.html');
  fs.writeFileSync(shellPath, shell);

  const pages = [...staticMoneyPages(), ...cityPages()];
  let count = 0;

  for (const { route, seo } of pages) {
    const template = route === '/' ? shell : shell;
    const html = applySeo(template, seo);
    const outPath = outputPathForRoute(route);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    count += 1;
  }

  // Keep shell for SPA fallback copies if needed
  fs.writeFileSync(path.join(distDir, 'index.html'), applySeo(shell, staticMoneyPages()[0].seo));

  const mumbai = path.join(distDir, 'sell-old-phone-in', 'mumbai', 'index.html');
  if (fs.existsSync(mumbai)) {
    const sample = fs.readFileSync(mumbai, 'utf8');
    const kw = sample.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i);
    const kwCount = kw ? kw[1].split(',').map((s) => s.trim()).filter(Boolean).length : 0;
    console.log(`SEO HTML inject: ${count} routes`);
    console.log(`  sample /sell-old-phone-in/mumbai → keywords meta count: ${kwCount}`);
  } else {
    console.log(`SEO HTML inject: ${count} routes`);
  }
}

main();
