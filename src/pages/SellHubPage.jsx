import { useEffect, useState } from "react";
import { Tag, ArrowRight } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import Breadcrumb from "../components/ui/Breadcrumb";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import SelectionCard from "../components/layout/SelectionCard";
import {
  fetchWebsiteCategories,
  sellCategories,
  FALLBACK_WEBSITE_CATEGORIES,
} from "../utils/websiteCategories";
import { sellCategoryImage, SELL_CATEGORY_DESCS } from "../config/categoryImages";

export default function SellHubPage() {
  const [categories, setCategories] = useState(() =>
    sellCategories(FALLBACK_WEBSITE_CATEGORIES),
  );

  useEffect(() => {
    fetchWebsiteCategories().then((list) => setCategories(sellCategories(list)));
  }, []);

  return (
    <PageCanvas>
      <SEOHead
        title="Sell Old Devices for Instant Cash"
        description="Choose your device category and get an instant buyback quote on DeviceKart. Free doorstep pickup across 2,000+ cities in India."
        path="/sell"
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Sell Device" }]} />

      <PageShell
        eyebrow="Sell For Cash"
        eyebrowIcon={Tag}
        title="Choose Your"
        titleAccent="Device Category"
        subtitle="Select a category to get an instant quote. Free pickup and instant payment after verification."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((cat) => (
            <SelectionCard
              key={cat.key}
              to={cat.sellPath || "/sell-old-mobile-phones/brand"}
              image={sellCategoryImage(cat.key)}
              imageAlt={cat.label}
              title={`Sell ${cat.label}`}
              subtitle={
                SELL_CATEGORY_DESCS[cat.key] ||
                `Sell your ${cat.label.toLowerCase()} for instant cash`
              }
              footer={
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                  Get Quote
                  <ArrowRight size={12} strokeWidth={2.5} />
                </span>
              }
            />
          ))}
        </div>
      </PageShell>

      <TrustPills />
    </PageCanvas>
  );
}
