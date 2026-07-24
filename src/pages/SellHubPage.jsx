import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag, ArrowRight, Zap, Truck, ShieldCheck } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import Breadcrumb from "../components/ui/Breadcrumb";
import {
  fetchWebsiteCategories,
  sellCategories,
  FALLBACK_WEBSITE_CATEGORIES,
} from "../utils/websiteCategories";
import { sellCategoryImage, SELL_CATEGORY_DESCS } from "../config/categoryImages";

const TRUST = [
  { Icon: Zap, label: "Instant Quote", color: "bg-[#EDE9FE] text-[#7C3AED]" },
  { Icon: Truck, label: "Free Pickup", color: "bg-[#DCFCE7] text-[#16A34A]" },
  { Icon: ShieldCheck, label: "Secure Payment", color: "bg-[#DBE8FF] text-[#0565E6]" },
];

export default function SellHubPage() {
  const [categories, setCategories] = useState(() =>
    sellCategories(FALLBACK_WEBSITE_CATEGORIES),
  );

  useEffect(() => {
    fetchWebsiteCategories().then((list) => setCategories(sellCategories(list)));
  }, []);

  return (
    <div className="w-full bg-[#F7F9FC] min-h-[70vh]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-12 sm:pb-16">
        <SEOHead
          title="Sell Old Devices for Instant Cash"
          description="Choose your device category and get an instant buyback quote on DeviceKart. Free doorstep pickup across 2,000+ cities in India."
          path="/sell"
        />
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Sell Device" }]} />

        <div className="rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden mt-4">
          <div className="px-5 sm:px-8 pt-7 sm:pt-9 pb-6 text-center border-b border-[#E8EEF5] bg-[#F4F7FB]">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#16A34A] bg-[#DCFCE7] border border-[#86EFAC]/40 px-3 py-1.5 rounded-full mb-3">
              <Tag size={12} strokeWidth={2.5} />
              Sell For Cash
            </span>
            <h1 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              Choose Your <span className="text-[#0565E6]">Device Category</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2.5 max-w-xl mx-auto leading-relaxed">
              Select a category to get an instant quote. Free pickup and instant payment after verification.
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.key}
                  to={cat.sellPath || "/sell-old-mobile-phones/brand"}
                  className="group flex flex-col bg-[#F7F9FC] rounded-2xl border border-[#E8EEF5] p-4 sm:p-5 no-underline transition-all duration-200 hover:border-[#0565E6]/40 hover:bg-white hover:shadow-[0_10px_28px_rgba(5,101,230,0.1)] hover:-translate-y-0.5"
                >
                  <div className="h-[100px] sm:h-[120px] flex items-center justify-center mb-3 rounded-xl bg-white border border-gray-100">
                    <img
                      src={sellCategoryImage(cat.key)}
                      alt={cat.label}
                      className="max-h-[88px] sm:max-h-[100px] max-w-[90%] object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-[#0565E6] transition-colors">
                    Sell {cat.label}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2 flex-1">
                    {SELL_CATEGORY_DESCS[cat.key] || `Sell your ${cat.label.toLowerCase()} for instant cash`}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0565E6]">
                    Get Quote
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
          {TRUST.map(({ Icon, label, color }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3.5 py-2 shadow-sm"
            >
              <span className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
                <Icon size={14} strokeWidth={2.2} />
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
