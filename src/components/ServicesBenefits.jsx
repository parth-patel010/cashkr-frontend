import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Settings2,
  Tag,
  ShoppingBag,
  Wrench,
  Check,
  ArrowRight,
  Truck,
  Zap,
  ShieldCheck,
  BadgeCheck,
  Headphones,
} from "lucide-react";

const ASSETS = {
  sell: "/landing_page_assets/sell-card-image-clear.png?v=2",
  buy: "/landing_page_assets/buy-card-image.png",
  repair: "/landing_page_assets/repair-card-image-clear.png?v=2",
};

const AVATARS = [
  { initial: "A", bg: "bg-[#0565E6]" },
  { initial: "R", bg: "bg-[#16A34A]" },
  { initial: "S", bg: "bg-[#7C3AED]" },
];

const SERVICES = [
  {
    key: "sell",
    titleLead: "Sell",
    titleAccent: "Your Device",
    desc: "Get the best value for your old devices in 60 seconds.",
    Icon: Tag,
    image: ASSETS.sell,
    to: "/sell",
    cta: "Get Device Value",
    proof: "50,000+ devices sold last month",
    features: [
      "Best Price Guaranteed",
      "Free Doorstep Pickup",
      "Instant Payment",
      "100% Safe & Secure",
    ],
    theme: {
      accent: "text-[#16A34A]",
      iconBg: "bg-[#DCFCE7] text-[#16A34A]",
      checkBg: "bg-[#DCFCE7] text-[#16A34A]",
      glow: "radial-gradient(circle, rgba(134,239,172,0.55) 0%, rgba(187,247,208,0.28) 42%, transparent 70%)",
      btn: "bg-gradient-to-r from-[#22C55E] to-[#15803D] hover:from-[#16A34A] hover:to-[#166534] shadow-[#22C55E]/30",
      border: "hover:border-[#86EFAC]",
    },
  },
  {
    key: "buy",
    titleLead: "Buy",
    titleAccent: "Refurbished",
    desc: "Certified, tested and reliable devices at the best prices.",
    Icon: ShoppingBag,
    image: ASSETS.buy,
    to: "/buy",
    cta: "Explore Devices",
    proof: "10,000+ happy buyers",
    features: [
      "32 Point Quality Check",
      "6 Months Warranty",
      "Easy Returns",
      "Best Market Prices",
    ],
    theme: {
      accent: "text-[#0565E6]",
      iconBg: "bg-[#DBE8FF] text-[#0565E6]",
      checkBg: "bg-[#DBE8FF] text-[#0565E6]",
      glow: "radial-gradient(circle, rgba(147,197,253,0.55) 0%, rgba(191,219,254,0.28) 42%, transparent 70%)",
      btn: "bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] shadow-[#3B82F6]/30",
      border: "hover:border-[#93C5FD]",
    },
  },
  {
    key: "repair",
    titleLead: "Repair",
    titleAccent: "Your Device",
    desc: "Expert repair services with original parts & warranty.",
    Icon: Wrench,
    image: ASSETS.repair,
    to: "/repair",
    cta: "Book a Repair",
    proof: "25,000+ repairs completed",
    features: [
      "Screen & Battery Repair",
      "Original Parts Used",
      "Expert Technicians",
      "Warranty on Repair",
    ],
    theme: {
      accent: "text-[#7C3AED]",
      iconBg: "bg-[#EDE4FF] text-[#7C3AED]",
      checkBg: "bg-[#EDE4FF] text-[#7C3AED]",
      glow: "radial-gradient(circle, rgba(196,181,253,0.55) 0%, rgba(221,214,254,0.28) 42%, transparent 70%)",
      btn: "bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] shadow-[#8B5CF6]/30",
      border: "hover:border-[#C4B5FD]",
    },
  },
];

const BENEFITS = [
  {
    title: "Free Pickup",
    desc: "At your doorstep anywhere in India",
    Icon: Truck,
    color: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    title: "Instant Payment",
    desc: "Get paid instantly in your bank account",
    Icon: Zap,
    color: "bg-[#FEF3C7] text-[#D97706]",
  },
  {
    title: "Secure & Safe",
    desc: "100% data wipe & secure transactions",
    Icon: ShieldCheck,
    color: "bg-[#DBE8FF] text-[#0565E6]",
  },
  {
    title: "Trusted by 50K+",
    desc: "50,000+ happy customers",
    Icon: BadgeCheck,
    color: "bg-[#EDE4FF] text-[#7C3AED]",
  },
  {
    title: "24/7 Support",
    desc: "We're here to help you anytime",
    Icon: Headphones,
    color: "bg-[#FEE2E2] text-[#DC2626]",
  },
];

function AvatarStack() {
  return (
    <div className="flex -space-x-2 shrink-0">
      {AVATARS.map((a, i) => (
        <span
          key={a.initial}
          className={`w-7 h-7 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center ${a.bg}`}
          style={{ zIndex: AVATARS.length - i }}
        >
          {a.initial}
        </span>
      ))}
    </div>
  );
}

export default function ServicesBenefits({ sellPath = "/sell" }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="our-services"
      className={`relative overflow-hidden bg-[#F8FAFC] py-14 sm:py-20 scroll-mt-28 ${visible ? "svc-ready" : ""}`}
    >
      <style>{`
        @keyframes svcFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes svcFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .svc-anim {
          opacity: 0;
        }
        .svc-ready .svc-anim {
          animation: svcFadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .svc-ready .svc-phone {
          animation: svcFloat 4.5s ease-in-out 0.9s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .svc-anim,
          .svc-ready .svc-anim,
          .svc-ready .svc-phone {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* corner dots */}
      <div
        className="pointer-events-none absolute top-8 left-6 w-40 h-40 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#94A3B8 1.2px, transparent 1.2px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div
        className="pointer-events-none absolute top-8 right-6 w-40 h-40 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#94A3B8 1.2px, transparent 1.2px)",
          backgroundSize: "14px 14px",
        }}
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div
            className="svc-anim inline-flex items-center gap-2 bg-[#EEF4FF] text-[#0565E6] text-[11px] sm:text-xs font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-4 border border-[#0565E6]/15"
            style={{ animationDelay: "60ms" }}
          >
            <Settings2 size={13} strokeWidth={2.4} />
            All-in-One Device Solution
          </div>
          <h2
            className="svc-anim text-2xl sm:text-3xl lg:text-[2.5rem] font-extrabold tracking-tight text-gray-900 mb-3"
            style={{ animationDelay: "140ms" }}
          >
            Our Services,{" "}
            <span className="text-[#0565E6]">Your Benefits</span>
          </h2>
          <p
            className="svc-anim text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed"
            style={{ animationDelay: "220ms" }}
          >
            Sell your old device, buy certified refurbished products or get expert repair – all in one trusted platform.
          </p>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {SERVICES.map((svc, i) => {
            const Icon = svc.Icon;
            const to = svc.key === "sell" ? sellPath : svc.to;
            return (
              <article
                key={svc.key}
                className={`svc-anim group relative bg-white rounded-[28px] border border-gray-100 shadow-[0_12px_40px_rgba(15,23,42,0.06)] p-5 sm:p-6 flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.1)] ${svc.theme.border}`}
                style={{ animationDelay: `${320 + i * 140}ms` }}
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 flex-1 relative z-10">
                  <div className="flex-1 min-w-0 flex flex-col order-2 sm:order-1">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${svc.theme.iconBg}`}>
                      <Icon size={22} strokeWidth={2.1} />
                    </div>

                    <h3 className="text-xl sm:text-[1.35rem] font-extrabold text-gray-900 leading-tight mb-2">
                      {svc.titleLead}{" "}
                      <span className={svc.theme.accent}>{svc.titleAccent}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4">
                      {svc.desc}
                    </p>

                    <ul className="space-y-2.5 mb-1">
                      {svc.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${svc.theme.checkBg}`}>
                            <Check size={12} strokeWidth={3} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative w-full sm:w-[40%] lg:w-[44%] shrink-0 flex items-center justify-center self-stretch min-h-[160px] sm:min-h-[200px] order-1 sm:order-2">
                    {/* Soft radial circle behind phone — clipped by card overflow */}
                    <div
                      className="pointer-events-none absolute right-[-18%] top-1/2 -translate-y-1/2 w-[150%] aspect-square rounded-full"
                      style={{ background: svc.theme.glow }}
                      aria-hidden="true"
                    />
                    <div
                      className="svc-phone relative z-10 w-full max-h-[180px] sm:max-h-[230px] flex items-center justify-center"
                      style={{ animationDelay: `${0.3 + i * 0.35}s` }}
                    >
                      <img
                        src={svc.image}
                        alt=""
                        className="w-full max-h-[180px] sm:max-h-[230px] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                        draggable={false}
                      />
                    </div>
                    {svc.key === "repair" && (
                      <div className="absolute top-4 right-1 z-20 w-9 h-9 rounded-full bg-[#EDE4FF] text-[#7C3AED] flex items-center justify-center shadow-md border border-white animate-pulse">
                        <ShieldCheck size={16} strokeWidth={2.2} />
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to={to}
                  className={`relative z-10 mt-5 w-full box-border flex items-center justify-between gap-2 text-white text-sm font-bold px-5 py-3.5 rounded-2xl no-underline shadow-lg transition-all hover:brightness-105 ${svc.theme.btn}`}
                >
                  <span>{svc.cta}</span>
                  <ArrowRight size={16} strokeWidth={2.5} className="shrink-0" />
                </Link>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <AvatarStack />
                  <p className="text-xs sm:text-[13px] text-gray-500 font-medium leading-snug">
                    {svc.proof}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom benefits bar */}
        <div
          className="svc-anim mt-8 sm:mt-10 bg-white rounded-[28px] border border-gray-200 shadow-[0_8px_30px_rgba(15,23,42,0.04)] px-4 sm:px-6 py-5 sm:py-6"
          style={{ animationDelay: "780ms" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-4">
            {BENEFITS.map(({ title, desc, Icon, color }, i) => (
              <div
                key={title}
                className="svc-anim flex items-start gap-3 min-w-0"
                style={{ animationDelay: `${860 + i * 80}ms` }}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 ${color}`}>
                  <Icon size={18} strokeWidth={2.1} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-gray-900 leading-tight mb-0.5">{title}</p>
                  <p className="text-xs text-gray-500 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
