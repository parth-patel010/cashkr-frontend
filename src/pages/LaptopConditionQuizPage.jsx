import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import { useQuote } from '../hooks/useQuote';
import { useAuth } from '../hooks/useAuth';
import { calculateLaptopPrice } from '../utils/priceCalculator';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/ui/Loader';
import LaptopSpecModal from '../components/LaptopSpecModal';

const STEPS = [
  { id: 'specs', label: 'Specs' },
  { id: 'power', label: 'Power Status' },
  { id: 'screenSize', label: 'Screen Size' },
  { id: 'functional', label: 'Functional Issues' },
  { id: 'screen', label: 'Screen Assessment' },
  { id: 'body', label: 'Body Condition' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'age', label: 'Device Age' },
];

const AGE_OPTIONS = [
  { key: 'lessThan1', label: 'Less than 1 year (in warranty)' },
  { key: 'oneToTwo', label: 'Between 1 and 3 years' },
  { key: 'twoToThree', label: 'More than 3 years' },
];

const SCREEN_SIZE_OPTIONS = [
  { key: '10-11', label: '10-11 inches' },
  { key: '12-13', label: '12-13 inches' },
  { key: '14-15', label: '14-15 inches' },
  { key: 'above15', label: 'Above 15 inches' },
];

const functionalOptions = [
  { id: 'keyboard', label: 'Keyboard not working / key(s) missing', icon: '⌨️', pct: '7%' },
  { id: 'cdDrive', label: 'CD/DVD Drive not working', icon: '💿', pct: '7%' },
  { id: 'trackpad', label: 'Touchpad not working / click faulty', icon: '🖱️', pct: '18%' },
  { id: 'battery', label: 'Battery dead / backup < 60 mins', icon: '🔋', pct: '6%' },
  { id: 'speakers', label: 'Speakers faulty / cracked sound', icon: '🔊', pct: '3%' },
  { id: 'wifi', label: 'Wi-Fi not working', icon: '🌐', pct: '5%' },
  { id: 'ports', label: 'USB Port not working', icon: '🔌', pct: '8%' },
  { id: 'webcam', label: 'Web Cam not working', icon: '📷', pct: '6%' },
  { id: 'charging', label: 'Charging Port not working', icon: '🔌', pct: '8%' },
  { id: 'hardDisk', label: 'Hard Drive Missing / Defective', icon: '💾', pct: '10%' },
  { id: 'motherboard', label: 'Motherboard issue (restart/hang/heat)', icon: '🧩', pct: '35%' },
  { id: 'bluetooth', label: 'Bluetooth not working', icon: '📡', pct: '6%' },
];

const screenOptions = [
  { id: 'screenCracked', label: 'Screen cracked or broken', icon: '💔', pct: '18%' },
  { id: 'lineDiscolour', label: 'Line, discolouration or spot', icon: '🖥️', pct: '18%' },
];

const bodyOptions = [
  { id: 'minorDentTop', label: 'Minor dent on top panel', icon: '📱', pct: '8%' },
  { id: 'minorDentBase', label: 'Minor dent on base panel', icon: '📱', pct: '8%' },
  { id: 'majorDentTop', label: 'Major dent on top panel', icon: '💥', pct: '35%' },
  { id: 'majorDentBase', label: 'Major dent on base panel', icon: '💥', pct: '40%' },
  { id: 'minorScratch', label: 'Minor scratch on body', icon: '✨', pct: '5%' },
  { id: 'majorScratch', label: 'Major scratch on body', icon: '🔪', pct: '8%' },
];

const accessoryOptions = [
  { id: 'bill', label: 'GST Valid Bill', desc: 'Valid purchase invoice', icon: '📄' },
  { id: 'box', label: 'Original Box', desc: 'Original purchase box', icon: '📦' },
  { id: 'charger', label: 'Original Charger', desc: 'Original charging adapter', icon: '🔌' }
];

export default function LaptopConditionQuizPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateQuote } = useQuote();
  const { isAuthenticated, user } = useAuth();

  const [specs, setSpecs] = useState(location.state?.specs);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); 
  const [showResult, setShowResult] = useState(false);
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [priceAnimating, setPriceAnimating] = useState(false);

  // Selections
  const [powerStatus, setPowerStatus] = useState(null); // 'on' | 'off'
  const [screenSize, setScreenSize] = useState(null); // '10-11' | '12-13' | '14-15' | 'above15'
  const [hasGpu, setHasGpu] = useState(null); // 'yes' | 'no'
  const [isGpuWorking, setIsGpuWorking] = useState(null); // 'yes' | 'no'
  const [issuesList, setIssuesList] = useState([]); // functional issues
  const [screenIssuesList, setScreenIssuesList] = useState([]);
  const [bodyIssuesList, setBodyIssuesList] = useState([]);
  const [accessories, setAccessories] = useState([]); // default active
  const [age, setAge] = useState(null); // age option key

  const [currentPrice, setCurrentPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    if (!specs) {
      navigate(`/sell-old-laptops/${brand}/${slug}`, { replace: true });
      return;
    }
    deviceService.getDevice(slug).then(res => {
      setDevice(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug, specs, navigate, brand]);

  useEffect(() => {
    if (!device || !specs) return;
    const result = calculateLaptopPrice(device, {
      ...specs,
      yearBracket: age,
      powerStatus: powerStatus,
      screenSize: screenSize,
      hasGpu: hasGpu === 'yes',
      isGpuWorking: isGpuWorking === 'yes',
      functionalIssues: issuesList,
      screenIssues: screenIssuesList,
      bodyIssues: bodyIssuesList,
      accessories: accessories.length > 0 ? accessories : ['none']
    });
    if (result) {
      setPriceAnimating(true);
      setTimeout(() => setPriceAnimating(false), 400);
      setCurrentPrice(result.finalPrice);
      setBreakdown(result);
    }
  }, [device, specs, age, powerStatus, screenSize, hasGpu, isGpuWorking, issuesList, screenIssuesList, bodyIssuesList, accessories]);

  const handleSpecsUpdate = (newSpecs) => {
    setSpecs(newSpecs);
    setIsSpecsModalOpen(false);
  };

  const handleGetBestPrice = () => {
    const ageLabel = AGE_OPTIONS.find(o => o.key === age)?.label || age;
    
    updateQuote({
      device: {
        ...device,
        category: 'laptop',
        brand,
        modelName: device.modelName,
        slug,
        ...specs,
        deviceAge: ageLabel,
        yearBracket: age,
        powerStatus,
        screenSize,
        hasGpu: hasGpu === 'yes',
        isGpuWorking: isGpuWorking === 'yes',
        functionalIssues: issuesList,
        screenIssues: screenIssuesList,
        bodyIssues: bodyIssuesList,
        accessories: accessories
      },
      priceBreakdown: breakdown,
      price: currentPrice
    });
    
    setShowResult(true);
  };

  const handleSchedulePickup = () => {
    if (!isAuthenticated) navigate('/login?returnUrl=/schedule-pickup');
    else navigate('/schedule-pickup');
  };

  if (loading) return <Loader />;
  if (!device) return <div className="text-center py-20 font-black text-gray-700">Device not found</div>;

  // --- RESULT VIEW ---
  if (showResult) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Header Progress */}
          <div className="flex justify-center gap-12 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#0565E6] text-white flex items-center justify-center font-black">1</span>
              <span className="text-[#111827] font-black">Offer Details</span>
            </div>
            <div className="flex items-center gap-3 opacity-30">
              <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-black">2</span>
              <span className="text-gray-500 font-black">Pickup & Payment</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              
              {/* Offer Card */}
              <div className="bg-white rounded-[40px] border border-gray-100 p-10 sm:p-14 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-12">
                  <div className="w-44 h-44 bg-gray-50 rounded-[40px] flex items-center justify-center p-8">
                    <img src={device.imageUrl} alt={device.modelName} className="max-h-full object-contain" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[#0565E6] text-xs font-black uppercase tracking-wider mb-2 block">Offer ready — instant payout</span>
                    <h1 className="text-xl sm:text-2xl font-black text-[#111827] mb-4">
                      {device.modelName} {specs.ram && specs.storage && <span className="text-gray-600 font-bold text-sm">({specs.ram}/{specs.storage})</span>}
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-5 mb-6">
                      <span className="text-4xl font-black text-[#111827] tracking-tighter">{formatCurrency(currentPrice)}</span>
                      <div className="flex items-center gap-2 bg-[#0565E6]/5 text-[#0565E6] px-3 py-1.5 rounded-xl border border-[#0565E6]/10">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        <span className="text-xs font-black uppercase tracking-widest">Guaranteed</span>
                      </div>
                    </div>
                    <button onClick={() => setShowResult(false)} className="text-[#0565E6] font-black text-sm underline underline-offset-8 hover:text-[#0452B9] transition-all">Recalculate</button>
                  </div>
                </div>

                <div className="mt-14 space-y-6 pt-12 border-t border-gray-50">
                   <CheckboxRow label={`Receive updates via Whatsapp (+91 ${user?.phone || 'XXXXXXXXXX'})`} checked />
                   <CheckboxRow label="I agree to the terms and conditions and understand that the final value is subject to physical device inspection by our technician." checked />
                </div>

                <button 
                  onClick={handleSchedulePickup}
                  className="w-full mt-12 bg-[#0565E6] text-white font-black py-7 rounded-[32px] hover:bg-[#0452B9] transition-all shadow-2xl shadow-[#0565E6]/20 text-xl flex items-center justify-center gap-3 group"
                >
                  Get My {formatCurrency(currentPrice)} Now
                  <svg className="transition-transform group-hover:translate-x-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                <div className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[13px] font-black text-gray-600">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Free doorstep pickup</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Instant payment at pickup</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Price locked for 24h</span>
                </div>
              </div>

              {/* Evaluation Detail (Specs Added Here) */}
              <div className="bg-white rounded-[40px] border border-gray-100 p-12 shadow-sm">
                <h3 className="text-2xl font-black text-[#111827] mb-12">Laptop Evaluation Detail</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                   <EvaluationDetailRow label="Device" value={device.modelName} color="#0565E6" />
                   <EvaluationDetailRow label="Processor" value={specs.processor || 'Standard'} color="#0565E6" />
                   <EvaluationDetailRow label="Generation" value={specs.generation || 'Standard'} color="#0565E6" />
                   <EvaluationDetailRow label="RAM" value={specs.ram || 'Standard'} color="#0565E6" />
                   <EvaluationDetailRow label="Storage" value={specs.storage || 'Standard'} color="#0565E6" />
                   <EvaluationDetailRow label="Power Status" value={powerStatus === 'on' ? 'Turns On' : 'Does Not Turn On (Off)'} color={powerStatus === 'on' ? '#0565E6' : '#EF4444'} />
                   <EvaluationDetailRow label="Screen Size" value={screenSize ? SCREEN_SIZE_OPTIONS.find(o => o.key === screenSize)?.label : '-'} color="#0565E6" />
                   <EvaluationDetailRow label="Dedicated GPU" value={hasGpu === 'yes' ? `Available (${isGpuWorking === 'yes' ? 'Working' : 'Not Working'})` : 'Not Available'} color={hasGpu === 'yes' && isGpuWorking === 'yes' ? '#0565E6' : '#EF4444'} />
                   <EvaluationDetailRow label="Device Age" value={age ? AGE_OPTIONS.find(o => o.key === age).label : '-'} color="#0565E6" />
                   <EvaluationDetailRow label="Functional Issues" value={issuesList.length > 0 ? issuesList.length + ' issue(s)' : 'No Issues'} color={issuesList.length > 0 ? '#EF4444' : '#0565E6'} />
                   <EvaluationDetailRow label="Screen Condition" value={screenIssuesList.length > 0 ? screenIssuesList.length + ' issue(s)' : 'No Issues'} color={screenIssuesList.length > 0 ? '#EF4444' : '#0565E6'} />
                   <EvaluationDetailRow label="Body Condition" value={bodyIssuesList.length > 0 ? bodyIssuesList.length + ' issue(s)' : 'No Issues'} color={bodyIssuesList.length > 0 ? '#EF4444' : '#0565E6'} />
                   <EvaluationDetailRow label="Accessories" value={accessories.length > 0 ? accessories.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') : 'None'} color="#0565E6" />
                </div>
              </div>
            </div>

            {/* Sidebars */}
            <div className="w-full lg:w-[400px] space-y-8">
              <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
                 <h3 className="text-xl font-black text-[#111827] mb-8">Offer Summary</h3>
                 <div className="space-y-6">
                    <SummaryPriceRow label="Base Price" value={breakdown?.basePrice} />
                    {breakdown?.powerDeduction < 0 && (
                      <SummaryPriceRow label="Power Off Deduction" value={breakdown?.powerDeduction} />
                    )}
                    <SummaryPriceRow label="Pickup Fee" value={0} original={100} isFree />
                    <SummaryPriceRow label="Processing" value={0} original={150} isFree />
                    <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                      <span className="text-lg font-black text-[#111827]">Final Payout</span>
                      <span className="text-3xl font-black text-[#0565E6]">{formatCurrency(currentPrice)}</span>
                    </div>
                 </div>
              </div>

              {/* Policy */}
              <div className="bg-[#111827] rounded-[40px] p-10 text-white">
                 <h4 className="text-lg font-black mb-4">Pickup Policy</h4>
                 <p className="text-gray-300 text-sm font-bold leading-relaxed">
                   Our technician will verify the laptop at your doorstep. Please ensure the laptop is charged and all data is backed up. Payment is instant.
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
    <div className="bg-[#F9FAFB] min-h-screen py-8 px-4 sm:px-10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header summary of current device */}
        <div className="bg-white rounded-[32px] p-8 mb-8 border border-gray-100 flex items-center gap-8 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center p-3">
             <img src={device.imageUrl} alt={device.modelName} className="max-h-full object-contain" />
          </div>
          <div>
            <p className="text-[#0565E6] text-[10px] font-black uppercase tracking-widest mb-1">Evaluating</p>
            <h1 className="text-xl font-black text-[#111827]">{device.modelName}</h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Quiz Section */}
          <div className="flex-1 space-y-8">
            
            {/* Stepper tracker */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-tight ${idx === currentStepIndex ? 'text-[#0565E6]' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                    {idx < STEPS.length - 1 && <span className="text-gray-400 text-xs font-bold">&gt;</span>}
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

            {/* Active Question Card */}
            <div className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm transition-all duration-500">
              
              {/* STEP: Specs */}
              {STEPS[currentStepIndex]?.id === 'specs' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-[#111827]">1. Confirm Device Specifications</h3>
                  <div className="bg-gray-50 rounded-3xl p-8 space-y-4 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-3">
                      <span className="text-sm font-bold text-gray-700">Processor</span>
                      <span className="text-sm font-black text-gray-900">{specs.processor || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-3">
                      <span className="text-sm font-bold text-gray-700">Generation</span>
                      <span className="text-sm font-black text-gray-900">{specs.generation || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-3">
                      <span className="text-sm font-bold text-gray-700">RAM</span>
                      <span className="text-sm font-black text-gray-900">{specs.ram || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">Storage</span>
                      <span className="text-sm font-black text-gray-900">{specs.storage || 'Standard'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSpecsModalOpen(true)}
                    className="w-full py-4 border-2 border-gray-200 hover:border-[#0565E6] hover:bg-[#E8F1FF] hover:text-[#0565E6] rounded-2xl text-sm font-black text-gray-700 transition-all"
                  >
                    Modify Specifications
                  </button>
                </div>
              )}

              {/* STEP: Power Status */}
              {STEPS[currentStepIndex]?.id === 'power' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-[#111827]">2. Does the laptop turn on successfully?</h3>
                  <p className="text-xs font-black text-gray-600 uppercase tracking-widest -mt-2">Select the current power state</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setPowerStatus('on')}
                      className={`py-6 rounded-2xl border-2 font-black text-base transition-all
                        ${powerStatus === 'on' 
                          ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                          : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                    >
                      Yes, Turns On
                    </button>
                    <button
                      onClick={() => setPowerStatus('off')}
                      className={`py-6 rounded-2xl border-2 font-black text-base transition-all
                        ${powerStatus === 'off' 
                          ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                          : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                    >
                      No, Does Not Turn On (Off)
                    </button>
                  </div>
                </div>
              )}

              {/* STEP: Screen Size & Dedicated GPU */}
              {STEPS[currentStepIndex]?.id === 'screenSize' && (
                <div className="space-y-8">
                  {/* Screen Size Question */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-[#111827]">3. What is the screen size of the laptop?</h3>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Select the screen size</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SCREEN_SIZE_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => setScreenSize(opt.key)}
                          className={`py-6 rounded-2xl border-2 font-black text-base transition-all
                            ${screenSize === opt.key 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dedicated Graphics Card Question */}
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div>
                      <h3 className="text-lg font-black text-[#111827]">Does the laptop have a dedicated graphics card?</h3>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Select option to proceed</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setHasGpu('yes');
                          setIsGpuWorking(null); // Reset working status when toggling hasGpu
                        }}
                        className={`py-6 rounded-2xl border-2 font-black text-base transition-all
                          ${hasGpu === 'yes' 
                            ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                            : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                      >
                        Yes, Dedicated GPU Available
                      </button>
                      <button
                        onClick={() => {
                          setHasGpu('no');
                          setIsGpuWorking(null);
                        }}
                        className={`py-6 rounded-2xl border-2 font-black text-base transition-all
                          ${hasGpu === 'no' 
                            ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                            : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                      >
                        No Dedicated GPU
                      </button>
                    </div>
                  </div>

                  {/* Sub-Question: Is it working? */}
                  {hasGpu === 'yes' && (
                    <div className="space-y-4 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <h3 className="text-lg font-black text-[#111827]">Is the dedicated graphics card working properly?</h3>
                        <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Confirm GPU functionality</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setIsGpuWorking('yes')}
                          className={`py-6 rounded-2xl border-2 font-black text-base transition-all
                            ${isGpuWorking === 'yes' 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                        >
                          Yes, Working Properly
                        </button>
                        <button
                          onClick={() => setIsGpuWorking('no')}
                          className={`py-6 rounded-2xl border-2 font-black text-base transition-all
                            ${isGpuWorking === 'no' 
                              ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' 
                              : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                        >
                          No, Graphics Card Issue / Not Working
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP: Functional Issues */}
              {STEPS[currentStepIndex]?.id === 'functional' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">4. Select functional issues (if any)</h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Leave unselected if none apply and click Next</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 text-xl gap-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                    {functionalOptions.map(i => {
                      const isSelected = issuesList.includes(i.id);
                      return (
                        <button 
                          key={i.id} 
                          onClick={() => {
                            setIssuesList(prev => prev.includes(i.id) ? prev.filter(x => x !== i.id) : [...prev, i.id]);
                          }} 
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-between gap-2 transition-all relative h-36
                            ${isSelected ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' : 'border-gray-100 bg-white text-gray-800 hover:border-gray-200'}`}
                        >
                          <div className="text-[40px]">{i.icon}</div>
                          <span className="text-[15px] font-black text-center leading-tight">{i.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP: Screen Assessment */}
              {STEPS[currentStepIndex]?.id === 'screen' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">5. Select screen issues (if any)</h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Leave unselected if none apply and click Next</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {screenOptions.map(i => {
                      const isSelected = screenIssuesList.includes(i.id);
                      return (
                        <button 
                          key={i.id} 
                          onClick={() => {
                            setScreenIssuesList(prev => prev.includes(i.id) ? prev.filter(x => x !== i.id) : [...prev, i.id]);
                          }} 
                          className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-between gap-3 transition-all h-36
                            ${isSelected ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' : 'border-gray-100 bg-white text-gray-800 hover:border-gray-200'}`}
                        >
                          <div className="text-[40px]">{i.icon}</div>
                          <span className="text-[15px] font-black text-center leading-tight">{i.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP: Body Condition */}
              {STEPS[currentStepIndex]?.id === 'body' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">6. Select body damage/scratches (if any)</h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Leave unselected if none apply and click Next</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
                    {bodyOptions.map(i => {
                      const isSelected = bodyIssuesList.includes(i.id);
                      return (
                        <button 
                          key={i.id} 
                          onClick={() => {
                            setBodyIssuesList(prev => prev.includes(i.id) ? prev.filter(x => x !== i.id) : [...prev, i.id]);
                          }} 
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-between gap-2 transition-all h-36
                            ${isSelected ? 'border-[#0565E6] bg-[#E8F1FF] text-[#0565E6]' : 'border-gray-100 bg-white text-gray-800 hover:border-gray-200'}`}
                        >
                          <div className="text-[40px]">{i.icon}</div>
                          <span className="text-[15px] font-black text-center leading-tight">{i.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP: Accessories */}
              {STEPS[currentStepIndex]?.id === 'accessories' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">7. Which original accessories do you have?</h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Select the accessories present with the laptop</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {accessoryOptions.map(i => {
                      const isSelected = accessories.includes(i.id);
                      return (
                        <button 
                          key={i.id} 
                          onClick={() => {
                            setAccessories(prev => prev.includes(i.id) ? prev.filter(x => x !== i.id) : [...prev, i.id]);
                          }} 
                          className={`p-6 rounded-[24px] border-2 text-left transition-all flex flex-col justify-between h-40 group
                            ${isSelected ? 'border-[#0565E6] bg-[#E8F1FF]' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="text-[40px]">{i.icon}</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                              ${isSelected ? 'border-[#0565E6] bg-[#0565E6]' : 'border-gray-300'}`}>
                              {isSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                            </div>
                          </div>
                          <div>
                            <p className={`font-black text-[15px] ${isSelected ? 'text-[#0565E6]' : 'text-[#111827]'}`}>{i.label}</p>
                            <p className="text-[15px] text-gray-600 font-bold mt-1">{i.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP: Device Age */}
              {STEPS[currentStepIndex]?.id === 'age' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-[#111827]">8. How old is your laptop?</h3>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mt-1">Age determines final multiplier value</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    {AGE_OPTIONS.map(opt => (
                      <button 
                        key={opt.key} 
                        onClick={() => setAge(opt.key)} 
                        className={`flex items-center gap-4 px-6 py-5 rounded-2xl border-[1.5px] font-semibold text-left transition-all w-full
                          ${age === opt.key ? 'border-[#0565E6] bg-[#0565E6]/5 text-[#0565E6]' : 'border-gray-100 text-gray-800 bg-white hover:border-gray-200'}`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                          ${age === opt.key ? 'border-[#0565E6]' : 'border-gray-300'}`}
                        >
                          {age === opt.key && (
                            <div className="w-3 h-3 rounded-full bg-[#0565E6]" />
                          )}
                        </div>
                        <span className="text-base font-bold">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stepper buttons row */}
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setCurrentStepIndex(prev => Math.max(prev - 1, 0))}
                  disabled={currentStepIndex === 0}
                  className="px-8 py-4 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  ← Back
                </button>
                
                {currentStepIndex < STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex(prev => prev + 1)}
                    disabled={
                      (STEPS[currentStepIndex]?.id === 'power' && powerStatus === null) ||
                      (STEPS[currentStepIndex]?.id === 'screenSize' && (
                        screenSize === null || 
                        hasGpu === null || 
                        (hasGpu === 'yes' && isGpuWorking === null)
                      ))
                    }
                    className="bg-[#0565E6] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#044BA8] transition-all disabled:opacity-50"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    onClick={handleGetBestPrice}
                    disabled={age === null}
                    className="bg-[#16A34A] text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-green-100 hover:bg-[#15803D] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    GET BEST PRICE <span className="text-lg">›</span>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Right Sidebar Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-8 space-y-8">
              <div className="bg-[#0565E6]/5 rounded-[32px] p-8 border border-[#0565E6]/20 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[#0565E6] text-xs font-black uppercase tracking-widest mb-1">Estimated Value</p>
                  <p className={`text-4xl font-black text-[#0452B9] tracking-tighter transition-all ${priceAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
                    {breakdown ? formatCurrency(currentPrice) : '₹ XX,XXX'}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                <h4 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-6">Summary</h4>
                <div className="space-y-5">
                   <SummaryItem label="Processor" value={specs.processor || '-'} active={true} />
                   <SummaryItem label="RAM" value={specs.ram || '-'} active={true} />
                   <SummaryItem label="Storage" value={specs.storage || '-'} active={true} />
                   <SummaryItem label="Power Status" value={powerStatus ? (powerStatus === 'on' ? 'Turns On' : 'Does Not Turn On') : '-'} active={powerStatus !== null} />
                   <SummaryItem label="Screen Size" value={screenSize ? SCREEN_SIZE_OPTIONS.find(o => o.key === screenSize)?.label : '-'} active={screenSize !== null} />
                   <SummaryItem label="Dedicated GPU" value={hasGpu ? (hasGpu === 'yes' ? `Yes (${isGpuWorking === 'yes' ? 'Working' : 'Not Working'})` : 'No') : '-'} active={hasGpu !== null} />
                   <SummaryItem label="Functional" value={issuesList.length > 0 ? `${issuesList.length} issue(s)` : currentStepIndex >= STEPS.findIndex(s => s.id === 'functional') ? 'No Issues' : '-'} active={currentStepIndex >= STEPS.findIndex(s => s.id === 'functional')} />
                   <SummaryItem label="Screen" value={screenIssuesList.length > 0 ? `${screenIssuesList.length} issue(s)` : currentStepIndex >= STEPS.findIndex(s => s.id === 'screen') ? 'No Issues' : '-'} active={currentStepIndex >= STEPS.findIndex(s => s.id === 'screen')} />
                   <SummaryItem label="Body" value={bodyIssuesList.length > 0 ? `${bodyIssuesList.length} issue(s)` : currentStepIndex >= STEPS.findIndex(s => s.id === 'body') ? 'No Issues' : '-'} active={currentStepIndex >= STEPS.findIndex(s => s.id === 'body')} />
                   <SummaryItem label="Accessories" value={accessories.length > 0 ? accessories.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') : currentStepIndex >= STEPS.findIndex(s => s.id === 'accessories') ? 'None' : '-'} active={currentStepIndex >= STEPS.findIndex(s => s.id === 'accessories')} />
                   <SummaryItem label="Age" value={age ? AGE_OPTIONS.find(o => o.key === age).label : '-'} active={currentStepIndex >= STEPS.findIndex(s => s.id === 'age')} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <LaptopSpecModal isOpen={isSpecsModalOpen} onClose={() => setIsSpecsModalOpen(false)} device={device} onComplete={handleSpecsUpdate} initialValues={specs} />
    </div>
  );
}

// --- SUB-COMPONENTS ---
function CheckboxRow({ label, checked }) {
  return (
    <label className="flex items-start gap-5 cursor-pointer group">
      <div className="relative mt-1">
        <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
        <div className="w-7 h-7 border-2 border-gray-200 rounded-xl peer-checked:bg-[#0565E6] peer-checked:border-[#0565E6] transition-all shadow-sm" />
        <svg className="absolute top-1.5 left-1.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <span className="text-sm font-bold text-gray-700 leading-relaxed group-hover:text-[#111827] transition-colors">{label}</span>
    </label>
  );
}

function EvaluationDetailRow({ label, value, color }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-black text-gray-600 uppercase tracking-widest">{label}</p>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-black text-[#111827]">{value || 'N/A'}</span>
      </div>
    </div>
  );
}

function SummaryPriceRow({ label, value, original, isFree }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-black text-gray-600 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3">
        {original && <span className="text-sm text-gray-400 font-bold line-through">₹{original}</span>}
        <span className={`font-black ${isFree ? 'text-[#0565E6]' : 'text-[#111827]'}`}>{isFree ? 'Free' : formatCurrency(value)}</span>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, active }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-[#111827]">{label}</h4>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#0565E6]' : 'bg-gray-300'}`} />
        <p className={`text-[13px] font-bold ${active ? 'text-gray-800' : 'text-gray-500'}`}>{value}</p>
      </div>
    </div>
  );
}