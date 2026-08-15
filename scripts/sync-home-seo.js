/**
 * Sync homepage SEO meta into source index.html (View Source parity with Cashify).
 * Run: node scripts/sync-home-seo.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { homeKeywords } from '../src/data/seoKeywords.js';
import {
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
} from '../src/config/seo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, '..', 'index.html');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

const kw = homeKeywords();
let html = fs.readFileSync(htmlPath, 'utf8');

html = html.replace(/\n?\s*<!-- dk-seo-home -->[\s\S]*?<!-- \/dk-seo-home -->\n?/g, '\n');
html = html.replace(/<meta\s+name=["']keywords["'][^>]*>\s*/gi, '');

const block = `    <!-- dk-seo-home -->
    <meta name="keywords" content="${esc(kw)}" />
    <link rel="canonical" href="${SITE_URL}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(SITE_NAME)}" />
    <meta property="og:title" content="${esc(DEFAULT_TITLE)}" />
    <meta property="og:description" content="${esc(DEFAULT_DESCRIPTION)}" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
    <meta property="og:locale" content="en_IN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(DEFAULT_TITLE)}" />
    <meta name="twitter:description" content="${esc(DEFAULT_DESCRIPTION)}" />
    <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />
    <!-- /dk-seo-home -->
`;

if (!/<meta\s+name=["']description["']/i.test(html)) {
  throw new Error('description meta missing in index.html');
}

html = html.replace(/(<meta\s+name=["']description["'][^>]*>)/i, `$1\n${block}`);
fs.writeFileSync(htmlPath, html);
console.log(`Synced homepage SEO into index.html (${kw.split(', ').length} keywords)`);
