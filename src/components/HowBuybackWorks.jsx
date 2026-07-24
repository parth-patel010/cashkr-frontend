import { Zap, Award, Truck, ShieldCheck, Headphones, ChevronRight } from "lucide-react";

const ASSETS = {
  quote: "/landing_page_assets/how-it-work-phone-card1.png",
  schedule: "/landing_page_assets/how-it-work-calender-card2.png",
  inspection: "/landing_page_assets/delivery-person.png",
  offer: "/landing_page_assets/how-it-work-pricing-accept.png",
  wipe: "/landing_page_assets/how-it-work-5th.png",
  payment: "/landing_page_assets/how-it-wor-final.png",
};

const STEPS = [
  {
    num: "01",
    title: "Get Instant Quote",
    desc: "Search your device and answer a few simple questions to get the best instant price.",
    image: ASSETS.quote,
  },
  {
    num: "02",
    title: "Schedule Pickup",
    desc: "Choose a convenient date and time. We'll come to your doorstep and pickup your device for free.",
    image: ASSETS.schedule,
  },
  {
    num: "03",
    title: "Device Inspection",
    desc: "Our experts will inspect your device on the spot and verify its condition.",
    image: ASSETS.inspection,
  },
  {
    num: "04",
    title: "Get Best Offer",
    desc: "Get the final best price based on inspection. Accept the offer and proceed.",
    image: ASSETS.offer,
  },
  {
    num: "05",
    title: "Secure Data Wipe",
    desc: "Your data is 100% securely wiped to protect your privacy and personal information.",
    image: ASSETS.wipe,
  },
  {
    num: "06",
    title: "Instant Payment",
    desc: "Receive instant payment in your bank account via UPI / Bank Transfer / Cash.",
    image: ASSETS.payment,
  },
];

const HIGHLIGHTS = [
  {
    title: "Best Price Guaranteed",
    desc: "Get maximum value for your device",
    Icon: Award,
    color: "bg-[#DBE8FF] text-[#0565E6]",
  },
  {
    title: "Free Doorstep Pickup",
    desc: "We come to you at zero cost",
    Icon: Truck,
    color: "bg-[#DCFCE7] text-[#16A34A]",
  },
  {
    title: "Instant Payment",
    desc: "Get paid immediately after verification",
    Icon: Zap,
    color: "bg-[#EDE9FE] text-[#7C3AED]",
  },
  {
    title: "100% Safe & Secure",
    desc: "Data wiped & secure handling",
    Icon: ShieldCheck,
    color: "bg-[#FFEDD5] text-[#EA580C]",
  },
  {
    title: "24x7 Customer Support",
    desc: "We're always here to help you",
    Icon: Headphones,
    color: "bg-[#FCE7F3] text-[#DB2777]",
  },
];

function StepCard({ step }) {
  return (
    <div className="relative flex flex-col items-center text-center pt-5 h-full">
      {/* Number badge sitting on top border */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-9 h-9 rounded-full bg-[#0565E6] text-white text-[13px] font-black flex items-center justify-center shadow-md shadow-[#0565E6]/25">
        {step.num}
      </div>

      {/* Card with top-border gap under the badge */}
      <div className="relative w-full flex-1 rounded-2xl bg-white pt-7 pb-4 px-3 flex flex-col items-center">
        {/* Border drawn with 3 sides + split top */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border border-gray-200"
          aria-hidden
        />
        {/* White mask that breaks the top border under the badge */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-px w-11 h-2 bg-white z-10"
          aria-hidden
        />

        <div className="relative z-[1] w-full h-[120px] sm:h-[128px] flex items-center justify-center mb-3">
          <img
            src={step.image}
            alt={step.title}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>

      <h3 className="mt-3.5 text-[13px] sm:text-sm font-bold text-gray-900 leading-snug px-1">
        {step.title}
      </h3>
      <p className="mt-1.5 text-[11px] sm:text-xs text-gray-500 leading-relaxed px-0.5 max-w-[180px]">
        {step.desc}
      </p>
    </div>
  );
}

export default function HowBuybackWorks() {
  return (
    <section id="how-it-works" className="bg-white py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#0565E6] bg-[#EEF4FF] border border-[#0565E6]/15 px-3.5 py-1.5 rounded-full mb-4">
            <Zap size={12} strokeWidth={2.5} fill="currentColor" />
            Simple. Fast. Secure.
          </span>
          <h2 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
            How <span className="text-[#0565E6]">DeviceKart</span> Buyback Works
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-xl mx-auto leading-relaxed">
            Selling your old device is simple, secure and rewarding. Follow these easy steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-3 gap-y-10">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <StepCard step={step} />

                {/* Dashed connector arrow between steps (desktop 6-col) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden xl:flex absolute top-[72px] -right-[14px] w-7 items-center text-[#0565E6] z-30"
                    aria-hidden
                  >
                    <span className="flex-1 border-t border-dashed border-[#0565E6]/55" />
                    <ChevronRight size={14} strokeWidth={2.6} className="-ml-1 shrink-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom highlights */}
        <div className="mt-10 sm:mt-12 rounded-2xl sm:rounded-3xl bg-[#F4F7FB] border border-[#E8EEF5] px-5 py-6 sm:px-7 sm:py-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-4">
            {HIGHLIGHTS.map(({ title, desc, Icon, color }) => (
              <div key={title} className="flex items-start gap-3">
                <span
                  className={`w-10 h-10 rounded-full ${color} flex items-center justify-center shrink-0`}
                >
                  <Icon size={18} strokeWidth={2.1} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-bold text-gray-900 leading-snug">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
