import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Shield,
  ShieldCheck,
  RefreshCw,
  Lock,
  Truck,
} from "lucide-react";
import { buyService } from "../services/buy.service";
import { formatCurrency } from "../utils/formatCurrency";

const FETCH_CATEGORIES = ["mobile", "tablet", "laptop", "mac", "smartwatch"];

const WHY_BUY = [
  {
    title: "32 Quality Checks",
    desc: "Every device goes through rigorous testing",
    Icon: Shield,
    color: "bg-[#DBE8FF] text-[#0565E6]",
  },
  {
    title: "6 Months Warranty",
    desc: "Worry-free performance guaranteed",
    Icon: ShieldCheck,
    color: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    title: "Easy Returns",
    desc: "7-day easy return policy",
    Icon: RefreshCw,
    color: "bg-[#EDE9FE] text-[#7C3AED]",
  },
  {
    title: "Secure Payments",
    desc: "100% safe & secure transactions",
    Icon: Lock,
    color: "bg-[#FFEDD5] text-[#EA580C]",
  },
  {
    title: "Fast Delivery",
    desc: "Quick delivery at your doorstep",
    Icon: Truck,
    color: "bg-[#FEE2E2] text-[#DC2626]",
  },
];

const CONDITION_DISPLAY = {
  superb: "Excellent",
  good: "Good",
  fair: "Fair",
  best_value: "Best Value",
};

function pickBestCondition(conditions = []) {
  const priced = conditions.filter((c) => Number(c?.price) > 0);
  if (!priced.length) return null;
  // Prefer highest grade among priced tiers; fall back to cheapest offer
  const order = ["superb", "good", "fair", "best_value"];
  for (const key of order) {
    const hit = priced.find((c) => c.key === key);
    if (hit) return hit;
  }
  return priced.reduce((a, b) => (a.price <= b.price ? a : b));
}

function buildSpecs(product) {
  const bits = [];
  if (product.brand) bits.push(product.brand);
  if (product.warrantyMonths) bits.push(`${product.warrantyMonths} Mo Warranty`);
  if (product.category) {
    bits.push(product.category.charAt(0).toUpperCase() + product.category.slice(1));
  }
  return bits.join(" | ");
}

function productHref(product) {
  const brand = encodeURIComponent(String(product.brand || "").toLowerCase());
  return `/buy/${product.category || "mobile"}/${brand}/${product.slug}`;
}

/** Stable ₹10k–₹20k bump from slug so original price doesn't flicker on re-render */
function priceBumpFromSlug(slug = "") {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const bump = 10000 + (hash % 11000); // 10,000 – 20,999
  return Math.round(bump / 100) * 100;
}

function mapProduct(product, index) {
  const tier = pickBestCondition(product.conditions);
  const price = Number(tier?.price || product.minPrice || 0);
  const apiMrp = Number(tier?.mrp || 0);
  const bump = priceBumpFromSlug(product.slug || product._id || String(index));
  // Prefer real MRP when higher; otherwise fabricate original as sale + ₹10k–₹20k
  const mrp =
    apiMrp > price
      ? apiMrp
      : price > 0
        ? price + bump
        : 0;
  const discount =
    mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const created = product.createdAt ? new Date(product.createdAt).getTime() : 0;
  const isRecent = Date.now() - created < 1000 * 60 * 60 * 24 * 21; // 21 days
  const badge =
    discount >= 18
      ? { label: "HOT DEAL", className: "bg-[#FFEDD5] text-[#C2410C]" }
      : { label: "NEW", className: "bg-[#DBE8FF] text-[#0565E6]" };

  return {
    id: product._id || product.slug,
    name: product.title || product.modelName,
    imageUrl: product.imageUrl,
    href: productHref(product),
    specs: buildSpecs(product),
    conditionLabel: CONDITION_DISPLAY[tier?.key] || tier?.label || "Excellent",
    price,
    mrp,
    discount,
    badge: isRecent || index < 4 ? badge : discount >= 15 ? badge : { label: "NEW", className: "bg-[#DBE8FF] text-[#0565E6]" },
    createdAt: created,
  };
}

function BuyCard({ item, active, onActivate, liked, onToggleLike }) {
  return (
    <article
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={`group flex flex-col h-full min-w-0 w-full snap-start bg-white rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 ${
        active
          ? "border-[#0565E6] shadow-[0_12px_28px_rgba(5,101,230,0.12)]"
          : "border-gray-100 shadow-sm hover:border-[#0565E6]/35 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className={`inline-flex text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded-md ${item.badge.className}`}
        >
          {item.badge.label}
        </span>
        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            onToggleLike();
          }}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
            liked
              ? "border-[#FECACA] bg-[#FEF2F2] text-[#EF4444]"
              : "border-gray-100 bg-white text-gray-400 hover:text-[#EF4444] hover:border-[#FECACA]"
          }`}
        >
          <Heart size={15} strokeWidth={2.2} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex items-center justify-center h-[130px] sm:h-[140px] mb-3">
        <img
          src={item.imageUrl || "/placeholder-device.png"}
          alt={item.name}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <span className="inline-flex self-start text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] mb-2">
        {item.conditionLabel}
      </span>

      <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.4rem]">
        {item.name}
      </h3>
      <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{item.specs}</p>

      <div className="mt-3 mb-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-lg font-extrabold text-gray-900 tracking-tight">
            {formatCurrency(item.price)}
          </span>
          {item.mrp > item.price && (
            <span className="text-sm text-gray-400 line-through decoration-gray-400">
              {formatCurrency(item.mrp)}
            </span>
          )}
        </div>
        {item.discount > 0 && (
          <span className="inline-flex mt-1.5 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D]">
            {item.discount}% OFF
          </span>
        )}
      </div>

      <Link
        to={item.href}
        className={`mt-auto w-full box-border flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold no-underline transition-all duration-200 ${
          active
            ? "bg-[#0565E6] text-white hover:bg-[#044BA8]"
            : "bg-[#EEF4FF] text-[#0565E6] border border-[#BFDBFE] hover:bg-[#0565E6] hover:text-white hover:border-[#0565E6]"
        }`}
      >
        Buy Now
        <ArrowRight size={14} strokeWidth={2.5} />
      </Link>
    </article>
  );
}

export default function RecentlyAddedDevices({ viewAllPath = "/buy" }) {
  const scrollerRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [liked, setLiked] = useState(() => new Set());
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all(
      FETCH_CATEGORIES.map((category) =>
        buyService
          .getProducts({ category })
          .then((res) => (Array.isArray(res.data) ? res.data : []))
          .catch(() => []),
      ),
    )
      .then((lists) => {
        if (cancelled) return;
        const merged = lists
          .flat()
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 12)
          .map(mapProduct);
        setItems(merged);
        setActiveIdx(Math.min(3, Math.max(0, merged.length - 1)));
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
  }, [items, loading]);

  const scrollByCard = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-recent-card]");
    const amount = card ? card.getBoundingClientRect().width + 14 : el.clientWidth * 0.7;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const toggleLike = (id) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="bg-[#F7F9FC] py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#EEF4FF] border border-[#0565E6]/20 px-3 py-1.5 rounded-full mb-3">
              <Zap size={12} strokeWidth={2.5} />
              Newly Listed
            </span>
            <h2 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              Recently Added <span className="text-[#0565E6]">Devices</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-xl leading-relaxed">
              Brand new arrivals. 100% tested, certified and ready to use.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <Link
              to={viewAllPath}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-[#0565E6] border border-[#BFDBFE] bg-white px-3.5 py-2 rounded-full no-underline hover:bg-[#EEF4FF] transition-colors"
            >
              View All Devices
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous devices"
                disabled={!canPrev}
                onClick={() => scrollByCard(-1)}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-700 flex items-center justify-center hover:border-[#0565E6] hover:text-[#0565E6] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                aria-label="Next devices"
                disabled={!canNext}
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
          <div className="flex gap-3.5 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[360px] w-[220px] shrink-0 rounded-2xl bg-gray-200/70 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              New refurbished devices will show up here as soon as they’re listed.
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
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none" }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                data-recent-card
                className="w-[min(220px,78vw)] sm:w-[190px] lg:w-[178px] shrink-0"
              >
                <BuyCard
                  item={item}
                  active={activeIdx === i}
                  onActivate={() => setActiveIdx(i)}
                  liked={liked.has(item.id)}
                  onToggleLike={() => toggleLike(item.id)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="sm:hidden mt-4">
          <Link
            to={viewAllPath}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#0565E6] no-underline"
          >
            View All Devices
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Why Buy Refurbished */}
        <div className="mt-10 sm:mt-12 rounded-2xl sm:rounded-3xl bg-white border border-gray-100 shadow-sm px-5 py-8 sm:px-8 sm:py-10">
          <h3 className="text-center text-lg sm:text-xl font-extrabold text-gray-900 mb-7 sm:mb-9">
            Why Buy Refurbished from{" "}
            <span className="text-[#0565E6]">DeviceKart?</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-5">
            {WHY_BUY.map(({ title, desc, Icon, color }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2.5">
                <span
                  className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}
                >
                  <Icon size={20} strokeWidth={2.1} />
                </span>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
