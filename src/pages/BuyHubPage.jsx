import { useEffect, useState } from "react";
import { ShoppingBag, ArrowRight, BadgeCheck, ShieldCheck, RefreshCw } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import Breadcrumb from "../components/ui/Breadcrumb";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import SelectionCard from "../components/layout/SelectionCard";
import {
  fetchWebsiteCategories,
  buyCategories,
  FALLBACK_WEBSITE_CATEGORIES,
} from "../utils/websiteCategories";
import { buyCategoryImage, BUY_CATEGORY_DESCS } from "../config/categoryImages";

const BUY_TRUST = [
  { Icon: BadgeCheck, label: "Quality Checked", color: "bg-primary-light text-primary" },
  { Icon: ShieldCheck, label: "Warranty Included", color: "bg-[#DCFCE7] text-[#16A34A]" },
  { Icon: RefreshCw, label: "Easy Returns", color: "bg-[#EDE9FE] text-[#7C3AED]" },
];

export default function BuyHubPage() {
  const [categories, setCategories] = useState(() =>
    buyCategories(FALLBACK_WEBSITE_CATEGORIES),
  );

  useEffect(() => {
    fetchWebsiteCategories().then((list) => setCategories(buyCategories(list)));
  }, []);

  return (
    <PageCanvas>
      <SEOHead
        title="Buy Refurbished Devices Online"
        description="Buy certified refurbished phones, laptops, tablets, TVs, earbuds and more from DeviceKart with warranty and best prices across India."
        path="/buy"
      />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Buy" }]} />

      <PageShell
        eyebrow="Buy Refurbished"
        eyebrowIcon={ShoppingBag}
        eyebrowTone="blue"
        title="Choose a"
        titleAccent="Category"
        subtitle="Browse certified refurbished devices with warranty. Pick a category to get started."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((cat) => (
            <SelectionCard
              key={cat.key}
              to={cat.buyPath || `/buy/${cat.key}/brand`}
              image={buyCategoryImage(cat.key)}
              imageAlt={cat.label}
              title={cat.label}
              subtitle={
                BUY_CATEGORY_DESCS[cat.key] ||
                `Browse refurbished ${cat.label.toLowerCase()} devices`
              }
              footer={
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                  Browse {cat.label}
                  <ArrowRight size={12} strokeWidth={2.5} />
                </span>
              }
            />
          ))}
        </div>
      </PageShell>

      <TrustPills items={BUY_TRUST} />
    </PageCanvas>
  );
}
