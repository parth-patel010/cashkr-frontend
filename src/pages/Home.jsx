import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Tag, Zap, Truck, ArrowRight,
  ChevronDown, Star, Users, Smartphone, Laptop, Tablet,
  ShoppingBag, Tv, Headphones, Watch, Wrench, Refrigerator
} from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import HomeBannerCarousel from "../components/HomeBannerCarousel";
import { ENTITY_SUMMARY } from "../config/seo";
import { HOME_FAQS, HOW_TO_STEPS } from "../data/faqs";
import { CITIES as CITY_DATA } from "../data/cities";
import { buildSchemaGraph, faqPageSchema, howToSchema, organizationSchema, websiteSchema } from "../utils/schema";
import {
  fetchWebsiteCategories,
  sellCategories,
  buyCategories,
  categoryImage,
  FALLBACK_WEBSITE_CATEGORIES,
} from "../utils/websiteCategories";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOW_STEPS = HOW_TO_STEPS.map((step, i) => ({ ...step, num: String(i + 1).padStart(2, '0') }));

const TRUST_FEATURES = [
  { icon: <Shield size={22} strokeWidth={1.8} />, title: "Verified Pickup Professionals", desc: "Every pickup is handled by background-checked, trained professionals you can trust." },
  { icon: <Tag size={22} strokeWidth={1.8} />, title: "Transparent Device Pricing", desc: "Our smart algorithm gives you a fair, data-driven price with no hidden deductions." },
  { icon: <Zap size={22} strokeWidth={1.8} />, title: "Instant Payment After Verification", desc: "Get paid immediately via UPI, bank transfer, or cash right after device inspection." },
  { icon: <Truck size={22} strokeWidth={1.8} />, title: "Free Doorstep Pickup Across Cities", desc: "We come to you — no need to visit a store. Free pickup from 2,000+ cities in India." },
];

const REVIEWS = [
  { name: "Nitin Gowda", text: "Flawless experience. Instant credit. No haggling whatsoever — exactly what I expected.", stars: 5 },
  { name: "Vidyankit Official", text: "Sold my Realme GT Neo 2. Very smooth process, no negotiation unlike other platforms. Highly recommend!", stars: 5 },
  { name: "Jatin Mishra", text: "Sold my phone, nice company, smooth process. Pickup was on time and payment was instant.", stars: 5 },
  { name: "Disha Doshi", text: "Value for money and service is good. Got the exact price that was shown online.", stars: 5 },
  { name: "pawan mishra", text: "Excellent services! The pickup was too good and the security and checking purposes were professional.", stars: 5 },
  { name: "Mayank Doshi", text: "Very prompt service and got a very good price. Absolutely hassle-free. Highly recommended!", stars: 5 },
  { name: "Ritu Sharma", text: "Super easy process. Got a great price for my old Samsung. Will definitely use again!", stars: 5 },
  { name: "Aakash Mehta", text: "Loved the transparent pricing. No last minute deductions. Payment received in under 10 minutes.", stars: 5 },
  { name: "Priya Nair", text: "The pickup agent was very professional and courteous. Got ₹2,000 more than other platforms quoted.", stars: 5 },
];

const FAQS = HOME_FAQS;

const GUARANTEES = [
  "Instant Cash at Free Pickup",
  "Transparent Pricing with No Hidden Cuts",
  "Verified & Professional Pickup Partners",
  "Free Doorstep Pickup Anywhere",
  "Factory-Grade Secure Data Wipe",
  "Genuine Official Invoice Provided",
];

// ─── Hero Stats ───────────────────────────────────────────────────────────────

const HERO_STATS = [
  {
    icon: (
      <Star size={28} strokeWidth={1.8} className="text-[#0565E6]" fill="#0565E6" />
    ),
    value: "4.8",
    label: "Verified Rating",
  },
  {
    icon: (
      // Rupee / coin icon
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0565E6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 9h8M8 12h5a2.5 2.5 0 0 0 0-5H8v10l5-5" />
      </svg>
    ),
    value: "100Cr+",
    label: "Cash Paid",
  },
  {
    icon: (
      <Users size={28} strokeWidth={1.8} className="text-[#0565E6]" />
    ),
    value: "50k+",
    label: "Happy Customers",
  },
];

// ─── Review Column ────────────────────────────────────────────────────────────

function ReviewColumn({ reviews, reverse = false }) {
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const positionRef = useRef(reverse ? -50 : 0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const speed = 0.02;
    let lastTime = null;
    let paused = false;
    const step = (timestamp) => {
      if (paused) { animationRef.current = requestAnimationFrame(step); return; }
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      if (reverse) {
        positionRef.current += speed * delta;
        if (positionRef.current >= 0) positionRef.current = -50;
      } else {
        positionRef.current -= speed * delta;
        if (positionRef.current <= -50) positionRef.current = 0;
      }
      track.style.transform = `translateY(${positionRef.current}%)`;
      animationRef.current = requestAnimationFrame(step);
    };
    animationRef.current = requestAnimationFrame(step);
    const enter = () => { paused = true; };
    const leave = () => { paused = false; lastTime = null; };
    track.addEventListener("mouseenter", enter);
    track.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(animationRef.current);
      track.removeEventListener("mouseenter", enter);
      track.removeEventListener("mouseleave", leave);
    };
  }, [reverse]);

  const doubled = [...reviews, ...reviews];
  return (
    <div className="relative overflow-hidden h-[480px]">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      <div ref={trackRef} className="will-change-transform">
        {doubled.map((r, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 shadow-sm hover:border-[#0565E6]/30 hover:shadow-md transition-all duration-300 cursor-default">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#0565E6] text-white flex items-center justify-center text-sm font-bold shrink-0">
                {r.name[0]}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{r.name}</div>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} fill={s <= r.stars ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth={1.5} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ tag, title, subtitle }) {
  return (
    <div className="text-center mb-12 px-4">
      {tag && (
        <span className="inline-block bg-[#EEF4FF] text-[#0565E6] text-xs font-bold tracking-wider uppercase px-4 py-1.5 rounded-full mb-4 border border-[#0565E6]/20">
          {tag}
        </span>
      )}
      <h2 className="text-2xl sm:text-[2.25rem] font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 bg-gray-50 rounded-2xl mb-3 overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-6 py-5 text-left bg-transparent border-none cursor-pointer gap-4 group"
      >
        <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#0565E6] transition-colors">{q}</span>
        <span className="text-[#0565E6] shrink-0">
          <ChevronDown size={18} strokeWidth={2.5} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [allCategories, setAllCategories] = useState(FALLBACK_WEBSITE_CATEGORIES);
  const [deviceCategories, setDeviceCategories] = useState(
    () => sellCategories(FALLBACK_WEBSITE_CATEGORIES),
  );

  useEffect(() => {
    fetchWebsiteCategories().then((list) => {
      setAllCategories(list);
      setDeviceCategories(sellCategories(list));
    });
  }, []);

  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema(FAQS),
    howToSchema(HOW_TO_STEPS),
  ]);

  const buyCats = buyCategories(allCategories).slice(0, 4);
  const byKey = Object.fromEntries(allCategories.map((c) => [c.key, c]));
  const isSellOn = (key) => byKey[key]?.enabledSell !== false;
  const isBuyOn = (key) => byKey[key]?.enabledBuy !== false;
  const gadgetSellCats = deviceCategories.filter((c) => c.key !== 'mobile');
  const firstGadgetSell = gadgetSellCats[0];
  const firstSellPath = deviceCategories[0]?.sellPath || '/sell-old-mobile-phones/brand';

  const serviceTiles = [
    {
      key: 'sell-phone',
      label: 'Sell Phone',
      to: byKey.mobile?.sellPath || '/sell-old-mobile-phones/brand',
      Icon: Smartphone,
      show: isSellOn('mobile'),
    },
    {
      key: 'sell-gadgets',
      label: 'Sell Gadgets',
      to: firstGadgetSell?.sellPath || '/sell-tablet/brand',
      Icon: Tablet,
      show: gadgetSellCats.length > 0,
    },
    {
      key: 'buy-refurb',
      label: 'Buy Refurbished',
      to: '/buy',
      Icon: ShoppingBag,
      show: buyCats.length > 0,
    },
    {
      key: 'buy-laptop',
      label: 'Buy Laptop',
      to: byKey.laptop?.buyPath || '/buy/laptop/brand',
      Icon: Laptop,
      show: isBuyOn('laptop'),
    },
    {
      key: 'sell-tv',
      label: 'Sell TV',
      to: byKey.tv?.sellPath || '/sell/tv/brand',
      Icon: Tv,
      show: isSellOn('tv'),
    },
    {
      key: 'sell-earbuds',
      label: 'Sell Earbuds',
      to: byKey.earbuds?.sellPath || '/sell/earbuds/brand',
      Icon: Headphones,
      show: isSellOn('earbuds'),
    },
    {
      key: 'sell-fridge',
      label: 'Sell Refrigerator',
      to: byKey.refrigerator?.sellPath || '/sell/refrigerator/brand',
      Icon: Refrigerator,
      show: isSellOn('refrigerator'),
    },
    {
      key: 'sell-watch',
      label: 'Sell Smartwatch',
      to: byKey.smartwatch?.sellPath || '/sell/smartwatch/brand',
      Icon: Watch,
      show: isSellOn('smartwatch'),
    },
    { key: 'repair', label: 'Repair', to: '/repair', Icon: Wrench, show: true },
  ].filter((tile) => tile.show);

  return (
    <div className="w-full bg-[#F7F9FC]">
      <SEOHead
        title="DeviceKart — Sell Old Phones, Laptops & Tablets for Instant Cash in India"
        description="DeviceKart is India's trusted device buyback platform. Sell old mobile phones, tablets, laptops and iMac online with free doorstep pickup and instant payment across 2,000+ cities."
        path="/"
        schema={schema}
      />

      {/* ── Banner carousel (managed in Website Settings) ── */}
      <HomeBannerCarousel />

      {/* ── Our Services ── */}
      <section id="our-services" className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6 scroll-mt-28">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-5">Our Services</h2>
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 no-scrollbar snap-x">
          {serviceTiles.map((tile) => {
            const Icon = tile.Icon;
            return (
              <Link
                key={tile.key}
                to={tile.to}
                className="snap-start shrink-0 w-[100px] sm:w-[112px] flex flex-col items-center gap-2.5 no-underline group"
              >
                <div className="w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-2xl bg-[#E8F4F3] flex items-center justify-center text-[#0565E6] group-hover:bg-[#D7EEEC] transition-colors">
                  <Icon size={36} strokeWidth={1.75} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-gray-800 text-center leading-snug group-hover:text-[#0565E6] transition-colors">
                  {tile.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Sell categories strip ── */}
      {deviceCategories.length > 0 ? (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Sell for Instant Cash</h2>
              <p className="text-sm text-gray-500 mt-1">Pick a category and get a fair buyback quote in minutes.</p>
            </div>
            {isSellOn('mobile') ? (
              <Link to={byKey.mobile?.sellPath || '/sell-old-mobile-phones/brand'} className="hidden sm:inline text-sm font-bold text-[#0565E6] no-underline hover:underline">
                Sell phone →
              </Link>
            ) : (
              <Link to={firstSellPath} className="hidden sm:inline text-sm font-bold text-[#0565E6] no-underline hover:underline">
                Sell now →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {deviceCategories.map((cat) => (
              <Link
                to={cat.sellPath || '/'}
                key={cat.key}
                className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#0565E6]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
              >
                <div className="flex items-center justify-center bg-[#F8FAFF] h-[110px] sm:h-[130px] px-4 pt-4 pb-2">
                  <img
                    src={categoryImage(cat)}
                    alt={cat.label}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="px-3 py-3 text-center">
                  <span className="text-sm sm:text-base font-bold text-gray-700 group-hover:text-[#0565E6] transition-colors">
                    Sell {cat.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Buy refurbished ── */}
      {buyCats.length > 0 ? (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Buy Refurbished Devices</h2>
              <p className="text-sm text-gray-500 mt-1">Quality-checked devices with warranty at great prices.</p>
            </div>
            <Link to="/buy" className="hidden sm:inline text-sm font-bold text-[#0565E6] no-underline hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {buyCats.map((cat) => (
              <Link
                key={cat.key}
                to={cat.buyPath || `/buy/${cat.key}/brand`}
                className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 no-underline hover:border-[#0565E6]/40 hover:shadow-md transition-all"
              >
                <div className="h-20 flex items-center justify-center mb-3">
                  <img src={categoryImage(cat)} alt={cat.label} className="max-h-full object-contain" />
                </div>
                <p className="text-sm font-bold text-gray-800 text-center group-hover:text-[#0565E6]">{cat.label}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Trust strip ── */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 px-4 py-5 flex items-center gap-3">
              <div className="shrink-0">{stat.icon}</div>
              <div>
                <div className="text-xl font-black text-gray-900 leading-none">{stat.value}</div>
                <div className="text-xs font-semibold text-gray-400 mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-5 flex items-center gap-3">
            <Truck size={28} strokeWidth={1.8} className="text-[#0565E6]" />
            <div>
              <div className="text-xl font-black text-gray-900 leading-none">Free</div>
              <div className="text-xs font-semibold text-gray-400 mt-1">Doorstep Pickup</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 sm:py-20 bg-white mt-4">
        <div className="max-w-[1200px] mx-auto px-4">
          <SectionTitle
            tag="Simple Process"
            title="How DeviceKart Buyback Process Works"
            subtitle="No hassle, no bargaining — selling your old device online is simple. Instant pricing, secure pickups, and fast payments."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {HOW_STEPS.map((step, i) => (
              <div
                key={step.num}
                className="bg-white rounded-[28px] p-8 text-center border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
              >
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-3 z-10">
                    <ArrowRight size={20} strokeWidth={2} className="text-[#0565E6]/30" />
                  </div>
                )}
                <div className="w-14 h-14 bg-[#0565E6] text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-lg shadow-[#0565E6]/30">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Trust Us ── */}
      <section className="py-16 sm:py-24 bg-[#F8FAFF]">
        <div className="max-w-[1200px] mx-auto px-4">
          <SectionTitle
            tag="Why Choose Us"
            title="Why People Trust DeviceKart"
            subtitle="Built to make selling electronics simple, transparent, and secure — every single time."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TRUST_FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-5 bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0565E6]/20 transition-all duration-200"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#EEF4FF] rounded-xl flex items-center justify-center text-[#0565E6] shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{f.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <section className="py-16 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4">
          <SectionTitle
            tag="Customer Reviews"
            title="Real Feedback From Our Customers"
            subtitle="Thousands of users across India trust DeviceKart to convert their old phones into instant cash with free pickup."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ReviewColumn reviews={REVIEWS.slice(0, 3)} />
            <div className="hidden md:block">
              <ReviewColumn reviews={REVIEWS.slice(3, 6)} reverse />
            </div>
            <div className="hidden md:block">
              <ReviewColumn reviews={REVIEWS.slice(6, 9)} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Cities & Guarantees ── */}
      <section className="py-16 sm:py-24 bg-[#F8FAFF]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                Serving 2,000+ Cities Across India 🇮🇳
              </h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">Free doorstep pickup services across major cities in India. We're growing fast!</p>
              <div className="flex flex-wrap gap-2">
                {CITY_DATA.slice(0, 15).map((city) => (
                  <Link
                    key={city.slug}
                    to={`/sell-old-phone-in/${city.slug}`}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-xs font-bold text-gray-600 hover:border-[#0565E6] hover:text-[#0565E6] hover:shadow-sm transition-all no-underline"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[28px] p-8 sm:p-10 border border-gray-100 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-7">DeviceKart Guarantees</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GUARANTEES.map((g) => (
                  <div key={g} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-700 bg-[#F8FAFF] rounded-xl p-4 border border-[#0565E6]/10">
                    <div className="w-5 h-5 bg-[#0565E6] text-white rounded-full flex items-center justify-center text-[10px] shrink-0 font-black">✓</div>
                    {g}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-[760px] mx-auto px-4">
          <SectionTitle
            tag="FAQs"
            title="Frequently Asked Questions"
            subtitle="Find clear answers to all your questions about device pricing, pickups, and secure payments."
          />
          <div>
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <p className="text-center mt-6">
            <Link to="/faq" className="text-[#0565E6] font-bold text-sm hover:underline">
              View all FAQs →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Entity summary (AEO) ── */}
      <section className="py-12 bg-[#F8FAFF] border-t border-gray-100">
        <div className="max-w-[760px] mx-auto px-4">
          <h2 className="text-lg font-black text-gray-900 mb-3">About DeviceKart in 30 seconds</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{ENTITY_SUMMARY}</p>
        </div>
      </section>

    </div>
  );
}