import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import Breadcrumb from '../components/ui/Breadcrumb';
import Loader from '../components/ui/Loader';
import DevicePageSEO from '../components/seo/DevicePageSEO';
import ModelSeoContent from '../components/seo/ModelSeoContent';
import { formatCurrency } from '../utils/formatCurrency';
import PincodeBox from '../components/PincodeBox';
import { getSellCategoryMeta } from '../constants/sellCategories';

export default function SellCategoryVariantPage() {
  const { category, brand, slug } = useParams();
  const meta = getSellCategoryMeta(category);
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isPincodeVerified, setIsPincodeVerified] = useState(false);
  const brandName = brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : '';

  useEffect(() => {
    deviceService
      .getDevice(slug)
      .then((res) => {
        setDevice(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (!meta) return <Navigate to="/" replace />;
  if (loading) return <Loader />;
  if (!device) return <div className="text-center py-20 font-bold text-gray-500">Device not found.</div>;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: meta.plural, href: `${meta.pathPrefix}/brand` },
    { label: brandName, href: `${meta.pathPrefix}/${brand}` },
    { label: device.modelName },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
      <DevicePageSEO
        device={device}
        brand={brand}
        pathPrefix={meta.pathPrefix}
        breadcrumbItems={breadcrumbItems}
        categoryLabel={meta.key}
      />
      <Breadcrumb items={breadcrumbItems} />

      {selectedVariant ? (
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 lg:p-12 shadow-sm max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center mt-8 relative overflow-hidden">
          <button
            type="button"
            onClick={() => setSelectedVariant(null)}
            className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
            <div className="h-64 sm:h-80 w-full flex items-center justify-center mb-8">
              <img
                src={
                  device.imageUrl ||
                  'https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg'
                }
                alt={device.modelName}
                className="max-h-full object-contain"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#111827] max-w-sm leading-snug">
              Convert your old {device.modelName} into instant cash — only with DeviceKart.
            </h3>
          </div>

          <div className="flex-1 w-full pt-4">
            <h1 className="text-3xl sm:text-4xl font-black text-[#111827] mb-3">{device.modelName}</h1>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-sm font-bold text-gray-500">Selected variant:</span>
              <span className="bg-[#0565E6] text-white px-4 py-1.5 rounded-lg text-sm font-black tracking-wide shadow-sm">
                {selectedVariant.storage}
              </span>
            </div>

            <div className="bg-[#E8F1FF] rounded-[24px] p-6 sm:p-8 mb-6 flex justify-between items-center border border-[#BDDBFF]">
              <div>
                <p className="text-sm font-black text-[#0565E6] opacity-80 mb-1">Get Upto</p>
                <p className="text-4xl sm:text-5xl font-black text-[#0565E6]">
                  {formatCurrency(selectedVariant.basePrice)}
                </p>
              </div>
            </div>

            <PincodeBox onVerified={setIsPincodeVerified} />

            <button
              type="button"
              onClick={() =>
                navigate(
                  `${meta.pathPrefix}/${brand}/${slug}/quiz?storage=${encodeURIComponent(selectedVariant.storage)}`,
                )
              }
              disabled={!isPincodeVerified}
              className={`w-full text-white font-black py-4 sm:py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-lg group
                ${isPincodeVerified ? 'bg-[#0565E6] shadow-blue-100 hover:bg-[#044ab8] hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed opacity-60'}`}
            >
              Start Selling
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 mt-8">
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 text-center sticky top-10 shadow-sm">
              <div className="bg-gray-50 rounded-2xl h-64 flex items-center justify-center mb-6 p-4">
                <img
                  src={
                    device.imageUrl ||
                    'https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg'
                  }
                  alt={device.modelName}
                  className="max-h-full object-contain"
                />
              </div>
              <h1 className="text-2xl font-black text-[#111827] mb-2">{device.modelName}</h1>
              <p className="text-sm font-bold text-gray-400">Sell your old {device.modelName} for the best price</p>
            </div>
          </div>

          <div className="flex-1 space-y-10">
            <div>
              <h2 className="text-3xl font-black text-[#111827] mb-2">Select Variant</h2>
              <p className="text-sm font-bold text-gray-400">
                Please select the variant or capacity of your device.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(device.variants || []).map((variant) => (
                <button
                  key={variant.storage}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  className="group bg-white rounded-3xl border-2 border-gray-100 p-6 flex items-center justify-between hover:border-[#0565E6] hover:bg-[#E8F1FF] transition-all text-left shadow-sm hover:shadow-md"
                >
                  <div>
                    <p className="text-xl font-black text-[#111827] group-hover:text-[#0565E6]">
                      {variant.storage}
                    </p>
                    <p className="text-sm font-bold text-gray-400">
                      Get upto {formatCurrency(variant.basePrice)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0565E6] group-hover:text-white transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <ModelSeoContent device={device} brandName={brandName} />
    </div>
  );
}
