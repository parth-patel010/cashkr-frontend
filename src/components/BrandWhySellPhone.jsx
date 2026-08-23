import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeIndianRupee,
  Clock3,
  LockKeyhole,
  Sparkles,
  Truck,
} from "lucide-react";
import { getCategoryBrandMeta } from "../data/categoryBrandContent";

const PILLAR_ICONS = [BadgeIndianRupee, Clock3, Truck, LockKeyhole];
const PILLAR_TONES = [
  { tone: "from-[#ECFDF5] to-white border-emerald-100", icon: "bg-emerald-500 text-white" },
  { tone: "from-[#EEF4FF] to-white border-blue-100", icon: "bg-[#0565E6] text-white" },
  { tone: "from-[#FFF7ED] to-white border-orange-100", icon: "bg-orange-500 text-white" },
  { tone: "from-[#F5F3FF] to-white border-violet-100", icon: "bg-violet-600 text-white" },
];

const SCORE_RAIL = [
  { label: "Offer", us: "Up to 20% more", them: "Often lower" },
  { label: "Pickup", us: "Always free", them: "₹99–₹299 typical" },
  { label: "Payment", us: "Instant", them: "1–2 days" },
  { label: "Data wipe", us: "Guaranteed", them: "Not always" },
];

/**
 * Brand-page “Why Sell” — same layout for every category; copy from meta.
 */
export default function BrandWhySellPhone({ category = "mobile" }) {
  const meta = getCategoryBrandMeta(category);
  const pillars = meta.pillars.map((p, i) => ({
    ...p,
    Icon: PILLAR_ICONS[i] || Sparkles,
    ...PILLAR_TONES[i],
  }));

  return (
    <section className="relative overflow-hidden bg-[#F0F5FF] py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(5,101,230,0.12), transparent 42%), radial-gradient(circle at 88% 10%, rgba(124,58,237,0.08), transparent 36%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 sm:mb-10">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-white/80 border border-[#0565E6]/20 px-3 py-1.5 rounded-lg mb-3 shadow-sm">
              <Sparkles size={12} strokeWidth={2.4} />
              {meta.whyEyebrow}
            </span>
            <h2 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              {meta.whyTitleBefore}{" "}
              <span className="text-[#0565E6]">DeviceKart</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2.5 leading-relaxed">
              {meta.whySubtitle}
            </p>
          </div>

          <Link
            to="#top"
            className="inline-flex items-center gap-2 self-start lg:self-auto h-11 px-5 rounded-full bg-[#0565E6] hover:bg-[#0450C5] text-white text-sm font-bold no-underline shadow-[0_10px_24px_rgba(5,101,230,0.28)] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Sparkles size={15} strokeWidth={2.4} />
            Choose your brand
            <ArrowRight size={16} strokeWidth={2.4} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {pillars.map(({ title, desc, Icon, tone, icon }) => (
            <article
              key={title}
              className={`rounded-2xl border bg-gradient-to-br ${tone} p-5 sm:p-6 shadow-[0_4px_18px_rgba(15,23,42,0.04)]`}
            >
              <span
                className={`inline-flex w-11 h-11 rounded-xl ${icon} items-center justify-center mb-3 shadow-sm`}
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">{title}</h3>
              <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl sm:rounded-[24px] bg-white border border-[#D7E4F7] shadow-[0_8px_28px_rgba(5,101,230,0.07)] overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 border-b border-[#E8EEF5] bg-[#F8FBFF] flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-extrabold text-gray-900">
              DeviceKart vs typical options
            </p>
            <p className="text-[11px] font-semibold text-[#0565E6]">
              {meta.scoreRailHint}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8EEF5]">
            {SCORE_RAIL.map(({ label, us, them }) => (
              <div key={label} className="px-4 sm:px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">
                  {label}
                </p>
                <p className="text-sm font-extrabold text-[#0565E6] leading-snug">{us}</p>
                <p className="text-xs text-gray-400 mt-1 line-through decoration-gray-300">
                  {them}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
