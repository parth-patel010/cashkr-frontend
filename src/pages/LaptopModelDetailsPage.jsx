import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import Loader from '../components/ui/Loader';
import DevicePageSEO from '../components/seo/DevicePageSEO';
import ModelSeoContent from '../components/seo/ModelSeoContent';
import { formatCurrency } from '../utils/formatCurrency';
import LaptopSpecModal from '../components/LaptopSpecModal';
import PincodeBox from '../components/PincodeBox';

export default function LaptopModelDetailsPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPincodeVerified, setIsPincodeVerified] = useState(false);

  useEffect(() => {
    deviceService.getDevice(slug).then(res => {
      setDevice(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader />;
  if (!device) return <div className="text-center py-20 font-black text-gray-400">Device not found</div>;

  const maxPrice = Math.max(...device.variants.map(v => v.basePrice));

  const handleStartSelling = () => {
    setIsModalOpen(true);
  };

  const handleSpecsComplete = (specs) => {
    navigate(`/sell-old-laptops/${device.brand}/${device.slug}/quiz`, {
      state: { specs }
    });
  };

  const brandSlug = brand || device.brand?.toLowerCase();
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Laptops', href: '/sell-old-laptops/brand' },
    { label: device.brand, href: `/sell-old-laptops/${brandSlug}` },
    { label: device.modelName },
  ];

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <DevicePageSEO
        device={device}
        brand={brandSlug}
        pathPrefix="/sell-old-laptops"
        breadcrumbItems={breadcrumbItems}
        categoryLabel="laptop"
      />
      <div className="mb-10">
        <h1 className="text-xl sm:text-2xl font-black text-[#111827] mb-2 tracking-tight">Sell Your {device.modelName} Laptop</h1>
        <p className="text-[13px] text-gray-500 font-bold max-w-2xl leading-relaxed opacity-80">
          DeviceKart helps you sell your used {device.modelName} Laptop online with instant price checks, free doorstep pickup, and secure payment after verification.
        </p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-6 sm:p-12 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-10 sm:gap-16">
          {/* Image */}
          <div className="w-full md:w-5/12 flex justify-center">
            <div className="relative group w-full max-w-[280px]">
              <div className="absolute -inset-4 bg-gray-50 rounded-[32px] -z-10 transition-transform group-hover:scale-105 duration-500" />
              {device.imageUrl ? (
                <img src={device.imageUrl} alt={device.modelName} className="w-full h-auto object-contain drop-shadow-xl" />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No Image Available</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="w-full md:w-7/12 space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111827] mb-4 tracking-tight leading-tight">{device.modelName}</h2>
              <div className="flex items-center gap-2 text-[#0565E6] font-black text-xs">
                <div className="bg-[#DCFCE7] p-1.5 rounded-lg shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                2,000+ Devices Sold Successfully
              </div>
            </div>

            <div className="bg-[#E8F1FF] rounded-[32px] p-8 border border-[#0565E6]/10 shadow-inner">
              <p className="text-[#0565E6] text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Get Upto Offer</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl sm:text-4xl font-black text-[#166534] tracking-tighter">
                  {formatCurrency(maxPrice)}
                </p>
                <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0565E6" strokeWidth="4"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                </div>
              </div>
            </div>

            <PincodeBox onVerified={setIsPincodeVerified} />

            <button 
              onClick={handleStartSelling}
              disabled={!isPincodeVerified}
              className={`group w-full font-black py-5 rounded-[24px] transition-all text-base flex items-center justify-center gap-3 active:scale-95
                ${isPincodeVerified ? 'bg-[#0565E6] text-white hover:bg-[#044BA8] shadow-xl shadow-blue-100' : 'bg-gray-300 text-white cursor-not-allowed opacity-60'}`}
            >
              Start Selling
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        {/* Bottom review */}
        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col lg:flex-row items-center gap-6 text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start gap-1">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
            </div>
            <p className="text-xs font-black text-[#111827]">
              4.8 <span className="text-gray-300 ml-1 font-bold">(200+ Reviews)</span>
            </p>
          </div>
          <div className="hidden lg:block w-px h-10 bg-gray-100 mx-2" />
          <p className="text-base font-black text-[#111827] leading-snug flex-1 max-w-sm">
            Convert your old {device.modelName} into <span className="text-[#0565E6]">instant cash</span> — only with DeviceKart.
          </p>
        </div>
      </div>

      <LaptopSpecModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        device={device}
        onComplete={handleSpecsComplete}
      />
      <ModelSeoContent device={device} brandName={device.brand} />
    </div>
  );
}
