import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Smartphone, Tablet, Laptop, Monitor,
  Shield, Tag, Zap, Truck, ArrowRight,
  ChevronDown, Star, BadgeCheck, Users
} from "lucide-react";
// Note: Smartphone, Tablet, Laptop, Monitor still used in mini pills & trust features
import phoneMockupImage from "../assets/image.png";
import mobileDeviceImg from "../assets/devices/mobile.png";
import tabletDeviceImg from "../assets/devices/tablet.png";
import laptopDeviceImg from "../assets/devices/laptop.png";
import macDeviceImg from "../assets/devices/mac.png";
import SEOHead from "../components/seo/SEOHead";
import { ENTITY_SUMMARY } from "../config/seo";
import { HOME_FAQS, HOW_TO_STEPS } from "../data/faqs";
import { CITIES as CITY_DATA } from "../data/cities";
import { buildSchemaGraph, faqPageSchema, howToSchema, organizationSchema, websiteSchema } from "../utils/schema";

// ─── Icons (Play/App Store) ───────────────────────────────────────────────────

const PlayStoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L13.98,13.41L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L14.89,11.5L17.89,8.5L20.16,10.81M6.05,2.66L16.81,8.88L13.98,11.59L6.05,2.66Z" />
  </svg>
);

const AppStoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEVICE_CATEGORIES = [
  {
    label: "Mobile",
    to: "/sell-old-mobile-phones/brand",
    img: mobileDeviceImg,
  },
  {
    label: "Tablet",
    to: "/sell-tablet/brand",
    img: tabletDeviceImg,
  },
  {
    label: "Laptop",
    to: "/sell-old-laptops/brand",
    img: laptopDeviceImg,
  },
  {
    label: "Mac",
    to: "/sell-imac/brand",
    img: macDeviceImg,
  },
];

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
  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema(FAQS),
    howToSchema(HOW_TO_STEPS),
  ]);

  return (
    <div className="w-full">
      <SEOHead
        title="DeviceKart — Sell Old Phones, Laptops & Tablets for Instant Cash in India"
        description="DeviceKart is India's trusted device buyback platform. Sell old mobile phones, tablets, laptops and iMac online with free doorstep pickup and instant payment across 2,000+ cities."
        path="/"
        schema={schema}
      />
      {/* ══════════════════════════════════════════════════════
          ── HERO SECTION ──
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#EEF4FF] via-white to-white pt-0 pb-12 sm:pb-16 px-4">

        {/* Background decoration blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#0565E6]/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#0565E6]/5 blur-3xl" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">

          {/* ── Left Column ── */}
          <div className="relative z-10 pt-8 sm:pt-10">

            {/* Top badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-[#0565E6]/20 rounded-full pl-2 pr-4 py-1.5 text-[11px] sm:text-xs font-bold text-[#0565E6] mb-5 shadow-sm shadow-[#0565E6]/10">
              <div className="w-5 h-5 rounded-full bg-[#0565E6] flex items-center justify-center">
                <BadgeCheck size={11} className="text-white" />
              </div>
              India's #1 Device Buyback Platform
            </div>

            {/* Main heading */}
            <h1 className="text-[1.75rem] sm:text-[2.4rem] lg:text-[2.85rem] font-black text-gray-900 leading-[1.08] tracking-tight mb-4">
              India's Trusted Buyback<br />
              Platform to{" "}
              <span className="text-[#0565E6]">Sell Old Devices</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base lg:text-[1rem] text-gray-500 leading-relaxed mb-7 max-w-[500px]">
              DeviceKart is India's premier online device buyback platform helping you sell old electronics with fair pricing, free doorstep pickup and instant payment.
            </p>

            {/* ── Category Cards Grid ── */}
            <div className="border border-gray-200 rounded-3xl p-3 mb-8 bg-white/60">
              <div className="grid grid-cols-2 gap-3">
                {DEVICE_CATEGORIES.map((cat) => (
                  <Link
                    to={cat.to}
                    key={cat.label}
                    className="group flex flex-col bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden hover:border-[#0565E6]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
                  >
                    {/* Image area */}
                    <div className="flex items-center justify-center bg-gray-50 h-[130px] px-5 pt-5 pb-2">
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Label */}
                    <div className="px-4 py-3 text-center">
                      <span className="text-base font-bold text-gray-700 group-hover:text-[#0565E6] transition-colors duration-200">
                        {cat.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Icon Stats Row ── */}
            <div className="flex items-center gap-8 sm:gap-10 flex-wrap">
              {HERO_STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-3">
                  {/* Divider */}
                  {i > 0 && (
                    <div className="w-px h-10 bg-gray-200 mr-2 hidden sm:block" />
                  )}
                  <div className="shrink-0">{stat.icon}</div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{stat.value}</div>
                    <div className="text-xs sm:text-sm font-semibold text-gray-400 mt-0.5">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Mini stat pills row ── */}
            <div className="flex flex-wrap gap-2 mt-6">
              {[
                { icon: <Smartphone size={12} />, label: "50,000+ Devices Sold" },
                { icon: <Zap size={12} />, label: "Instant UPI Payment" },
                { icon: <Truck size={12} />, label: "Free Doorstep Pickup" },
                { icon: <Shield size={12} />, label: "100% Safe Data Wipe" },
              ].map((p) => (
                <div
                  key={p.label}
                  className="inline-flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 text-[11px] font-semibold text-gray-600 shadow-sm"
                >
                  <span className="text-[#0565E6]">{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>

          </div>

          {/* ── Right Column: Phone Image (Desktop Only) ── */}
          <img
            src={phoneMockupImage}
            alt="DeviceKart App"
            fetchPriority="high"
            width={600}
            height={600}
            className="hidden lg:block w-full h-auto max-w-none scale-110"
          />

        </div>
      </section>
      {/* ══════════════════════════════ END HERO ══════════════════════════════ */}

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-24 bg-white">
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