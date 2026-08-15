# DeviceKart SEO Off-Site Checklist (action plan)

On-site SEO (city pages, money pages, schema, sitemap) is shipped in the frontend.
**Backlinks and citations cannot be coded** — execute this week-by-week plan yourself.
No paid link schemes; prefer editorial and directory citations.

Target queries: *best old phone selling website*, *sell old phone in [city]*, *Cashify alternative*, *sell old phone online India*.

---

## Week 1 — Foundations (Search Console + entity)

### Google Search Console
- [ ] Verify property `https://www.devicekart.in` (DNS or HTML tag)
- [ ] Submit sitemap: `https://www.devicekart.in/sitemap.xml`
- [ ] Request indexing for priority URLs:
  - `/`
  - `/best-old-phone-selling-website`
  - `/sell-old-phone-online-india`
  - `/best-place-to-sell-old-phone-india`
  - `/compare/devicekart-vs-cashify`
  - `/alternatives/cashify-alternatives`
  - `/sell-old-phone-in/mumbai` (and Delhi, Bangalore, Hyderabad, Chennai, Pune)
- [ ] Check Coverage / Pages for soft-404s and redirect chains after deploy

### Bing Webmaster
- [ ] Import GSC or verify `www.devicekart.in`
- [ ] Submit the same sitemap

### Google Business Profile
- [ ] Create/claim GBP for **DeviceKart** (Mumbai HQ / registered address)
- [ ] Categories: Electronics recycler / Mobile phone shop (secondary) / Online marketplace as fits
- [ ] Website: homepage + city page for primary service area
- [ ] Services: Sell old phone, doorstep pickup, laptop buyback
- [ ] Upload storefront / process photos (not stock spam)
- [ ] Enable messaging; post once weekly with link to money or city page

### NAP consistency
- [ ] Same legal name, phone (`+91-9930224433`), email (`support@devicekart.in`) on site footer, GBP, directories
- [ ] Confirm social URLs in `src/config/seo.js` match live profiles

---

## Week 2 — Directories & citations (India)

Create profiles with website link to homepage; where “services” allowed, add city or money page deep links.

- [ ] Justdial — DeviceKart / Swastika Innovation
- [ ] Sulekha
- [ ] IndiaMART (company listing)
- [ ] TradeIndia (optional B2B)
- [ ] Crunchbase / Tracxn (startup entity)
- [ ] Clutch / GoodFirms only if accurate services
- [ ] Local chamber / MSME directories if eligible
- [ ] App store / Play Store listing description → website (if apps live)

Track each URL in a sheet: Directory | Profile URL | Live link | Date.

---

## Week 3 — Content & guest posts

### Owned content
- [ ] YouTube: “How to sell old phone on DeviceKart” → description link to `/sell-old-phone-online-india`
- [ ] Short Reel/Short pointing to `/best-old-phone-selling-website`
- [ ] LinkedIn company post comparing buyback vs OLX (link to compare page)

### Guest / PR (1–2 quality posts > 20 spam)
Pitch Indian gadget/tech blogs with a unique angle (e.g. “how to pick a phone buyback site in 2026”):
- [ ] Pitch list: 10 blogs (91mobiles-style, MySmartPrice community, regional tech, startup media)
- [ ] Each article includes 1–2 dofollow links max: money page + one city page
- [ ] Press note for local Mumbai/Delhi startup roundups if new funding/expansion

Avoid: PBN networks, paid “guest post packages”, exact-match anchor spam.

---

## Week 4 — Community answers (branded, non-spam)

### Quora
- [ ] Answer: “What is the best website to sell old phone in India?”
- [ ] Answer: “Cashify alternatives?”
- [ ] Answer: “How to sell old phone in Mumbai online?”
Disclose affiliation; link DeviceKart naturally once per answer.

### Reddit
- [ ] r/india / r/indianapps / city subs: helpful process answers only; no multi-post spam
- [ ] Prefer commenting on existing threads vs self-promo

### Reviews
- [ ] Ask happy customers for GBP reviews (no fake reviews)
- [ ] MouthShut / Trustpilot only with real volume — enable AggregateRating schema only after third-party proof exists

---

## Monthly ops (ongoing)

| Task | Cadence |
|------|---------|
| GSC: impressions for money + city queries | Weekly |
| Fix crawl errors / soft 404 after deploys | After each release |
| 2 GBP posts | Monthly |
| 1 guest or PR outreach | Monthly |
| AI visibility spot-check | Monthly |

### AI visibility spot-check
- [ ] ChatGPT: “best old phone selling website India”
- [ ] Perplexity: “Cashify alternatives India”
- [ ] Gemini: “DeviceKart review”
- [ ] Note whether DeviceKart appears; improve entity pages + citations if missing

### Deploy reminder (live site)
Nginx serves built assets from `/var/www/html/devicekart`, not the git folder alone:

```bash
cd /var/www/devicekart/cashkr-frontend && git pull && npm run build
sudo cp -a dist/. /var/www/html/devicekart/
```

After deploy, re-submit sitemap / request indexing for new money + city URLs.

---

## Anchor text mix (for when you earn links)

| Mix | Examples |
|-----|----------|
| Branded | DeviceKart, DeviceKart sell phone |
| Naked URL | https://www.devicekart.in |
| Partial | sell old phone online, doorstep phone pickup |
| Exact (rare) | best old phone selling website |

Keep exact-match anchors under ~10% of new links.

---

## Done definition (off-site)

- [ ] GSC + Bing verified, sitemap submitted
- [ ] GBP live with website + photos
- [ ] ≥5 directory citations live
- [ ] ≥1 editorial/guest link to a money page
- [ ] Quora/Reddit answers published without spam flags
- [ ] Monthly monitoring calendar set
