import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  getCategoryBrandFaqs,
  getCategoryBrandMeta,
} from "../data/categoryBrandContent";

/**
 * Category FAQs for sell brand pages — numbered accordion.
 */
export default function BrandMobileFaqs({ category = "mobile" }) {
  const [open, setOpen] = useState(0);
  const faqs = getCategoryBrandFaqs(category);
  const meta = getCategoryBrandMeta(category);

  return (
    <section className="bg-white py-10 sm:py-14 border-t border-[#E8EEF5]">
      <div className="max-w-[860px] mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-9">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {meta.faqTitle}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-2xl leading-relaxed">
            {meta.faqSubtitle}
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-[#F8FAFD] border-[#0565E6]/30 shadow-[0_8px_24px_rgba(5,101,230,0.06)]"
                    : "bg-white border-[#E8EEF5] hover:border-[#0565E6]/22"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-start gap-3 sm:gap-4 text-left px-4 sm:px-5 py-4"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 ${
                      isOpen
                        ? "bg-[#0565E6] text-white"
                        : "bg-[#EEF4FF] text-[#0565E6]"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 min-w-0 text-sm sm:text-[15px] font-bold text-gray-900 leading-snug pt-1">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    strokeWidth={2.4}
                    className={`shrink-0 text-gray-400 mt-1 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#0565E6]" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 sm:px-5 pb-4 pl-[3.25rem] sm:pl-[4.25rem] text-sm text-gray-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center sm:justify-start">
          <Link
            to="/faq"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0565E6] no-underline hover:underline"
          >
            View all FAQs
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
