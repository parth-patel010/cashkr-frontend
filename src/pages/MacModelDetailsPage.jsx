import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { deviceService } from "../services/device.service";
import Breadcrumb from "../components/ui/Breadcrumb";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import PageCanvas from "../components/layout/PageCanvas";
import TrustPills from "../components/layout/TrustPills";
import DevicePageSEO from "../components/seo/DevicePageSEO";
import ModelSeoContent from "../components/seo/ModelSeoContent";
import { formatCurrency } from "../utils/formatCurrency";
import LaptopSpecModal from "../components/LaptopSpecModal";
import PincodeBox from "../components/PincodeBox";

export default function MacModelDetailsPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPincodeVerified, setIsPincodeVerified] = useState(false);

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
        <div className="text-center py-20 font-bold text-gray-500">Device not found</div>
      </PageCanvas>
    );
  }

  const maxPrice = Math.max(...device.variants.map((v) => v.basePrice));

  const handleStartSelling = () => {
    try {
      sessionStorage.removeItem(`devicekart_mac_quiz_${device.slug}`);
    } catch {
      /* ignore */
    }
    setIsModalOpen(true);
  };

  const handleSpecsComplete = (specs) => {
    try {
      sessionStorage.removeItem(`devicekart_mac_quiz_${device.slug}`);
    } catch {
      /* ignore */
    }
    setIsModalOpen(false);
    navigate(`/sell-imac/${brand}/${device.slug}/quiz`, {
      state: { specs, freshStart: true, startedAt: Date.now() },
    });
  };

  const brandSlug = brand || device.brand?.toLowerCase();
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "iMac & Mac", href: "/sell-imac/brand" },
    { label: device.brand, href: `/sell-imac/${brandSlug}` },
    { label: device.modelName },
  ];

  return (
    <PageCanvas>
      <DevicePageSEO
        device={device}
        brand={brandSlug}
        pathPrefix="/sell-imac"
        breadcrumbItems={breadcrumbItems}
        categoryLabel="Mac"
      />
      <Breadcrumb items={breadcrumbItems} />

      <div className="rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden mt-4">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 p-5 sm:p-8 lg:p-10">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="h-56 sm:h-72 w-full flex items-center justify-center mb-6 rounded-2xl bg-[#F7F9FC] border border-[#E8EEF5]">
              {device.imageUrl ? (
                <img
                  src={device.imageUrl}
                  alt={device.modelName}
                  className="max-h-[90%] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1.5"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    No Image Available
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
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

            <div className="bg-primary-light rounded-2xl p-5 sm:p-6 mb-5 flex justify-between items-center border border-border-light">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                  Get Upto
                </p>
                <p className="text-3xl sm:text-4xl font-extrabold text-primary">
                  {formatCurrency(maxPrice)}
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
              onClick={handleStartSelling}
            >
              Start Selling
              <ArrowRight size={18} strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>

      <TrustPills />

      <LaptopSpecModal
        key={`mac-spec-${device.slug}-${isModalOpen ? "open" : "closed"}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        device={device}
        onComplete={handleSpecsComplete}
      />
      <ModelSeoContent device={device} brandName={device.brand} />
    </PageCanvas>
  );
}
