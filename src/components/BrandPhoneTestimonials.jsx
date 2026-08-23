import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Quote, Star } from "lucide-react";
import { getCategoryBrandMeta } from "../data/categoryBrandContent";

/** Same voices as Home — different presentation for the sell-phone brand page. */
const REVIEWS = [
  { name: "Nitin Gowda", text: "Flawless experience. Instant credit. No haggling whatsoever — exactly what I expected.", stars: 5, city: "Bangalore", device: "iPhone 13" },
  { name: "Vidyankit Official", text: "Sold my Realme GT Neo 2. Very smooth process, no negotiation unlike other platforms. Highly recommend!", stars: 5, city: "Hyderabad", device: "Realme GT Neo 2" },
  { name: "Jatin Mishra", text: "Sold my phone, nice company, smooth process. Pickup was on time and payment was instant.", stars: 5, city: "Delhi", device: "Samsung Galaxy" },
  { name: "Disha Doshi", text: "Value for money and service is good. Got the exact price that was shown online.", stars: 5, city: "Mumbai", device: "OnePlus" },
  { name: "Pawan Mishra", text: "Excellent services! The pickup was too good and the security and checking purposes were professional.", stars: 5, city: "Pune", device: "iPhone 12" },
  { name: "Mayank Doshi", text: "Very prompt service and got a very good price. Absolutely hassle-free. Highly recommended!", stars: 5, city: "Ahmedabad", device: "Xiaomi" },
  { name: "Ritu Sharma", text: "Super easy process. Got a great price for my old Samsung. Will definitely use again!", stars: 5, city: "Jaipur", device: "Samsung S21" },
  { name: "Aakash Mehta", text: "Loved the transparent pricing. No last minute deductions. Payment received in under 10 minutes.", stars: 5, city: "Chennai", device: "iPhone 14" },
  { name: "Priya Nair", text: "The pickup agent was very professional and courteous. Got ₹2,000 more than other platforms quoted.", stars: 5, city: "Kochi", device: "Pixel" },
];

const AVATAR = [
  "bg-[#0565E6]",
  "bg-[#16A34A]",
  "bg-[#7C3AED]",
  "bg-[#EA580C]",
  "bg-[#DB2777]",
];

function Stars({ n = 5 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={12} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
      ))}
    </span>
  );
}

/**
 * Brand-page testimonials — same customer voices as Home, spotlight + carousel layout
 * (not the landing vertical marquee columns).
 */
export default function BrandPhoneTestimonials({ category = "mobile" }) {
  const meta = getCategoryBrandMeta(category);
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const featured = REVIEWS[active % REVIEWS.length];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % REVIEWS.length);
    }, 5200);
    return () => clearInterval(timerRef.current);
  }, []);

  const pause = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const resume = () => {
    pause();
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % REVIEWS.length);
    }, 5200);
  };

  const go = (dir) => {
    pause();
    setActive((i) => (i + dir + REVIEWS.length) % REVIEWS.length);
    resume();
  };

  return (
    <section className="relative overflow-hidden bg-[#0B1220] py-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 0%, rgba(5,101,230,0.35), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(124,58,237,0.22), transparent 45%)",
        }}
        aria-hidden
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8 sm:mb-10">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#93C5FD] bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg mb-3">
              <Quote size={12} strokeWidth={2.4} />
              {meta.label} sellers speak
            </span>
            <h2 className="text-2xl sm:text-[2rem] font-extrabold text-white tracking-tight leading-tight">
              Real stories after selling{" "}
              <span className="text-[#60A5FA]">their {meta.nounPlural}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">
              {meta.testimonialHint} — highlighted here for anyone picking a brand to sell.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-3 self-start">
            <div className="flex items-center gap-1.5">
              <Star size={18} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
              <span className="text-xl font-black text-white">4.9/5</span>
            </div>
            <span className="w-px h-8 bg-white/20" aria-hidden />
            <p className="text-xs text-slate-300 leading-snug">
              <span className="font-bold text-white">25,000+</span> verified reviews
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 sm:gap-5"
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {/* Spotlight card */}
          <article className="relative rounded-2xl sm:rounded-[28px] bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden min-h-[280px] flex flex-col">
            <Quote
              size={64}
              className="absolute -right-2 -top-2 text-[#EEF4FF]"
              strokeWidth={1.2}
              aria-hidden
            />
            <div className="relative flex items-center gap-3 mb-5">
              <div
                className={`w-12 h-12 rounded-2xl ${AVATAR[active % AVATAR.length]} text-white flex items-center justify-center text-base font-extrabold shrink-0`}
              >
                {featured.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold text-gray-900 truncate">{featured.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} strokeWidth={2.4} className="text-[#0565E6]" />
                  {featured.city}
                  <span className="text-gray-300">·</span>
                  <span className="font-semibold text-gray-600">Sold {featured.device}</span>
                </p>
              </div>
              <div className="ml-auto">
                <Stars n={featured.stars} />
              </div>
            </div>

            <p className="relative text-[15px] sm:text-lg text-gray-800 font-medium leading-relaxed flex-1">
              “{featured.text}”
            </p>

            <div className="relative mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {REVIEWS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Show review ${i + 1}`}
                    onClick={() => {
                      pause();
                      setActive(i);
                      resume();
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? "w-6 bg-[#0565E6]" : "w-1.5 bg-gray-200 hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:border-[#0565E6] hover:text-[#0565E6] flex items-center justify-center transition-colors"
                  aria-label="Previous review"
                >
                  <ChevronLeft size={16} strokeWidth={2.4} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:border-[#0565E6] hover:text-[#0565E6] flex items-center justify-center transition-colors"
                  aria-label="Next review"
                >
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </article>

          {/* Side stack — peek cards */}
          <div className="flex flex-col gap-3 sm:gap-3.5">
            {REVIEWS.filter((_, i) => i !== active)
              .slice(0, 3)
              .map((r, idx) => {
                const realIndex = REVIEWS.findIndex((x) => x.name === r.name && x.text === r.text);
                return (
                  <button
                    key={`${r.name}-${idx}`}
                    type="button"
                    onClick={() => {
                      pause();
                      setActive(realIndex >= 0 ? realIndex : 0);
                      resume();
                    }}
                    className="text-left rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-sm px-4 py-3.5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full ${AVATAR[realIndex % AVATAR.length]} text-white flex items-center justify-center text-xs font-bold shrink-0`}
                      >
                        {r.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{r.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {r.city} · {r.device}
                        </p>
                      </div>
                      <Stars n={r.stars} />
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed line-clamp-2">
                      “{r.text}”
                    </p>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
