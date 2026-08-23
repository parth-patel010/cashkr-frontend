import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flame, TrendingUp } from "lucide-react";
import { deviceService } from "../services/device.service";
import { formatCurrency } from "../utils/formatCurrency";

/**
 * Top phones by completed sell leads — unique card-rail layout (not a Cashify clone).
 */
export default function TopSellingMobiles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    deviceService
      .getTopSellingMobiles(5)
      .then((res) => {
        setItems(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12 sm:py-14 border-t border-[#E8EEF5]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[88px] rounded-2xl bg-gray-50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 border-t border-[#E8EEF5]">
      <div
        className="pointer-events-none absolute -right-16 top-8 w-64 h-64 rounded-full bg-[#0565E6]/[0.06] blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7 sm:mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#EA580C] bg-[#FFF7ED] border border-orange-200/80 px-3 py-1.5 rounded-lg mb-3">
              <Flame size={12} strokeWidth={2.4} />
              From completed sell leads
            </span>
            <h2 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              Top selling <span className="text-[#0565E6]">mobile phones</span>
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-lg leading-relaxed">
              Ranked by real completed DeviceKart sell orders — what customers are cashing out most.
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0565E6] bg-[#EEF4FF] px-3 py-2 rounded-full self-start sm:self-auto">
            <TrendingUp size={13} strokeWidth={2.4} />
            Live buyback demand
          </p>
        </div>

        <ol className="space-y-3">
          {items.map((phone, index) => {
            const rank = index + 1;
            const specParts = [phone.ram, phone.storage].filter(Boolean);
            const spec =
              specParts.length > 0
                ? specParts
                    .map((p) => String(p).replace(/\s+/g, " ").trim())
                    .join(" / ")
                : null;
            const title = [phone.brand, phone.modelName].filter(Boolean).join(" ");

            return (
              <li key={phone.slug || `${title}-${rank}`}>
                <Link
                  to={phone.sellPath || `/sell-old-mobile-phones/${String(phone.brand || "").toLowerCase()}/${phone.slug}`}
                  className="group flex items-center gap-3 sm:gap-5 rounded-2xl border border-[#E8EEF5] bg-[#F8FBFF] hover:bg-white hover:border-[#0565E6]/35 hover:shadow-[0_12px_32px_rgba(5,101,230,0.1)] no-underline transition-all duration-200 px-3 sm:px-4 py-3 sm:py-3.5"
                >
                  <span
                    className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-sm font-black ${
                      rank === 1
                        ? "bg-[#0565E6] text-white shadow-md shadow-[#0565E6]/30"
                        : "bg-white text-gray-500 border border-gray-200"
                    }`}
                  >
                    {String(rank).padStart(2, "0")}
                  </span>

                  <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                    {phone.imageUrl ? (
                      <img
                        src={phone.imageUrl}
                        alt={title}
                        className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-300">N/A</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-extrabold text-gray-900 truncate group-hover:text-[#0565E6] transition-colors">
                      {title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {spec && (
                        <span className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-100 rounded-md px-2 py-0.5">
                          {spec}
                        </span>
                      )}
                      {phone.sellCount > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">
                          {phone.sellCount} completed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right hidden xs:block sm:block">
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Get up to
                    </p>
                    <p className="text-base sm:text-lg font-black text-[#0565E6] tabular-nums leading-tight">
                      {formatCurrency(phone.maxPrice)}
                    </p>
                  </div>

                  <span className="shrink-0 inline-flex items-center gap-1 h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-[#0565E6] group-hover:bg-[#0450C5] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors">
                    Sell Now
                    <ArrowUpRight size={14} strokeWidth={2.6} className="opacity-90" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
