import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Info, TrendingUp, X } from "lucide-react";
import { deviceService } from "../services/device.service";
import Breadcrumb from "../components/ui/Breadcrumb";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import PageCanvas from "../components/layout/PageCanvas";
import PageShell from "../components/layout/PageShell";
import TrustPills from "../components/layout/TrustPills";
import DevicePageSEO from "../components/seo/DevicePageSEO";
import ModelSeoContent from "../components/seo/ModelSeoContent";
import { formatCurrency } from "../utils/formatCurrency";
import PincodeBox from "../components/PincodeBox";

export default function VariantSelectionPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isPincodeVerified, setIsPincodeVerified] = useState(false);
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);

  useEffect(() => {
    deviceService
      .getDevice(slug)
      .then((res) => {
        setDevice(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader />;
  if (!device) {
    return (
      <PageCanvas>
        <div className="text-center py-20 font-bold text-gray-500">Device not found.</div>
      </PageCanvas>
    );
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Mobile Phones", href: "/sell-old-mobile-phones/brand" },
    { label: brandName, href: `/sell-old-mobile-phones/${brand}` },
    { label: device.modelName },
  ];

  return (
    <PageCanvas>
      <DevicePageSEO
        device={device}
        brand={brand}
        pathPrefix="/sell-old-mobile-phones"
        breadcrumbItems={breadcrumbItems}
        categoryLabel="mobile phone"
      />
      <Breadcrumb items={breadcrumbItems} />

      {selectedVariant ? (
        <div className="rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden mt-4 relative">
          <button
            type="button"
            onClick={() => setSelectedVariant(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#F4F7FB] border border-[#E8EEF5] flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12 p-5 sm:p-8 lg:p-10">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="h-56 sm:h-72 w-full flex items-center justify-center mb-6 rounded-2xl bg-[#F7F9FC] border border-[#E8EEF5]">
                <img
                  src={
                    device.imageUrl ||
                    "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"
                  }
                  alt={device.modelName}
                  className="max-h-[90%] object-contain"
                />
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
                <span className="text-gray-900 font-bold ml-2 text-sm">
                  4.8 <span className="text-gray-400 font-medium">(200+ Reviews)</span>
                </span>
              </div>
              <p className="text-lg sm:text-xl font-extrabold text-gray-900 max-w-sm leading-snug">
                Convert your old {device.modelName} into instant cash — only with DeviceKart.
              </p>
            </div>

            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                {device.modelName}
              </h1>
              <p className="text-sm font-semibold text-gray-500 mb-5">
                2,000+ Devices Sold Successfully
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm font-semibold text-gray-500">Selected variant:</span>
                <span className="bg-primary text-white px-3.5 py-1.5 rounded-lg text-sm font-bold">
                  {selectedVariant.storage}
                </span>
              </div>

              <div className="bg-primary-light rounded-2xl p-5 sm:p-6 mb-5 flex justify-between items-center border border-border-light">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    Get Upto
                  </p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary">
                    {formatCurrency(selectedVariant.basePrice)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-border-light">
                  <TrendingUp size={22} strokeWidth={2.5} />
                </div>
              </div>

              <PincodeBox onVerified={setIsPincodeVerified} />

              <Button
                size="lg"
                className="w-full mt-4"
                disabled={!isPincodeVerified}
                onClick={() =>
                  navigate(
                    `/sell-old-mobile-phones/${brand}/${slug}/quiz?storage=${selectedVariant.storage}`,
                  )
                }
              >
                Start Selling
                <ArrowRight size={18} strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <PageShell
          eyebrow="Select Variant"
          eyebrowTone="blue"
          title={device.modelName}
          titleAccent="Storage"
          subtitle="Please select the storage capacity of your device."
          headerAlign="left"
        >
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <div className="lg:w-[320px] shrink-0">
              <div className="rounded-2xl bg-[#F7F9FC] border border-[#E8EEF5] p-6 text-center sticky top-24">
                <div className="h-52 flex items-center justify-center mb-4 rounded-xl bg-white border border-gray-100">
                  <img
                    src={
                      device.imageUrl ||
                      "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"
                    }
                    alt={device.modelName}
                    className="max-h-full object-contain"
                  />
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 mb-1">{device.modelName}</h2>
                <p className="text-xs font-semibold text-gray-400">
                  Sell for the best price
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {device.variants.map((variant) => (
                  <button
                    key={variant.storage}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className="group bg-[#F7F9FC] rounded-2xl border border-[#E8EEF5] p-5 flex items-center justify-between hover:border-primary/50 hover:bg-white hover:shadow-[0_10px_28px_rgba(5,101,230,0.1)] transition-all text-left"
                  >
                    <div>
                      <p className="text-lg font-extrabold text-gray-900 group-hover:text-primary">
                        {variant.storage}
                      </p>
                      <p className="text-sm font-semibold text-gray-500 mt-0.5">
                        Get upto {formatCurrency(variant.basePrice)}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white border border-[#E8EEF5] flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                      <ArrowRight size={18} strokeWidth={2.5} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 border border-amber-100 shrink-0">
                    <Info size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-1">
                      Not sure about the storage?
                    </p>
                    <p className="text-xs font-medium text-amber-700 leading-relaxed">
                      Check Settings &gt; General &gt; iPhone Storage (iPhone) or Settings &gt;
                      Storage (Android).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageShell>
      )}

      <TrustPills />
      <ModelSeoContent device={device} brandName={brandName} />
    </PageCanvas>
  );
}
