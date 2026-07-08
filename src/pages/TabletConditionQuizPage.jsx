import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import { useQuote } from '../hooks/useQuote';
import { useAuth } from '../hooks/useAuth';
import { calculatePrice } from '../utils/priceCalculator';
import { formatCurrency } from '../utils/formatCurrency';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';

// --- Icons & Assets (Matching Screenshots) ---
const IconTrend = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);

const STEPS = [
  { id: 'warranty', label: 'Age & Warranty' },
  { id: 'screen', label: 'General & Screen' },
  { id: 'physical', label: 'Physical Issues' },
  { id: 'technical', label: 'Technical Issues' },
  { id: 'accessories', label: 'Accessories' }
];

const AGE_OPTIONS = [
  '0 - 3 Months', '3 - 6 Months', '6 - 11 Months', 'Above 11 Months'
];

const supportsESIM = (modelName) => {
  return false; // Tablets seeded do not need eSIM checks for simplicity
};

export default function TabletConditionQuizPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storage = searchParams.get('storage');
  const { updateQuote } = useQuote();
  const { isAuthenticated, user } = useAuth();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  // Selections
  const [deviceAge, setDeviceAge] = useState('3 - 6 Months');
  const [underWarranty, setUnderWarranty] = useState(null);
  const [eSIMSupport, seteSIMSupport] = useState('physical+esim');

  const [ableToMakeCalls, setAbleToMakeCalls] = useState(null);
  const [isTouchScreenWorking, setIsTouchScreenWorking] = useState(null);
  const [isScreenOriginal, setIsScreenOriginal] = useState(null);

  const [physicalIssues, setPhysicalIssues] = useState([]);
  const [technicalIssues, setTechnicalIssues] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);

  const [showResult, setShowResult] = useState(false);
  const [priceAnimating, setPriceAnimating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    deviceService.getDevice(slug).then(res => {
      const dev = res.data;
      setDevice(dev);
      setLoading(false);
      const selectedVariant = dev.variants.find(v => v.storage === storage) || dev.variants[0];
      setCurrentPrice(selectedVariant.basePrice);
    }).catch(() => setLoading(false));
  }, [slug, storage]);

  // Auto-set warranty to "No" (with no deduction) for devices older than 11 months
  useEffect(() => {
    if (deviceAge === 'Above 11 Months') {
      setUnderWarranty(false);
    }
  }, [deviceAge]);

  useEffect(() => {
    if (!device) return;
    const variant = device.variants.find(v => v.storage === storage) || device.variants[0];
    
    // Calculate new price based on user inputs
    const result = calculatePrice({
      basePrice: variant.basePrice,
      deviceAge,
      ableToMakeCalls: ableToMakeCalls ?? true,
      isTouchScreenWorking: isTouchScreenWorking ?? true,
      isScreenOriginal: isScreenOriginal ?? true,
      underWarranty: underWarranty ?? true,
      hasGSTBill: selectedAccessories.includes('Bill'),
      eSIMSupport,
      physicalIssues,
      technicalIssues,
      hasCharger: selectedAccessories.includes('Charger'),
      hasBox: selectedAccessories.includes('Box'),
    });

    setPriceAnimating(true);
    setTimeout(() => setPriceAnimating(false), 400);
    setCurrentPrice(result.finalPrice);
    setBreakdown(result);
  }, [
    device, 
    deviceAge, 
    ableToMakeCalls, 
    isTouchScreenWorking, 
    isScreenOriginal, 
    underWarranty, 
    eSIMSupport, 
    physicalIssues, 
    technicalIssues, 
    selectedAccessories
  ]);

  const handleGetBestPrice = () => {
    updateQuote({
      device: { 
        brand: device.brand, 
        modelName: device.modelName, 
        slug: device.slug,
        category: 'tablet',
        imageUrl: device.imageUrl || '',
        storage: storage || device.variants[0].storage,
        deviceAge,
        ableToMakeCalls,
        isTouchScreenWorking,
        isScreenOriginal,
        underWarranty,
        hasGSTBill: selectedAccessories.includes('Bill'),
        eSIMSupport,
        physicalIssues,
        technicalIssues,
        accessories: selectedAccessories,
      },
      priceBreakdown: breakdown,
    });
    setShowResult(true);
  };

  const handleSchedulePickup = () => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/schedule-pickup');
    } else {
      navigate('/schedule-pickup');
    }
  };

  if (loading) return <Loader />;
  if (!device) return <div className="text-center py-20 text-gray-500">Device not found</div>;

  // --- RESULT VIEW ---
  if (showResult) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen py-10 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Progress */}
          <div className="flex items-center justify-end gap-12 mb-10 text-sm font-bold">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#0565E6] text-white flex items-center justify-center">1</span>
              <span className="text-[#111827]">Payment</span>
            </div>
            <div className="flex items-center gap-3 opacity-30">
              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">2</span>
              <span className="text-gray-500">Pickup</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Offer Card */}
              <div className="bg-white rounded-[40px] border border-gray-100 p-8 sm:p-12 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <div className="w-40 h-40 bg-gray-50 rounded-[32px] flex items-center justify-center p-6">
                    <img 
                      src={device.imageUrl || "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"} 
                      alt={device.modelName}
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[#0565E6] text-sm font-black uppercase tracking-wider mb-2 block">Offer ready — instant payout</span>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#111827] mb-4">
                      {device.modelName} ({storage || device.variants[0].storage})
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mb-6">
                      <span className="text-5xl font-black text-[#111827]">{formatCurrency(currentPrice)}</span>
                      <div className="flex items-center gap-1.5 bg-[#E8F1FF] text-[#0565E6] px-3 py-1.5 rounded-xl border border-[#0565E6]/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        <span className="text-xs font-black uppercase tracking-wider">Guaranteed</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowResult(false)}
                      className="text-[#0565E6] font-black text-sm underline underline-offset-8 hover:text-[#044BA8] transition-all"
                    >
                      Recalculate
                    </button>
                  </div>
                </div>

                <div className="mt-12 space-y-4 pt-10 border-t border-gray-50">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-[#0565E6] peer-checked:border-[#0565E6] transition-all" />
                      <svg className="absolute top-1 left-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 leading-relaxed group-hover:text-[#111827] transition-colors">
                      Receive updates via Whatsapp (+91 {user?.phone || '9076116803'})
                    </span>
                  </label>
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-[#0565E6] peer-checked:border-[#0565E6] transition-all" />
                      <svg className="absolute top-1 left-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 leading-relaxed group-hover:text-[#111827] transition-colors">
                      I agree to the <span className="text-[#0565E6] font-bold">terms and conditions</span> of the service and understand that the final value of {formatCurrency(currentPrice)} is subject to physical device inspection by our technician at the time of pickup.
                    </span>
                  </label>
                </div>

                <button 
                  onClick={handleSchedulePickup}
                  className="w-full mt-10 bg-[#0565E6] text-white font-black py-6 rounded-3xl hover:bg-[#044BA8] transition-all shadow-xl shadow-blue-100 text-lg flex items-center justify-center gap-2 group"
                >
                  Get My {formatCurrency(currentPrice)} Now
                  <svg className="transition-transform group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[13px] font-bold text-gray-400">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Free doorstep pickup
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Instant payment at pickup
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Price locked for 24h
                  </span>
                </div>
              </div>

              {/* Device Evaluation Summary */}
              <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
                <h3 className="text-2xl font-black text-[#111827] mb-10">Device Evaluation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <EvaluationRow label="Device Age" value={deviceAge} color="#0565E6" />
                  <EvaluationRow label="Under Warranty" value={underWarranty ? 'Yes' : 'No'} color={underWarranty ? '#0565E6' : '#EF4444'} />
                  <EvaluationRow label="Calls Functional" value={ableToMakeCalls ? 'Yes' : 'No (Dead)'} color={ableToMakeCalls ? '#0565E6' : '#EF4444'} />
                  <EvaluationRow label="Touch Screen working" value={isTouchScreenWorking ? 'Yes' : 'No'} color={isTouchScreenWorking ? '#0565E6' : '#EF4444'} />
                  <EvaluationRow label="Screen Original" value={isScreenOriginal ? 'Yes' : 'No (Copy Screen)'} color={isScreenOriginal ? '#0565E6' : '#EF4444'} />
                  <EvaluationRow label="Physical Issues" value={physicalIssues.length > 0 ? physicalIssues.join(', ') : 'No Issues'} color={physicalIssues.length > 0 ? '#EF4444' : '#0565E6'} />
                  <EvaluationRow label="Technical Issues" value={technicalIssues.length > 0 ? technicalIssues.join(', ') : 'No Issues'} color={technicalIssues.length > 0 ? '#EF4444' : '#0565E6'} />
                  <EvaluationRow label="Accessories" value={selectedAccessories.join(', ') || 'None'} color="#0565E6" />
                </div>
              </div>
            </div>

            {/* Sidebars */}
            <div className="w-full lg:w-96 space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-[#E8F1FF] rounded-xl flex items-center justify-center text-[#0565E6]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </div>
                  <h3 className="text-xl font-black text-[#111827]">Payment Summary</h3>
                </div>
                <div className="space-y-6">
                  <PriceRow label="Base Price" value={breakdown?.basePrice} />
                  <PriceRow label="Pickup Fee" value={0} originalValue={100} isFree />
                  <PriceRow label="Processing Fee" value={0} originalValue={100} />
                  <PriceRow label="Promo Code" value={0} isBonus />
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-black text-[#111827]">Final Offer</span>
                    <span className="text-2xl font-black text-[#111827]">{formatCurrency(currentPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Apply Coupon */}
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-[#E8F1FF] rounded-xl flex items-center justify-center text-[#0565E6]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 5V7M15 11V13M15 17V19M5 5C3.34315 5 2 6.34315 2 8V10C3.10457 10 4 10.8954 4 12C4 13.1046 3.10457 14 2 14V16C2 17.6569 3.34315 19 5 19H19C20.6569 19 22 17.6569 22 16V14C20.8954 14 20 13.1046 20 12C20 10.8954 20.8954 10 22 10V8C22 6.34315 20.6569 5 19 5H5Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">Apply Coupon</h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">View exciting offers</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 mb-6">
                  <p className="text-sm font-bold text-gray-500">No coupons available at the moment.</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type coupon code here" 
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#0565E6] transition-all"
                  />
                  <button className="bg-gray-100 text-gray-400 px-6 py-3.5 rounded-xl font-black text-sm cursor-not-allowed">
                    Apply
                  </button>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-[#E8F1FF] rounded-xl flex items-center justify-center text-[#0565E6]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/></svg>
                  </div>
                  <h3 className="text-lg font-black text-[#111827]">Cancellation Policy</h3>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  You can cancel your order anytime before the pickup is completed. Once the device is picked up and verified, the order cannot be cancelled. For any help, reach out to our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- QUIZ VIEW ---
  return (
    <div className="bg-[#F9FAFB] min-h-screen py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Quiz Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            
            {/* Device Header */}
            <div className="p-8 flex items-center gap-6 border-b border-gray-50">
              <div className="w-20 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-2">
                <img src={device.imageUrl || 'https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg'} alt={device.modelName} className="h-full object-contain" />
              </div>
              <div>
                <p className="text-[#0565E6] text-xs font-bold uppercase tracking-wider mb-1">Evaluating</p>
                <h1 className="text-2xl font-black text-[#111827]">
                  {device.modelName} <span className="text-gray-400 font-medium">({storage || device.variants[0].storage})</span>
                </h1>
              </div>
            </div>

            {/* Stepper progress */}
            <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-50">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${idx === currentStepIndex ? 'text-[#0565E6]' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                    {idx < STEPS.length - 1 && <span className="text-gray-300 text-xs font-bold">&gt;</span>}
                  </div>
                ))}
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0565E6] transition-all duration-500" 
                  style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Questions Area */}
            <div className="p-10 min-h-[420px] flex flex-col justify-between">
              <div>
                {/* STEP 0: Age & Warranty */}
                {currentStepIndex === 0 && (
                  <div className="space-y-10">
                    {/* Q1: Age */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#111827]">1. How old is your device?</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {AGE_OPTIONS.map(age => (
                          <button
                            key={age}
                            onClick={() => setDeviceAge(age)}
                            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                              ${deviceAge === age 
                                ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q2: Warranty */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#111827]">2. Is your device under manufacturer warranty?</h3>
                      {deviceAge === 'Above 11 Months' && (
                        <p className="text-xs text-amber-500 font-semibold -mt-2">Warranty is automatically set to No for devices older than 11 months.</p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => { if (deviceAge !== 'Above 11 Months') setUnderWarranty(true); }}
                          disabled={deviceAge === 'Above 11 Months'}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${underWarranty === true 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}
                            ${deviceAge === 'Above 11 Months' ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setUnderWarranty(false)}
                          disabled={deviceAge === 'Above 11 Months'}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${underWarranty === false 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}
                            ${deviceAge === 'Above 11 Months' ? 'cursor-not-allowed' : ''}`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 1: Calls & Screen */}
                {currentStepIndex === 1 && (
                  <div className="space-y-10">
                    {/* Q1: Calls */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#111827]">1. Are you able to make and receive calls?</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setAbleToMakeCalls(true)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${ableToMakeCalls === true 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setAbleToMakeCalls(false)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${ableToMakeCalls === false 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          No (Dead)
                        </button>
                      </div>
                    </div>

                    {/* Q2: Touch Screen */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#111827]">2. Is your device's touch screen working properly?</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setIsTouchScreenWorking(true)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isTouchScreenWorking === true 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setIsTouchScreenWorking(false)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isTouchScreenWorking === false 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Q3: Original Screen */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-[#111827]">3. Is your tablet's screen original?</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setIsScreenOriginal(true)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isScreenOriginal === true 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setIsScreenOriginal(false)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isScreenOriginal === false 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          No (Copy Screen)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Physical Issues */}
                {currentStepIndex === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">Select physical issues (if any)</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Leave unselected if none apply</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'glass_crack', label: 'Glass Crack', desc: 'Screen glass contains cracks', icon: '📱' },
                        { id: 'back_panel', label: 'Back Panel Damage', desc: 'Scratches, dents or broken back panel', icon: '🎨' },
                        { id: 'camera_glass_broken', label: 'Camera Glass Broken', desc: 'Camera lens glass is cracked/broken', icon: '📷' }
                      ].map(issue => {
                        const selected = physicalIssues.includes(issue.id);
                        return (
                          <button
                            key={issue.id}
                            onClick={() => {
                              setPhysicalIssues(prev => 
                                prev.includes(issue.id) ? prev.filter(i => i !== issue.id) : [...prev, issue.id]
                              );
                            }}
                            className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-40
                              ${selected 
                                ? 'border-[#0565E6] bg-[#E8F1FF]' 
                                : 'border-gray-100 bg-white hover:border-gray-200'}`}
                          >
                            <span className="text-[40px]">{issue.icon}</span>
                            <div>
                              <p className={`font-black text-[15px] ${selected ? 'text-[#0565E6]' : 'text-[#111827]'}`}>{issue.label}</p>
                              <p className="text-[15px] text-gray-400 mt-1">{issue.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: Technical Issues */}
                {currentStepIndex === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">Select technical/hardware issues (if any)</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Leave unselected if none apply</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[360px] overflow-y-auto pr-2 no-scrollbar">
                      {[
                        { id: 'battery_service', label: 'Battery Warning', icon: '🔋', pct: '13%' },
                        { id: 'front_camera', label: 'Front Camera faulty', icon: '📸', pct: '8%' },
                        { id: 'back_camera', label: 'Back Camera faulty', icon: '📷', pct: '15%' },
                        { id: 'volume_button', label: 'Volume button issue', icon: '🔘', pct: '4%' },
                        { id: 'wifi_issue', label: 'Wifi issue', icon: '📶', pct: '39%' },
                        { id: 'finger_touch', label: 'Finger touch/Face ID issue', icon: '☝️', pct: '26%' },
                        { id: 'speaker_faulty', label: 'Speaker faulty', icon: '🔊', pct: '4%' },
                        { id: 'power_button', label: 'Power button issue', icon: '🔌', pct: '2%' },
                        { id: 'charging_port', label: 'Charging port issue', icon: '⚡', pct: '10%' },
                        { id: 'audio_receiver', label: 'Audio receiver issue', icon: '📞', pct: '7%' },
                        { id: 'bluetooth', label: 'Bluetooth issue', icon: '🦷', pct: '39%' },
                        { id: 'vibrator', label: 'Vibrator issue', icon: '📳', pct: '2%' },
                        { id: 'microphone', label: 'Microphone issue', icon: '🎤', pct: '2%' },
                        { id: 'proximity_sensor', label: 'Proximity sensor', icon: '📡', pct: '3%' }
                      ].map(issue => {
                        const selected = technicalIssues.includes(issue.id);
                        return (
                          <button
                            key={issue.id}
                            onClick={() => {
                              setTechnicalIssues(prev => 
                                prev.includes(issue.id) ? prev.filter(i => i !== issue.id) : [...prev, issue.id]
                              );
                            }}
                            className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2
                              ${selected 
                                ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                                : 'border-gray-50 bg-white text-gray-500 hover:border-gray-100'}`}
                          >
                            <span className="text-[40px]">{issue.icon}</span>
                            <span className="text-[15px] font-bold leading-tight">{issue.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: Accessories */}
                {currentStepIndex === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-[#111827]">Which original accessories do you have?</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Deductions apply if unchecked</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { id: 'Bill', label: 'GST Valid Bill', desc: 'Valid GST invoice', icon: '📄' },
                        { id: 'Box', label: 'Original Box', desc: 'Original purchase box', icon: '📦' },
                        { id: 'Charger', label: 'Original Charger', desc: 'Original charging adapter', icon: '🔌' }
                      ].map(acc => {
                        const selected = selectedAccessories.includes(acc.id);
                        return (
                          <button
                            key={acc.id}
                            onClick={() => {
                              setSelectedAccessories(prev => 
                                prev.includes(acc.id) ? prev.filter(a => a !== acc.id) : [...prev, acc.id]
                              );
                            }}
                            className={`p-6 rounded-[24px] border-2 text-left transition-all flex flex-col justify-between h-40 group
                              ${selected 
                                ? 'border-[#0565E6] bg-[#E8F1FF]' 
                                : 'border-gray-100 bg-white hover:border-gray-200'}`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className="text-[40px]">{acc.icon}</span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                ${selected ? 'border-[#0565E6] bg-[#0565E6]' : 'border-gray-200'}`}>
                                {selected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                              </div>
                            </div>
                            <div>
                              <p className={`font-black text-[15px] ${selected ? 'text-[#0565E6]' : 'text-[#111827]'}`}>{acc.label}</p>
                              <p className="text-[15px] text-gray-400 mt-1">{acc.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Stepper buttons row */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStepIndex(prev => Math.max(prev - 1, 0))}
                  disabled={currentStepIndex === 0}
                  className="px-8 py-4 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  ← Back
                </button>
                
                {currentStepIndex < STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex(prev => prev + 1)}
                    disabled={
                      (currentStepIndex === 0 && (underWarranty === null || eSIMSupport === null)) ||
                      (currentStepIndex === 1 && (ableToMakeCalls === null || isTouchScreenWorking === null || isScreenOriginal === null))
                    }
                    className="bg-[#0565E6] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#044BA8] transition-all disabled:opacity-50"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    onClick={handleGetBestPrice}
                    className="bg-[#16A34A] text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-green-100 hover:bg-[#15803D] transition-all flex items-center gap-2"
                  >
                    GET BEST PRICE <span className="text-lg">›</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Evaluation */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 sticky top-10">
            <h2 className="text-2xl font-black text-[#111827] mb-8">Device Evaluation</h2>
            
            {/* Price Box */}
            <div className="bg-[#E8F1FF] rounded-3xl p-6 mb-8 flex items-center justify-between border border-[#0565E6]/10">
              <div>
                <p className="text-[#0565E6] text-xs font-bold uppercase tracking-widest mb-1">Estimated Value</p>
                <p className={`text-3xl font-black text-[#111827] transition-all ${priceAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                  {formatCurrency(currentPrice)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#0565E6] shadow-sm">
                <IconTrend />
              </div>
            </div>

            {/* Summary List */}
            <div className="space-y-6">
              <SummaryItem label="Device Age" value={deviceAge} active />
              <SummaryItem label="Warranty" value={underWarranty === null ? 'Not answered' : (underWarranty ? 'Under Warranty' : 'Out of Warranty')} active={underWarranty !== null} />
              <SummaryItem label="General & Screen" value={ableToMakeCalls === null ? 'Not answered' : `Calls: ${ableToMakeCalls ? 'Yes' : 'No'}, Touch: ${isTouchScreenWorking ? 'Yes' : 'No'}, Original: ${isScreenOriginal ? 'Yes' : 'No'}`} active={ableToMakeCalls !== null} />
              <SummaryItem label="Physical Issues" value={physicalIssues.length > 0 ? `${physicalIssues.length} issues selected` : 'No Issues'} active={currentStepIndex >= 2} />
              <SummaryItem label="Technical Issues" value={technicalIssues.length > 0 ? `${technicalIssues.length} issues selected` : 'No Issues'} active={currentStepIndex >= 3} />
              <SummaryItem label="Accessories" value={selectedAccessories.length > 0 ? selectedAccessories.join(', ') : 'None selected'} active={currentStepIndex >= 4} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, active }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-[#111827]">{label}</h4>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#0565E6]' : 'bg-gray-200'}`} />
        <p className={`text-[13px] font-medium ${active ? 'text-gray-600' : 'text-gray-400'}`}>{value}</p>
      </div>
    </div>
  );
}

function PriceRow({ label, value, originalValue, isFree, isBonus }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        {originalValue && <span className="text-sm text-gray-300 line-through">₹{originalValue}</span>}
        <span className={`font-black ${isFree || isBonus ? 'text-[#0565E6]' : 'text-[#111827]'}`}>
          {isFree ? 'Free' : (isBonus ? `+${formatCurrency(value)}` : formatCurrency(value))}
        </span>
      </div>
    </div>
  );
}

function EvaluationRow({ label, value, color }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-black text-[#111827]">{value || 'N/A'}</span>
      </div>
    </div>
  );
}
