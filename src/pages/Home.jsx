import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Star,
  MessageSquareQuote,
  MapPin,
  ShieldCheck,
  Truck,
  Zap,
  BadgeCheck,
  CircleHelp,
  ArrowRight,
  Building2,
  IndianRupee,
  Clock3,
} from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import LandingHero from "../components/LandingHero";
import ServicesBenefits from "../components/ServicesBenefits";
import MostQuotedDevices from "../components/MostQuotedDevices";
import RecentlyAddedDevices from "../components/RecentlyAddedDevices";
import WhySellDeviceKart from "../components/WhySellDeviceKart";
import HowBuybackWorks from "../components/HowBuybackWorks";
import { ENTITY_SUMMARY } from "../config/seo";
import { HOME_FAQS, HOW_TO_STEPS } from "../data/faqs";
import { CITIES as CITY_DATA } from "../data/cities";
import { buildSchemaGraph, faqPageSchema, howToSchema, organizationSchema, websiteSchema } from "../utils/schema";
import {
  fetchWebsiteCategories,
  sellCategories,
  FALLBACK_WEBSITE_CATEGORIES,
} from "../utils/websiteCategories";

const REVIEWS = [
  { name: "Nitin Gowda", text: "Flawless experience. Instant credit. No haggling whatsoever — exactly what I expected.", stars: 5, city: "Bangalore" },
  { name: "Vidyankit Official", text: "Sold my Realme GT Neo 2. Very smooth process, no negotiation unlike other platforms. Highly recommend!", stars: 5, city: "Hyderabad" },
  { name: "Jatin Mishra", text: "Sold my phone, nice company, smooth process. Pickup was on time and payment was instant.", stars: 5, city: "Delhi" },
  { name: "Disha Doshi", text: "Value for money and service is good. Got the exact price that was shown online.", stars: 5, city: "Mumbai" },
  { name: "Pawan Mishra", text: "Excellent services! The pickup was too good and the security and checking purposes were professional.", stars: 5, city: "Pune" },
  { name: "Mayank Doshi", text: "Very prompt service and got a very good price. Absolutely hassle-free. Highly recommended!", stars: 5, city: "Ahmedabad" },
  { name: "Ritu Sharma", text: "Super easy process. Got a great price for my old Samsung. Will definitely use again!", stars: 5, city: "Jaipur" },
  { name: "Aakash Mehta", text: "Loved the transparent pricing. No last minute deductions. Payment received in under 10 minutes.", stars: 5, city: "Chennai" },
  { name: "Priya Nair", text: "The pickup agent was very professional and courteous. Got ₹2,000 more than other platforms quoted.", stars: 5, city: "Kochi" },
];

const FAQS = HOME_FAQS;

const GUARANTEES = [
  { title: "Instant Cash at Free Pickup", Icon: Zap, color: "bg-[#EDE9FE] text-[#7C3AED]" },
  { title: "Transparent Pricing — No Hidden Cuts", Icon: BadgeCheck, color: "bg-[#DBE8FF] text-[#0565E6]" },
  { title: "Verified Pickup Partners", Icon: ShieldCheck, color: "bg-[#DCFCE7] text-[#16A34A]" },
  { title: "Free Doorstep Pickup Anywhere", Icon: Truck, color: "bg-[#FFEDD5] text-[#EA580C]" },
  { title: "Factory-Grade Secure Data Wipe", Icon: ShieldCheck, color: "bg-[#FCE7F3] text-[#DB2777]" },
  { title: "Genuine Official Invoice", Icon: BadgeCheck, color: "bg-[#EEF4FF] text-[#0565E6]" },
];

const AVATAR_COLORS = ["bg-[#0565E6]", "bg-[#16A34A]", "bg-[#7C3AED]", "bg-[#EA580C]", "bg-[#DB2777]"];

function ReviewColumn({ reviews, reverse = false, fadeFrom = "from-white" }) {
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
      if (paused) {
        animationRef.current = requestAnimationFrame(step);
        return;
      }
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
    const enter = () => {
      paused = true;
    };
    const leave = () => {
      paused = false;
      lastTime = null;
    };
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
    <div className="relative overflow-hidden h-[380px] sm:h-[480px]">
      <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${fadeFrom} to-transparent z-10 pointer-events-none`} />
      <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${fadeFrom} to-transparent z-10 pointer-events-none`} />
      <div ref={trackRef} className="will-change-transform">
        {doubled.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:border-[#0565E6]/30 hover:shadow-[0_8px_24px_rgba(5,101,230,0.08)] transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-white flex items-center justify-center text-sm font-bold shrink-0`}
              >
                {r.name[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{r.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        fill={s <= r.stars ? "#F59E0B" : "none"}
                        stroke="#F59E0B"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  {r.city && (
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {r.city}
                    </span>
                  )}
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

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border mb-3 overflow-hidden transition-all duration-200 ${
        open
          ? "bg-white border-[#0565E6]/30 shadow-[0_8px_24px_rgba(5,101,230,0.08)]"
          : "bg-white border-gray-100 shadow-sm hover:border-[#0565E6]/20"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-5 sm:px-6 py-4 sm:py-5 text-left bg-transparent border-none cursor-pointer gap-4 group"
      >
        <span className="flex items-start gap-3 min-w-0">
          <span
            className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              open ? "bg-[#0565E6] text-white" : "bg-[#EEF4FF] text-[#0565E6]"
            }`}
          >
            <CircleHelp size={15} strokeWidth={2.3} />
          </span>
          <span
            className={`text-[15px] sm:text-base font-bold leading-snug transition-colors ${
              open ? "text-[#0565E6]" : "text-gray-900 group-hover:text-[#0565E6]"
            }`}
          >
            {q}
          </span>
        </span>
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
            open ? "bg-[#EEF4FF] text-[#0565E6] rotate-180" : "bg-[#F4F7FB] text-gray-400"
          }`}
        >
          <ChevronDown size={16} strokeWidth={2.5} />
        </span>
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-5 sm:pl-[4.25rem]">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [deviceCategories, setDeviceCategories] = useState(() =>
    sellCategories(FALLBACK_WEBSITE_CATEGORIES),
  );

  useEffect(() => {
    fetchWebsiteCategories().then((list) => {
      setDeviceCategories(sellCategories(list));
    });
  }, []);

  const schema = buildSchemaGraph([
    organizationSchema(),
    websiteSchema(),
    faqPageSchema(FAQS),
    howToSchema(HOW_TO_STEPS),
  ]);

  const firstSellPath = deviceCategories[0]?.sellPath || "/sell-old-mobile-phones/brand";

  return (
    <div className="w-full bg-[#F7F9FC]">
      <SEOHead
        title="DeviceKart — Sell Old Phones, Laptops & Tablets for Instant Cash in India"
        description="DeviceKart is India's trusted device buyback platform. Sell old mobile phones, tablets, laptops and iMac online with free doorstep pickup and instant payment across 2,000+ cities."
        path="/"
        schema={schema}
      />

      <LandingHero sellPath="/sell" />
      <ServicesBenefits sellPath="/sell" />
      <MostQuotedDevices viewAllPath={firstSellPath} />
      <RecentlyAddedDevices viewAllPath="/buy" />
      <WhySellDeviceKart />
      <HowBuybackWorks />

      {/* ── Customer Reviews ── */}
      <section className="py-12 sm:py-16 bg-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 sm:mb-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#EEF4FF] border border-[#0565E6]/15 px-3 py-1.5 rounded-full mb-3">
                <MessageSquareQuote size={12} strokeWidth={2.4} />
                Customer Reviews
              </span>
              <h2 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
                Real Feedback From Our{" "}
                <span className="text-[#0565E6]">Customers</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mt-2.5 leading-relaxed">
                Thousands of users across India trust DeviceKart to convert their old devices into instant cash with free pickup.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-2xl bg-[#F4F7FB] border border-[#E8EEF5] px-4 py-3 self-start lg:self-auto">
              <div className="flex items-center gap-1.5">
                <Star size={18} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
                <span className="text-xl font-black text-gray-900">4.9/5</span>
              </div>
              <span className="w-px h-8 bg-gray-200" aria-hidden />
              <p className="text-xs text-gray-500 leading-snug">
                Based on <span className="font-bold text-gray-700">25,000+</span>
                <br />
                verified reviews
              </p>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-[28px] bg-[#F4F7FB] border border-[#E8EEF5] p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReviewColumn reviews={REVIEWS.slice(0, 3)} fadeFrom="from-[#F4F7FB]" />
              <div className="hidden md:block">
                <ReviewColumn reviews={REVIEWS.slice(3, 6)} reverse fadeFrom="from-[#F4F7FB]" />
              </div>
              <div className="hidden md:block">
                <ReviewColumn reviews={REVIEWS.slice(6, 9)} fadeFrom="from-[#F4F7FB]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cities & Guarantees ── */}
      <section className="py-12 sm:py-16 bg-[#F7F9FC]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Cities */}
              <div className="p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#EEF4FF] border border-[#0565E6]/15 px-3 py-1.5 rounded-full mb-3">
                  <MapPin size={12} strokeWidth={2.5} />
                  Pan India Coverage
                </span>
                <h2 className="text-2xl sm:text-[1.85rem] font-extrabold text-gray-900 tracking-tight leading-tight">
                  Serving{" "}
                  <span className="text-[#0565E6]">2,000+ Cities</span>{" "}
                  Across India
                </h2>
                <p className="text-sm text-gray-500 mt-2.5 mb-6 leading-relaxed max-w-md">
                  Free doorstep pickup across major cities. We&apos;re expanding every month so more customers can sell with ease.
                </p>

                <div className="flex flex-wrap gap-2">
                  {CITY_DATA.slice(0, 18).map((city) => (
                    <Link
                      key={city.slug}
                      to={`/sell-old-phone-in/${city.slug}`}
                      className="inline-flex items-center gap-1.5 bg-[#F4F7FB] border border-[#E8EEF5] rounded-full px-3.5 py-2.5 min-h-10 text-xs font-bold text-gray-700 hover:border-[#0565E6] hover:text-[#0565E6] hover:bg-[#EEF4FF] transition-all no-underline"
                    >
                      <MapPin size={11} strokeWidth={2.4} className="text-[#0565E6] shrink-0" />
                      {city.name}
                    </Link>
                  ))}
                </div>

                <p className="mt-5 text-xs font-semibold text-gray-400">
                  + many more cities with free doorstep pickup
                </p>
              </div>

              {/* Guarantees */}
              <div className="p-6 sm:p-8 lg:p-10 bg-[#F4F7FB]">
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-5">
                  DeviceKart <span className="text-[#0565E6]">Guarantees</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GUARANTEES.map(({ title, Icon, color }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm"
                    >
                      <span
                        className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}
                      >
                        <Icon size={16} strokeWidth={2.2} />
                      </span>
                      <p className="text-xs sm:text-[13px] font-bold text-gray-800 leading-snug pt-1.5">
                        {title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 sm:py-16 bg-[#F7F9FC]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.2fr]">
              {/* Left intro */}
              <div className="p-6 sm:p-8 lg:p-10 bg-[#F4F7FB] border-b lg:border-b-0 lg:border-r border-[#E8EEF5]">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#EEF4FF] border border-[#0565E6]/15 px-3 py-1.5 rounded-full mb-3">
                  <CircleHelp size={12} strokeWidth={2.5} />
                  FAQs
                </span>
                <h2 className="text-2xl sm:text-[1.85rem] font-extrabold text-gray-900 tracking-tight leading-tight">
                  Frequently Asked{" "}
                  <span className="text-[#0565E6]">Questions</span>
                </h2>
                <p className="text-sm text-gray-500 mt-2.5 leading-relaxed">
                  Clear answers about device pricing, free pickup, and secure payments.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    { Icon: Zap, label: "Instant online quotes", color: "bg-[#EDE9FE] text-[#7C3AED]" },
                    { Icon: Truck, label: "Free doorstep pickup", color: "bg-[#DCFCE7] text-[#16A34A]" },
                    { Icon: ShieldCheck, label: "Safe & secure process", color: "bg-[#DBE8FF] text-[#0565E6]" },
                  ].map(({ Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3.5 py-3">
                      <span className={`w-9 h-9 rounded-full ${color} flex items-center justify-center shrink-0`}>
                        <Icon size={16} strokeWidth={2.2} />
                      </span>
                      <span className="text-sm font-bold text-gray-800">{label}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/faq"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#0565E6] no-underline hover:underline"
                >
                  View all FAQs
                  <ArrowRight size={14} strokeWidth={2.5} />
                </Link>
              </div>

              {/* Accordion */}
              <div className="p-5 sm:p-7 lg:p-8">
                {FAQS.map((faq) => (
                  <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About DeviceKart in 30 seconds ── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="rounded-2xl sm:rounded-[28px] bg-[#F4F7FB] border border-[#E8EEF5] p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
              <div className="lg:flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-white border border-[#0565E6]/15 px-3 py-1.5 rounded-full mb-3">
                  <Clock3 size={12} strokeWidth={2.5} />
                  Quick Intro
                </span>
                <h2 className="text-2xl sm:text-[1.85rem] font-extrabold text-gray-900 tracking-tight leading-tight">
                  About DeviceKart in{" "}
                  <span className="text-[#0565E6]">30 Seconds</span>
                </h2>
                <p className="text-sm sm:text-[15px] text-gray-600 mt-3 leading-relaxed max-w-2xl">
                  {ENTITY_SUMMARY}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:w-[280px] shrink-0">
                {[
                  {
                    Icon: Building2,
                    title: "Operated by",
                    desc: "Swastika Innovation Pvt. Ltd.",
                    color: "bg-[#DBE8FF] text-[#0565E6]",
                  },
                  {
                    Icon: MapPin,
                    title: "Coverage",
                    desc: "2,000+ cities across India",
                    color: "bg-[#DCFCE7] text-[#16A34A]",
                  },
                  {
                    Icon: IndianRupee,
                    title: "Get paid via",
                    desc: "UPI · Bank · Cash",
                    color: "bg-[#FFEDD5] text-[#EA580C]",
                  },
                ].map(({ Icon, title, desc, color }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm"
                  >
                    <span className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}>
                      <Icon size={18} strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                        {title}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5 leading-snug">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
