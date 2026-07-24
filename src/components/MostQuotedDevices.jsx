import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Crosshair,
  TrendingUp,
  Star,
  Medal,
  Zap,
  Lock,
  Truck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Search,
  ClipboardList,
  Wallet,
  ShieldCheck,
  BadgeCheck,
  Users,
  Headphones,
} from "lucide-react";
import { deviceService } from "../services/device.service";
import { formatCurrency } from "../utils/formatCurrency";

const BADGES = [
  { label: "High Demand", icon: TrendingUp, className: "bg-[#DCFCE7] text-[#15803D]" },
  { label: "Most Popular", icon: Star, className: "bg-[#DBE8FF] text-[#0565E6]" },
  { label: "Best Value", icon: Medal, className: "bg-[#D1FAE5] text-[#047857]" },
  { label: "Quick Sale", icon: Zap, className: "bg-[#FEF3C7] text-[#B45309]" },
];

const CARD_PERKS = [
  { label: "Best Price Guaranteed", Icon: Lock },
  { label: "Free Pickup", Icon: Truck },
  { label: "Instant Payment", Icon: Zap },
];

const PROCESS_STEPS = [
  {
    n: 1,
    title: "Get Quote",
    desc: "Search your device and get instant price.",
    Icon: Search,
    color: "bg-[#DBE8FF] text-[#0565E6]",
  },
  {
    n: 2,
    title: "Confirm Details",
    desc: "Answer few questions about your device.",
    Icon: ClipboardList,
    color: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    n: 3,
    title: "Free Pickup",
    desc: "We pick it up from your doorstep for free.",
    Icon: Truck,
    color: "bg-[#EDE9FE] text-[#7C3AED]",
  },
  {
    n: 4,
    title: "Get Paid Instantly",
    desc: "Receive instant payment in your bank account.",
    Icon: Wallet,
    color: "bg-[#FFEDD5] text-[#EA580C]",
  },
];

const TRUST_ITEMS = [
  {
    title: "100% Safe & Secure",
    desc: "Data wiped & secure handling",
    Icon: ShieldCheck,
    color: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    title: "Best Price Guaranteed",
    desc: "Get highest value for your device",
    Icon: BadgeCheck,
    color: "bg-[#DBE8FF] text-[#0565E6]",
  },
  {
    title: "Trusted by 50,000+ Customers",
    desc: "Rated 4.9/5 across platforms",
    Icon: Users,
    color: "bg-[#EDE9FE] text-[#7C3AED]",
  },
  {
    title: "24x7 Customer Support",
    desc: "We're always here to help",
    Icon: Headphones,
    color: "bg-[#FFEDD5] text-[#EA580C]",
  },
];

function DeviceCard({ device, badge, active, onActivate }) {
  const BadgeIcon = badge.icon;

  return (
    <article
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={`group flex flex-col h-full min-w-0 w-full snap-start bg-white rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
        active
          ? "border-[#0565E6] shadow-[0_12px_32px_rgba(5,101,230,0.12)]"
          : "border-gray-100 shadow-sm hover:border-[#0565E6]/40 hover:shadow-md"
      }`}
    >
      <div className="relative">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.className}`}
        >
          <BadgeIcon size={12} strokeWidth={2.4} />
          {badge.label}
        </span>

        <div className="flex items-center justify-center h-[160px] sm:h-[180px] mt-2 mb-3">
          <img
            src={device.imageUrl || "/placeholder-device.png"}
            alt={device.modelName}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </div>

      <h3 className="text-[15px] sm:text-base font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem]">
        {device.modelName}
      </h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">
        Upto {formatCurrency(device.maxPrice)}
      </p>

      <div className="hidden sm:grid grid-cols-3 gap-1 mb-4">
        {CARD_PERKS.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1 px-0.5">
            <span className="w-8 h-8 rounded-full bg-[#F3F6FB] text-[#0565E6] flex items-center justify-center">
              <Icon size={14} strokeWidth={2.2} />
            </span>
            <span className="text-[10px] leading-tight text-gray-500 font-medium">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex sm:hidden items-center justify-center gap-3 mb-4 text-[#0565E6]">
        {CARD_PERKS.map(({ label, Icon }) => (
          <span key={label} className="w-9 h-9 rounded-full bg-[#F3F6FB] flex items-center justify-center" title={label}>
            <Icon size={15} strokeWidth={2.2} />
          </span>
        ))}
      </div>

      <Link
        to={device.sellPath}
        className={`mt-auto w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold no-underline transition-all duration-200 ${
          active
            ? "bg-[#0565E6] text-white hover:bg-[#044BA8]"
            : "bg-white text-[#0565E6] border border-[#0565E6] hover:bg-[#0565E6] hover:text-white"
        }`}
      >
        Get Quote
        <ArrowRight size={15} strokeWidth={2.5} />
      </Link>
    </article>
  );
}

export default function MostQuotedDevices({ viewAllPath = "/sell-old-mobile-phones/brand" }) {
  const scrollerRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(2);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    deviceService
      .getMostQuoted(8, "all")
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        setDevices(list);
        setActiveIdx(Math.min(2, Math.max(0, list.length - 1)));
      })
      .catch(() => {
        if (!cancelled) setDevices([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [devices, loading]);

  const scrollByCard = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-quoted-card]");
    const amount = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#EEF4FF] border border-[#0565E6]/20 px-3 py-1.5 rounded-lg mb-3">
              <Crosshair size={12} strokeWidth={2.5} />
              Top Seller Choices
            </span>
            <h2 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              Most Quoted <span className="text-[#0565E6]">Devices</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-xl leading-relaxed">
              These devices are in highest demand right now. Get the best value for your device.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              to={viewAllPath}
              className="text-sm font-bold text-[#0565E6] no-underline hover:underline inline-flex items-center gap-1"
            >
              View All Devices
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous devices"
                disabled={!canPrev || devices.length === 0}
                onClick={() => scrollByCard(-1)}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:border-[#0565E6] hover:text-[#0565E6] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                aria-label="Next devices"
                disabled={!canNext || devices.length === 0}
                onClick={() => scrollByCard(1)}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:border-[#0565E6] hover:text-[#0565E6] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[420px] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F7F9FC] px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              Most quoted sell devices will show up here once users start taking the quiz.
            </p>
            <Link
              to={viewAllPath}
              className="inline-flex items-center gap-1 mt-4 text-sm font-bold text-[#0565E6] no-underline hover:underline"
            >
              Browse all devices
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {devices.map((device, i) => (
              <div key={device.slug} data-quoted-card className="w-[min(280px,85%)] sm:w-[46%] lg:w-auto shrink-0 lg:shrink">
                <DeviceCard
                  device={device}
                  badge={BADGES[i % BADGES.length]}
                  active={activeIdx === i}
                  onActivate={() => setActiveIdx(i)}
                />
              </div>
            ))}
          </div>
        )}

        {/* 4 Simple Steps */}
        <div className="mt-10 sm:mt-12 rounded-2xl sm:rounded-3xl bg-[#F0F5FF] border border-[#DBE8FF] px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10">
            <div className="lg:w-[32%] shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-0.5 bg-[#0565E6] rounded-full" />
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#0565E6]">
                  Easy Process
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                Sell Your Device in{" "}
                <span className="text-[#0565E6]">4 Simple Steps</span>
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Fast, secure and hassle-free experience from quote to payment.
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 relative">
              {PROCESS_STEPS.map((step, i) => {
                const Icon = step.Icon;
                return (
                  <div key={step.n} className="relative flex sm:flex-col gap-3 sm:gap-2.5">
                    {i < PROCESS_STEPS.length - 1 && (
                      <div
                        className="hidden xl:block absolute top-6 left-[calc(50%+28px)] right-[-12px] border-t border-dashed border-[#93C5FD]"
                        aria-hidden
                      />
                    )}
                    <div
                      className={`relative z-[1] w-12 h-12 rounded-full ${step.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        <span className="text-[#0565E6]">{step.n}</span> {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {TRUST_ITEMS.map(({ title, desc, Icon, color }) => (
            <div key={title} className="flex items-start gap-3">
              <span className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={20} strokeWidth={2.1} />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-snug">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
