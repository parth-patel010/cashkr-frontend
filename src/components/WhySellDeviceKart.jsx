import {
  Star,
  IndianRupee,
  Zap,
  Truck,
  ShieldCheck,
  Headphones,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  TriangleAlert,
  CircleX,
  CircleDot,
  Users,
  Package,
  MapPin,
} from "lucide-react";
import logo from "../assets/logo.png";

const BENEFITS = [
  {
    title: "Higher Selling Price",
    desc: "Get the best value for your device.",
    Icon: IndianRupee,
    bg: "bg-[#22C55E]",
  },
  {
    title: "Instant Payment",
    desc: "Get paid instantly in your bank account.",
    Icon: Zap,
    bg: "bg-[#7C3AED]",
  },
  {
    title: "Free Doorstep Pickup",
    desc: "We pick up your device for free.",
    Icon: Truck,
    bg: "bg-[#F97316]",
  },
  {
    title: "Secure & Safe",
    desc: "100% data wipe & secure handling.",
    Icon: ShieldCheck,
    bg: "bg-[#0565E6]",
  },
  {
    title: "24x7 Customer Support",
    desc: "We're always here to help you.",
    Icon: Headphones,
    bg: "bg-[#EC4899]",
  },
];

const CellIcon = {
  up: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] ${className || ""}`}>
      <ArrowUpRight size={12} strokeWidth={2.6} />
    </span>
  ),
  down: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEE2E2] text-[#DC2626] ${className || ""}`}>
      <ArrowDownRight size={12} strokeWidth={2.6} />
    </span>
  ),
  check: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] ${className || ""}`}>
      <Check size={12} strokeWidth={3} />
    </span>
  ),
  zap: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] ${className || ""}`}>
      <Zap size={11} strokeWidth={2.6} fill="currentColor" />
    </span>
  ),
  warn: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF3C7] text-[#D97706] ${className || ""}`}>
      <TriangleAlert size={11} strokeWidth={2.6} />
    </span>
  ),
  bad: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEE2E2] text-[#DC2626] ${className || ""}`}>
      <CircleX size={12} strokeWidth={2.4} />
    </span>
  ),
  soft: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FEF3C7] text-[#D97706] ${className || ""}`}>
      <CircleDot size={11} strokeWidth={2.6} />
    </span>
  ),
  ok: ({ className }) => (
    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#DCFCE7] text-[#16A34A] ${className || ""}`}>
      <Check size={12} strokeWidth={3} />
    </span>
  ),
};

const ROWS = [
  {
    label: "Offer Price",
    dk: { text: "Up to 20% More", icon: "up", strong: true },
    other: { text: "Up to 10% Less", icon: "down" },
    local: { text: "Much Lower", icon: "down" },
  },
  {
    label: "Pickup Charges",
    dk: { text: "FREE", icon: "check", strong: true },
    other: { text: "₹99 – ₹299", icon: null },
    local: { text: "You Pay", icon: null },
  },
  {
    label: "Payment Time",
    dk: { text: "Instant Payment", icon: "zap", strong: true },
    other: { text: "1 – 2 Days", icon: null },
    local: { text: "Cash / Uncertain", icon: null },
  },
  {
    label: "Data Security",
    dk: { text: "100% Data Wipe", icon: "check", strong: true },
    other: { text: "Not Always", icon: "warn" },
    local: { text: "Not Safe", icon: "bad" },
  },
  {
    label: "Device Inspection",
    dk: { text: "Professional Check", icon: "check", strong: true },
    other: { text: "Basic Check", icon: "ok" },
    local: { text: "Unprofessional", icon: "soft" },
  },
  {
    label: "Price Transparency",
    dk: { text: "No Hidden Charges", icon: "check", strong: true },
    other: { text: "Hidden Charges", icon: "warn" },
    local: { text: "Not Transparent", icon: "bad" },
  },
  {
    label: "Customer Support",
    dk: { text: "24x7 Support", icon: "check", strong: true },
    other: { text: "Limited Hours", icon: "soft" },
    local: { text: "Not Available", icon: "bad" },
  },
  {
    label: "Transaction Safety",
    dk: { text: "100% Safe & Secure", icon: "check", strong: true },
    other: { text: "Not Guaranteed", icon: "soft" },
    local: { text: "Risk of Fraud", icon: "bad" },
  },
];

const STATS = [
  {
    value: "50,000+",
    title: "Happy Customers",
    sub: "Across India",
    Icon: Users,
    iconWrap: "bg-[#F3E8FF] text-[#7C3AED]",
  },
  {
    value: "₹25Cr+",
    title: "Paid to Customers",
    sub: "Total Payments",
    Icon: IndianRupee,
    iconWrap: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    value: "1L+",
    title: "Devices Sold",
    sub: "Successfully",
    Icon: Package,
    iconWrap: "bg-[#DBE8FF] text-[#0565E6]",
  },
  {
    value: "100+",
    title: "Cities Covered",
    sub: "Pan India",
    Icon: MapPin,
    iconWrap: "bg-[#FFEDD5] text-[#EA580C]",
  },
  {
    value: "4.9/5",
    title: "Customer Rating",
    sub: "Top Rated",
    Icon: ShieldCheck,
    iconWrap: "bg-[#FCE7F3] text-[#DB2777]",
  },
];

function CompareValue({ cell, accent }) {
  const Icon = cell.icon ? CellIcon[cell.icon] : null;
  return (
    <div className={`flex items-center gap-1.5 ${accent ? "justify-center" : ""}`}>
      {Icon && <Icon />}
      <span
        className={`text-[11px] sm:text-xs leading-snug ${
          accent
            ? cell.strong
              ? "font-bold text-[#166534]"
              : "font-semibold text-gray-800"
            : "font-medium text-gray-500"
        }`}
      >
        {cell.text}
      </span>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function TrustpilotMark() {
  return (
    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-sm bg-[#00B67A] text-white">
      <Star size={11} fill="currentColor" strokeWidth={0} />
    </span>
  );
}

function FacebookMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.54-4.7 1.32 0 2.7.24 2.7.24v2.97h-1.52c-1.5 0-1.97.93-1.97 1.89v2.27h3.35l-.54 3.49h-2.81V24C19.61 23.09 24 18.1 24 12.07z"
      />
    </svg>
  );
}

export default function WhySellDeviceKart() {
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* ── Why Sell comparison ── */}
        <div className="rounded-2xl sm:rounded-[28px] bg-[#F7F9FC] border border-gray-100 px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
          <div className="mb-7 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#EEF4FF] border border-[#0565E6]/20 px-3 py-1.5 rounded-full mb-3">
              <Star size={11} fill="currentColor" strokeWidth={0} />
              Better In Every Way
            </span>
            <h2 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              Why Sell on <span className="text-[#0565E6]">DeviceKart?</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-lg leading-relaxed">
              We offer more value, better service and complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)] gap-8 lg:gap-10 items-start">
            {/* Benefits */}
            <ul className="space-y-4 sm:space-y-5">
              {BENEFITS.map(({ title, desc, Icon, bg }) => (
                <li key={title} className="flex items-start gap-3.5">
                  <span
                    className={`w-11 h-11 rounded-full ${bg} text-white flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <div className="pt-0.5">
                    <p className="text-[15px] font-bold text-gray-900 leading-snug">{title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Comparison — mobile cards + desktop table */}
            <div className="w-full min-w-0">
              {/* Mobile / tablet stacked comparison */}
              <div className="lg:hidden space-y-3">
                {ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
                  >
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2.5">
                      {row.label}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 rounded-xl bg-[#EEF4FF] border border-[#BFDBFE] px-3 py-2.5">
                        <span className="text-[11px] font-bold text-[#0565E6]">DeviceKart</span>
                        <CompareValue cell={row.dk} accent />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                        <span className="text-[11px] font-semibold text-gray-400">Other Platforms</span>
                        <CompareValue cell={row.other} />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
                        <span className="text-[11px] font-semibold text-gray-400">Local Buyers</span>
                        <CompareValue cell={row.local} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop comparison table */}
              <div className="hidden lg:block w-full overflow-x-auto overflow-y-visible py-2 px-0.5">
                <div
                  className="min-w-[580px] grid items-stretch"
                  style={{ gridTemplateColumns: "1.05fr 1.3fr 1.1fr 1.05fr" }}
                >
                  <div className="flex flex-col">
                    <div className="h-[58px]" />
                    {ROWS.map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex items-center min-h-[52px] pr-2 ${
                          i !== ROWS.length - 1 ? "border-b border-gray-200/80" : ""
                        }`}
                      >
                        <p className="text-xs sm:text-[13px] font-semibold text-gray-700">
                          {row.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    className="relative z-10 mx-1 self-stretch rounded-2xl bg-white flex flex-col"
                    style={{
                      boxShadow:
                        "0 0 0 2px #0565E6, 0 12px 32px rgba(5, 101, 230, 0.14)",
                    }}
                  >
                    <div className="h-[58px] flex items-center justify-center px-3 border-b border-[#E8F1FF] rounded-t-[14px]">
                      <img
                        src={logo}
                        alt="DeviceKart"
                        className="h-8 w-auto object-contain"
                      />
                    </div>
                    {ROWS.map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-center min-h-[52px] px-2 ${
                          i !== ROWS.length - 1 ? "border-b border-gray-100" : ""
                        } ${i === ROWS.length - 1 ? "rounded-b-[14px]" : ""}`}
                      >
                        <CompareValue cell={row.dk} accent />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col">
                    <div className="h-[58px] flex flex-col items-center justify-center text-center px-1">
                      <p className="text-[11px] sm:text-xs font-bold text-gray-700 leading-tight">
                        Other Platforms
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">(Typical)</p>
                    </div>
                    {ROWS.map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-center min-h-[52px] px-1 ${
                          i !== ROWS.length - 1 ? "border-b border-gray-200/80" : ""
                        }`}
                      >
                        <CompareValue cell={row.other} />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col">
                    <div className="h-[58px] flex flex-col items-center justify-center text-center px-1">
                      <p className="text-[11px] sm:text-xs font-bold text-gray-700 leading-tight">
                        Local Buyers
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">(Typical)</p>
                    </div>
                    {ROWS.map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-center min-h-[52px] px-1 ${
                          i !== ROWS.length - 1 ? "border-b border-gray-200/80" : ""
                        }`}
                      >
                        <CompareValue cell={row.local} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom pill */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 rounded-full bg-[#EEF4FF] border border-[#BFDBFE] px-4 sm:px-5 py-2.5 text-[11px] sm:text-xs font-semibold text-[#0565E6]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} strokeWidth={2.4} />
                Transparent Pricing
              </span>
              <span className="text-[#93C5FD]">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={13} strokeWidth={2.8} className="text-[#0565E6]" />
                No Hidden Fees
              </span>
              <span className="text-[#93C5FD]">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={13} strokeWidth={2.8} className="text-[#0565E6]" />
                Maximum Value for Your Device
              </span>
            </div>
          </div>
        </div>

        {/* ── Trusted marketplace ── */}
        <div className="rounded-2xl sm:rounded-[28px] bg-[#F4F7FB] border border-[#E8EEF5] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
          <div className="flex flex-col xl:flex-row xl:items-center gap-8 xl:gap-6">
            {/* Left copy + rating */}
            <div className="xl:w-[34%] shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#E8F1FF] px-3 py-1.5 rounded-md mb-3">
                <Star size={10} fill="currentColor" strokeWidth={0} />
                Trusted By Thousands
              </span>
              <h2 className="text-[1.65rem] sm:text-[1.9rem] font-extrabold text-[#111827] tracking-tight leading-[1.2]">
                India&apos;s Most Trusted Device{" "}
                <span className="text-[#0565E6]">Marketplace</span>
              </h2>
              <p className="text-sm text-[#6B7280] mt-2.5 leading-relaxed max-w-sm">
                Join thousands of happy customers who trust DeviceKart every day.
              </p>

              <div className="mt-5 flex flex-col sm:inline-flex sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 rounded-xl bg-white border border-gray-100 shadow-[0_4px_14px_rgba(15,23,42,0.05)] px-3.5 sm:px-4 py-3 max-w-full">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Star size={18} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
                  <span className="text-xl sm:text-[1.4rem] font-black text-[#111827] leading-none">
                    4.9/5
                  </span>
                </div>
                <span className="hidden sm:block w-px h-9 bg-gray-200 shrink-0" aria-hidden />
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0">
                  <p className="text-[11px] sm:text-xs text-[#6B7280] leading-snug">
                    Based on 25,000+ reviews
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <GoogleMark />
                    <TrustpilotMark />
                    <FacebookMark />
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards — single row on desktop, centered content */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5">
                {STATS.map(({ value, title, sub, Icon, iconWrap }) => (
                  <div
                    key={title}
                    className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_16px_rgba(15,23,42,0.04)] px-3 py-5 flex flex-col items-center text-center"
                  >
                    <span
                      className={`w-11 h-11 rounded-full ${iconWrap} flex items-center justify-center mb-3`}
                    >
                      <Icon size={20} strokeWidth={2.1} />
                    </span>
                    <p className="text-xl font-black text-[#111827] leading-none tracking-tight">
                      {value}
                    </p>
                    <p className="text-[12px] font-bold text-[#1F2937] mt-2 leading-snug">
                      {title}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
