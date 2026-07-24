import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Shield,
  ShoppingBag,
  ChevronRight,
  CheckCircle2,
  Users,
  IndianRupee,
  Package,
  Star,
  MapPin,
  Smartphone,
  Wrench,
} from "lucide-react";
import { deviceService } from "../services/device.service";

const HERO_IMG = "/landing_page_assets/hero-right-img.png";

const POPULAR = [
  "iPhone 15",
  "Samsung S24",
  "OnePlus 12",
  "MacBook Air",
  "iPad Pro",
];

const STATS = [
  {
    label: "50,000+ Happy Customers",
    icon: Users,
    color: "bg-[#EEF4FF] text-[#0565E6]",
  },
  {
    label: "₹25Cr+ Paid to Customers",
    icon: IndianRupee,
    color: "bg-[#E8F8EF] text-[#16A34A]",
  },
  {
    label: "1L+ Devices Sold",
    icon: Package,
    color: "bg-[#F3EEFF] text-[#7C3AED]",
  },
  {
    label: "4.9/5 Customer Rating",
    icon: Star,
    color: "bg-[#FFF8E8] text-[#EAB308]",
  },
  {
    label: "100+ Cities Covered",
    icon: MapPin,
    color: "bg-[#FFE8F0] text-[#EC4899]",
  },
];

const SERVICES = [
  {
    key: "sell",
    title: "Sell Your Device",
    desc: "Get instant quotes and free doorstep pickup for your old gadgets.",
    Icon: Smartphone,
    theme: {
      bg: "bg-[#F0FBF4]",
      iconBg: "bg-[#DCFCE7] text-[#16A34A]",
      btn: "bg-[#16A34A] hover:bg-[#15803D]",
    },
  },
  {
    key: "buy",
    title: "Buy Refurbished",
    desc: "Certified refurbished devices with warranty at best prices.",
    to: "/buy",
    Icon: ShoppingBag,
    theme: {
      bg: "bg-[#F0F5FF]",
      iconBg: "bg-[#DBE8FF] text-[#0565E6]",
      btn: "bg-[#0565E6] hover:bg-[#0450C5]",
    },
  },
  {
    key: "repair",
    title: "Repair Your Device",
    desc: "Expert doorstep repair for phones with genuine spare parts.",
    to: "/repair",
    Icon: Wrench,
    theme: {
      bg: "bg-[#F6F0FF]",
      iconBg: "bg-[#EDE4FF] text-[#7C3AED]",
      btn: "bg-[#7C3AED] hover:bg-[#6D28D9]",
    },
  },
];

const FEATURES = [
  { icon: Shield, label: "100% Secure Transactions" },
  { label: "Data Wipe Protection" },
  { label: "7 Days Easy Return" },
  { label: "Warranty on All Devices" },
  { label: "Doorstep Pickup" },
];

const CATEGORY_ROUTE_MAP = {
  mobile: "/sell-old-mobile-phones",
  tablet: "/sell-tablet",
  laptop: "/sell-old-laptops",
  mac: "/sell-imac",
};

function SmartUnderline() {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.getBoundingClientRect();
    path.style.transition = "stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1) 0.55s";
    path.style.strokeDashoffset = "0";
  }, []);

  return (
    <svg
      className="absolute left-[-2%] right-[-4%] -bottom-[0.12em] w-[108%] h-[0.28em] overflow-visible pointer-events-none"
      viewBox="0 0 120 14"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        d="M3 9.5C18 6.2 32 5.5 48 7.2C68 9.2 82 10.5 98 8.2C106 7.2 113 6.5 117 6"
        stroke="#0565E6"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FadeUp({ children, delay = 0, className = "", as: Tag = "div" }) {
  return (
    <Tag
      className={`hero-fade-up ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default function LandingHero({ sellPath = "/sell-old-mobile-phones/brand" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [ready, setReady] = useState(false);
  const [dotsHeight, setDotsHeight] = useState("55%");
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const sectionRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const updateDots = () => {
      const section = sectionRef.current;
      const stats = statsRef.current;
      if (!section || !stats) return;
      const sectionTop = section.getBoundingClientRect().top;
      const statsRect = stats.getBoundingClientRect();
      // Dots end at vertical midpoint of the stats card
      const height = statsRect.top - sectionTop + statsRect.height / 2;
      setDotsHeight(`${Math.max(0, Math.round(height))}px`);
    };

    updateDots();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateDots) : null;
    if (ro && sectionRef.current) ro.observe(sectionRef.current);
    if (ro && statsRef.current) ro.observe(statsRef.current);
    window.addEventListener("resize", updateDots);
    // Recalc after hero image / fonts settle
    const t = setTimeout(updateDots, 400);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", updateDots);
      clearTimeout(t);
    };
  }, []);

  const performSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const { data } = await deviceService.searchDevices(q.trim());
      setResults(Array.isArray(data) ? data : []);
      setShowResults(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const onSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    debounceRef.current = setTimeout(() => performSearch(value), 280);
  };

  const goToResult = (result) => {
    const base = CATEGORY_ROUTE_MAP[result.category] || "/sell-old-mobile-phones";
    navigate(`${base}/${encodeURIComponent(result.brand)}/${result.slug}`);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const runSearch = () => {
    if (query.trim().length >= 2) performSearch(query);
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-gradient-to-b from-[#F4F8FF] via-[#F7FAFF] to-white ${ready ? "hero-ready" : ""}`}
    >
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.06); }
        }
        @keyframes heroSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-up {
          opacity: 0;
        }
        .hero-ready .hero-fade-up {
          animation: heroFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-ready .hero-visual {
          animation: heroFadeIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
        }
        .hero-ready .hero-visual-img {
          animation: heroFloat 5s ease-in-out 1.1s infinite;
        }
        .hero-ready .hero-glow {
          animation: heroGlow 4.5s ease-in-out infinite;
        }
        .hero-ready .hero-stats {
          animation: heroSlideUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.55s both;
        }
        .hero-ready .hero-service {
          opacity: 0;
          animation: heroFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .hero-ready .hero-features {
          animation: heroFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.95s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-fade-up,
          .hero-ready .hero-fade-up,
          .hero-ready .hero-visual,
          .hero-ready .hero-visual-img,
          .hero-ready .hero-glow,
          .hero-ready .hero-stats,
          .hero-ready .hero-service,
          .hero-ready .hero-features {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* soft dots — stop at half of the stats card */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 opacity-[0.35]"
        style={{
          height: dotsHeight,
          backgroundImage: "radial-gradient(#0565E6 0.8px, transparent 0.8px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, #000 70%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 70%, transparent 100%)",
        }}
      />
      <div className="hero-glow pointer-events-none absolute -top-24 right-[10%] w-[420px] h-[420px] rounded-full bg-[#0565E6]/10 blur-3xl" />
      <div className="hero-glow pointer-events-none absolute top-40 -left-20 w-[280px] h-[280px] rounded-full bg-[#93C5FD]/20 blur-3xl" style={{ animationDelay: "1.2s" }} />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-center">
          {/* Left copy */}
          <div className="relative z-10 max-w-xl">
            <FadeUp delay={80}>
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 shadow-sm mb-5">
                <Shield size={14} className="text-[#0565E6]" strokeWidth={2.2} />
                <span className="text-[11px] sm:text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  India&apos;s Trusted Device Marketplace
                </span>
              </div>
            </FadeUp>

            <h1 className="text-[2.15rem] sm:text-[2.75rem] lg:text-[3.15rem] font-extrabold leading-[1.15] tracking-tight text-gray-900 mb-4">
              <FadeUp delay={160} as="span" className="block">
                <span className="block text-gray-900">Sell Old.</span>
              </FadeUp>
              <FadeUp delay={280} as="span" className="block">
                <span className="block text-[#0565E6]">
                  Upgrade{" "}
                  <span className="relative inline-block">
                    Smart.
                    <SmartUnderline />
                  </span>
                </span>
              </FadeUp>
            </h1>

            <FadeUp delay={400}>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 max-w-md">
                Get the best value for your old devices, buy certified refurbished devices and expert{" "}
                <span className="font-semibold text-gray-700">repair</span> – all in one place.
              </p>
            </FadeUp>

            <FadeUp delay={500} className="relative mb-4">
              <div ref={searchRef} className="relative">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-4 pr-1.5 py-1.5 shadow-[0_8px_30px_rgba(5,101,230,0.08)] focus-within:border-[#0565E6]/50 focus-within:shadow-[0_8px_30px_rgba(5,101,230,0.14)] transition-shadow">
                  <Search size={18} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={onSearchChange}
                    onKeyDown={(e) => e.key === "Enter" && runSearch()}
                    onFocus={() => {
                      if (results.length || query.length >= 2) setShowResults(true);
                    }}
                    placeholder="Search device (e.g. iPhone 15)"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400 py-2.5"
                  />
                  <button
                    type="button"
                    onClick={runSearch}
                    className="w-11 h-11 rounded-full bg-[#0565E6] hover:bg-[#0450C5] text-white flex items-center justify-center shrink-0 transition-colors shadow-md shadow-[#0565E6]/30"
                    aria-label="Search"
                  >
                    <Search size={18} strokeWidth={2.4} />
                  </button>
                </div>

                {showResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto animate-[heroFadeUp_0.25s_ease]">
                    {searching ? (
                      <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
                    ) : results.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-400">
                        No devices found for &quot;{query}&quot;
                      </div>
                    ) : (
                      results.map((r) => (
                        <button
                          key={r.slug}
                          type="button"
                          onClick={() => goToResult(r)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                        >
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt="" className="w-9 h-9 object-contain rounded" />
                          ) : (
                            <div className="w-9 h-9 rounded bg-gray-100" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{r.modelName}</p>
                            <p className="text-xs text-gray-400">{r.brand}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </FadeUp>

            <FadeUp delay={580}>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-gray-400 font-medium">Popular searches:</span>
                {POPULAR.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      performSearch(tag);
                    }}
                    className="text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-3.5 py-2.5 min-h-10 hover:border-[#0565E6]/40 hover:text-[#0565E6] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={680}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5">
                <Link
                  to={sellPath}
                  className="inline-flex items-center gap-3 h-[56px] sm:h-[60px] pl-2.5 pr-5 sm:pr-6 bg-[#0565E6] hover:bg-[#0450C5] text-white font-semibold text-[15px] sm:text-base rounded-[28px] no-underline shadow-[0_10px_28px_rgba(5,101,230,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(5,101,230,0.35)]"
                >
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <ShoppingBag size={18} strokeWidth={2.2} />
                  </span>
                  <span className="flex-1 text-center sm:text-left whitespace-nowrap">Get Device Value</span>
                  <ChevronRight size={20} strokeWidth={2.4} className="shrink-0 opacity-90" />
                </Link>
                <Link
                  to="/buy"
                  className="inline-flex items-center gap-3 h-[56px] sm:h-[60px] pl-2.5 pr-5 sm:pr-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold text-[15px] sm:text-base rounded-[28px] no-underline border border-gray-200 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5"
                >
                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                    <ShoppingBag size={18} strokeWidth={2.2} />
                  </span>
                  <span className="flex-1 text-center sm:text-left whitespace-nowrap">Buy Refurbished</span>
                  <ChevronRight size={20} strokeWidth={2.4} className="shrink-0 text-gray-500" />
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={780}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-500">
                {["Free Pickup", "Instant Payment", "Secure & Hassle-free"].map((item, i) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="hidden sm:inline text-gray-300 mr-1">·</span>}
                    <CheckCircle2 size={15} className="text-[#22C55E]" strokeWidth={2.4} />
                    {item}
                  </span>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right visual */}
          <div className="hero-visual relative flex items-center justify-center lg:justify-end min-h-[280px] sm:min-h-[400px]">
            <div className="hero-glow absolute inset-6 sm:inset-10 rounded-full bg-[#B8D4FF]/35 blur-3xl" />
            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[70%] h-[28%] rounded-full bg-[#0565E6]/15 blur-2xl" />
            <img
              src={HERO_IMG}
              alt="Sell, buy and repair devices with DeviceKart"
              className="hero-visual-img relative z-10 w-full max-w-[580px] h-auto object-contain select-none"
              style={{ filter: "drop-shadow(0 24px 40px rgba(5,101,230,0.18))" }}
              draggable={false}
            />
          </div>
        </div>

        {/* Stats bar */}
        <div
          ref={statsRef}
          className="hero-stats mt-10 sm:mt-12 bg-white rounded-[28px] border border-gray-100 shadow-[0_10px_40px_rgba(15,23,42,0.06)] px-4 sm:px-6 py-5 sm:py-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-3">
            {STATS.map(({ label, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={20} strokeWidth={2.1} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-800 leading-snug break-words">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service cards */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICES.map(({ key, title, desc, to, Icon, theme }, i) => (
            <Link
              key={key}
              to={to || sellPath}
              className={`hero-service group flex items-center gap-4 ${theme.bg} rounded-[24px] p-5 sm:p-6 no-underline border border-transparent hover:border-black/5 hover:shadow-md hover:-translate-y-1 transition-all duration-300`}
              style={{ animationDelay: `${700 + i * 120}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${theme.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={26} strokeWidth={1.9} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
              <span
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${theme.btn}`}
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </span>
            </Link>
          ))}
        </div>

        {/* Feature strip */}
        <div className="hero-features mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-x-0 gap-y-3 text-xs sm:text-sm text-gray-500 font-medium">
          {FEATURES.map((f, i) => (
            <div key={f.label} className="flex items-center">
              {i > 0 && <span className="hidden sm:block w-px h-4 bg-gray-200 mx-4 lg:mx-5" />}
              <span className="inline-flex items-center gap-2 px-2 sm:px-0">
                {f.icon ? <f.icon size={15} className="text-[#0565E6]" strokeWidth={2.2} /> : null}
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
