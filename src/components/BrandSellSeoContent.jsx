import { getCategorySeoContent } from "../data/categoryBrandContent";
import ProgressiveImage from "./ui/ProgressiveImage";

/**
 * Closing editorial block for sell brand pages —
 * shared poster + category-specific long-form copy.
 */
export default function BrandSellSeoContent({ category = "mobile" }) {
  const { sections, trustPoints, closing } = getCategorySeoContent(category);

  return (
    <section className="bg-white border-t border-[#E8EEF5]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6">
        <ProgressiveImage
          src="/Branding_poster_1.png"
          alt="Download the DeviceKart app — sell, buy and repair old devices with free pickup and instant payment"
          className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-[#E8EEF5]"
          wrapperClassName="w-full min-h-[12rem] sm:min-h-[16rem]"
          skeletonClassName="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#EEF4FF] via-[#F4F7FB] to-[#E8EEF5]"
          priority={false}
        />
      </div>

      <div className="max-w-[860px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-12 sm:pb-16">
        <article className="space-y-8 sm:space-y-9 text-[15px] sm:text-base text-gray-600 leading-relaxed">
          {sections.map(({ h2, p }) => (
            <div key={h2}>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-3">
                {h2}
              </h2>
              <p>{p}</p>
            </div>
          ))}

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-4">
              Why People Choose DeviceKart
            </h2>
            <ol className="space-y-2.5 list-none m-0 p-0">
              {trustPoints.map((item, i) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-[#EEF4FF] text-[#0565E6] text-xs font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="pt-1">{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5">{closing}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
