import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { deviceService } from '../services/device.service';
import { useQuote } from '../hooks/useQuote';
import { useAuth } from '../hooks/useAuth';
import { calculateLaptopPrice } from '../utils/priceCalculator';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/ui/Loader';
import LaptopSpecModal from '../components/LaptopSpecModal';
import Modal from '../components/ui/Modal';
import { setLoginContext } from '../utils/loginContext';

const STEPS = [
  { id: 'specs', label: 'Specs' },
  { id: 'age', label: 'Age' },
  { id: 'functional', label: 'Functional' },
  { id: 'screen', label: 'Screen' },
  { id: 'body', label: 'Body' },
  { id: 'accessories', label: 'Accessories' },
];

const AGE_OPTIONS = [
  { key: 'lessThan1', label: 'Less than 1 year (in warranty)' },
  { key: 'oneToTwo', label: 'Between 1 and 3 years' },
  { key: 'twoToThree', label: 'More than 3 years' },
];

export default function MacConditionQuizPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateQuote } = useQuote();
  const { isAuthenticated, user } = useAuth();

  const [specs, setSpecs] = useState(location.state?.specs);

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); 
  const [showResult, setShowResult] = useState(false);
  const autoShowResultRef = useRef(false);
  const quizRestoredRef = useRef(false);
  
  // Modals
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState(false);
  const [isScreenModalOpen, setIsScreenModalOpen] = useState(false);
  const [isBodyModalOpen, setIsBodyModalOpen] = useState(false);
  const [isAccessoriesModalOpen, setIsAccessoriesModalOpen] = useState(false);

  // Selections
  const [age, setAge] = useState(null);
  const [functionalIssues, setFunctionalIssues] = useState(null); 
  const [issuesList, setIssuesList] = useState([]);
  const [screenIssues, setScreenIssues] = useState(null);
  const [screenIssuesList, setScreenIssuesList] = useState([]);
  const [bodyIssues, setBodyIssues] = useState(null);
  const [bodyIssuesList, setBodyIssuesList] = useState([]);
  const [accessories, setAccessories] = useState([]);

  const [currentPrice, setCurrentPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);

  const quizStorageKey = `devicekart_mac_quiz_${slug}`;

  const getQuizReturnPath = () => `/sell-imac/${brand}/${slug}/quiz`;

  const persistQuizState = (extra = {}) => {
    try {
      sessionStorage.setItem(quizStorageKey, JSON.stringify({
        specs, age, functionalIssues, issuesList,
        screenIssues, screenIssuesList, bodyIssues, bodyIssuesList,
        accessories, currentStep,
        ...extra,
      }));
    } catch { /* ignore */ }
  };

  const applySavedQuizState = (saved) => {
    if (saved.specs) setSpecs(saved.specs);
    if (saved.age) setAge(saved.age);
    if (saved.functionalIssues) setFunctionalIssues(saved.functionalIssues);
    if (saved.issuesList) setIssuesList(saved.issuesList);
    if (saved.screenIssues) setScreenIssues(saved.screenIssues);
    if (saved.screenIssuesList) setScreenIssuesList(saved.screenIssuesList);
    if (saved.bodyIssues) setBodyIssues(saved.bodyIssues);
    if (saved.bodyIssuesList) setBodyIssuesList(saved.bodyIssuesList);
    if (saved.accessories) setAccessories(saved.accessories);
    if (saved.currentStep != null) setCurrentStep(saved.currentStep);
  };

  const redirectToLogin = (pendingShowResult = false) => {
    persistQuizState({ pendingShowResult });
    setLoginContext({
      category: 'mac',
      brand: device?.brand || brand,
      modelName: device?.modelName || '',
      slug,
      quizPath: getQuizReturnPath(),
    });
    const returnUrl = encodeURIComponent(getQuizReturnPath());
    navigate(`/login?returnUrl=${returnUrl}`);
  };

  useEffect(() => {
    if (!specs) {
      // Try to restore specs from session storage before redirecting
      try {
        const raw = sessionStorage.getItem(quizStorageKey);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.specs) {
            setSpecs(saved.specs);
            return;
          }
        }
      } catch { /* ignore */ }
      navigate(`/sell-imac/${brand}/${slug}`, { replace: true });
      return;
    }
    deviceService.getDevice(slug).then(res => {
      const dev = res.data;
      setDevice(dev);
      setLoading(false);

      if (!quizRestoredRef.current) {
        quizRestoredRef.current = true;
        try {
          const raw = sessionStorage.getItem(quizStorageKey);
          if (raw) {
            const saved = JSON.parse(raw);
            applySavedQuizState(saved);
            if (saved.pendingShowResult && isAuthenticated) {
              persistQuizState({ ...saved, pendingShowResult: false });
              autoShowResultRef.current = true;
            }
          }
        } catch { /* ignore */ }
      }
    }).catch(() => setLoading(false));
  }, [slug, specs, navigate, brand, quizStorageKey, isAuthenticated]);

  // Restore quiz state after login
  useEffect(() => {
    if (!isAuthenticated || !device) return;
    try {
      const raw = sessionStorage.getItem(quizStorageKey);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.pendingShowResult) {
        applySavedQuizState(saved);
        persistQuizState({ ...saved, pendingShowResult: false });
        autoShowResultRef.current = true;
      }
    } catch { /* ignore */ }
  }, [isAuthenticated, device, quizStorageKey]);

  useEffect(() => {
    if (!device || !specs) return;
    const result = calculateLaptopPrice(device, {
      ...specs,
      yearBracket: age,
      functionalIssues: issuesList,
      screenIssues: screenIssuesList,
      bodyIssues: bodyIssuesList,
      accessories: accessories.length > 0 ? accessories : ['none']
    });
    if (result) {
      setCurrentPrice(result.finalPrice);
      setBreakdown(result);
    }
  }, [device, specs, age, issuesList, screenIssuesList, bodyIssuesList, accessories]);

  // Auto-show result after login redirect
  useEffect(() => {
    if (!autoShowResultRef.current || !breakdown || !isAuthenticated || !device) return;
    autoShowResultRef.current = false;
    updateQuote({
      device: {
        ...device,
        category: 'mac',
        brand,
        modelName: device.modelName,
        slug,
        ...specs,
        deviceAge: AGE_OPTIONS.find(o => o.key === age)?.label || age,
        yearBracket: age,
        functionalIssues: issuesList,
        screenIssues: screenIssuesList,
        bodyIssues: bodyIssuesList,
        accessories
      },
      priceBreakdown: breakdown,
      price: currentPrice
    });
    setShowResult(true);
  }, [breakdown, isAuthenticated, device, currentPrice, specs, age, issuesList, screenIssuesList, bodyIssuesList, accessories, updateQuote, brand, slug]);

  const handleSpecsUpdate = (newSpecs) => {
    setSpecs(newSpecs);
    setIsSpecsModalOpen(false);
  };

  const handleFunctionalSelect = (val) => {
    if (val === 'yes') setIsIssuesModalOpen(true);
    else {
      setFunctionalIssues('no');
      setIssuesList([]);
      if (currentStep === 2) setCurrentStep(3);
    }
  };

  const handleIssuesFinish = (list) => {
    setFunctionalIssues(list.length > 0 ? 'yes' : 'no');
    setIssuesList(list);
    setIsIssuesModalOpen(false);
    if (currentStep === 2) setCurrentStep(3);
  };

  const handleIssuesModalClose = () => {
    setIsIssuesModalOpen(false);
    if (issuesList.length === 0) setFunctionalIssues('no');
  };

  const handleScreenSelect = (val) => {
    if (val === 'yes') setIsScreenModalOpen(true);
    else {
      setScreenIssues('no');
      setScreenIssuesList([]);
      if (currentStep === 3) setCurrentStep(4);
    }
  };

  const handleScreenFinish = (list) => {
    setScreenIssues(list.length > 0 ? 'yes' : 'no');
    setScreenIssuesList(list);
    setIsScreenModalOpen(false);
    if (currentStep === 3) setCurrentStep(4);
  };

  const handleScreenModalClose = () => {
    setIsScreenModalOpen(false);
    if (screenIssuesList.length === 0) setScreenIssues('no');
  };

  const handleBodySelect = (val) => {
    if (val === 'yes') setIsBodyModalOpen(true);
    else {
      setBodyIssues('no');
      setBodyIssuesList([]);
      setIsAccessoriesModalOpen(true);
      if (currentStep === 4) setCurrentStep(5);
    }
  };

  const handleBodyFinish = (list) => {
    setBodyIssues(list.length > 0 ? 'yes' : 'no');
    setBodyIssuesList(list);
    setIsBodyModalOpen(false);
    setIsAccessoriesModalOpen(true);
    if (currentStep === 4) setCurrentStep(5);
  };

  const handleBodyModalClose = () => {
    setIsBodyModalOpen(false);
    if (bodyIssuesList.length === 0) setBodyIssues('no');
  };

  const handleAccessoriesFinish = (list) => {
    setAccessories(list);
    setIsAccessoriesModalOpen(false);
    
    if (!isAuthenticated) {
      redirectToLogin(true);
      return;
    }

    const ageLabel = AGE_OPTIONS.find(o => o.key === age)?.label || age;
    
    updateQuote({
      device: {
        ...device,
        category: 'mac',
        brand,
        modelName: device.modelName,
        slug,
        ...specs,
        deviceAge: ageLabel,
        yearBracket: age,
        functionalIssues: issuesList,
        screenIssues: screenIssuesList,
        bodyIssues: bodyIssuesList,
        accessories: list
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
  if (!device) return <div className="text-center py-20 font-black text-gray-400">Device not found</div>;

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
                      {device.modelName} {specs.ram && specs.storage && <span className="text-gray-400 font-medium text-sm">({specs.ram}/{specs.storage})</span>}
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

                <div className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-4 text-[13px] font-black text-gray-400">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Free doorstep pickup</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Instant payment at pickup</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#0565E6]" /> Price locked for 24h</span>
                </div>
              </div>

              {/* Evaluation Detail */}
              <div className="bg-white rounded-[40px] border border-gray-100 p-12 shadow-sm">
                <h3 className="text-2xl font-black text-[#111827] mb-12">iMac Evaluation Detail</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                   <EvaluationDetailRow label="Device" value={device.modelName} color="#0565E6" />
                   <EvaluationDetailRow label="Device Age" value={age ? AGE_OPTIONS.find(o => o.key === age).label : '-'} color="#0565E6" />
                   <EvaluationDetailRow label="Functional Issues" value={issuesList.length > 0 ? issuesList.length + ' issue(s)' : 'No Issues'} color={issuesList.length > 0 ? '#EF4444' : '#0565E6'} />
                   <EvaluationDetailRow label="Screen Condition" value={screenIssuesList.length > 0 ? screenIssuesList.length + ' issue(s)' : 'No Issues'} color={screenIssuesList.length > 0 ? '#EF4444' : '#0565E6'} />
                   <EvaluationDetailRow label="Body Condition" value={bodyIssuesList.length > 0 ? bodyIssuesList.length + ' issue(s)' : 'No Issues'} color={bodyIssuesList.length > 0 ? '#EF4444' : '#0565E6'} />
                   <EvaluationDetailRow label="Accessories" value={accessories.length > 0 ? accessories.join(', ') : 'None'} color="#0565E6" />
                </div>
              </div>
            </div>

            {/* Sidebars */}
            <div className="w-full lg:w-[400px] space-y-8">
              <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
                 <h3 className="text-xl font-black text-[#111827] mb-8">Offer Summary</h3>
                 <div className="space-y-6">
                    <SummaryPriceRow label="Base Price" value={breakdown?.basePrice} />
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
                 <p className="text-gray-400 text-sm font-bold leading-relaxed">
                   Our technician will verify the iMac/Mac at your doorstep. Please ensure the iMac/Mac is charged and all data is backed up. Payment is instant.
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
          <div className="flex-1 space-y-8">
            <EvaluationStepCard title="1. Select Device Specs ?" active={true}>
               <button onClick={() => setIsSpecsModalOpen(true)} className="px-6 py-2 rounded-full border-[1.5px] border-gray-100 text-sm font-black text-gray-500 hover:bg-gray-50 transition-colors">Modify</button>
            </EvaluationStepCard>
            <EvaluationStepCard title="Age of your device" active={currentStep >= 1}>
               <p className="text-sm text-gray-500 mb-6 font-medium">
                 Let us know how old is your device. Valid bill is needed for devices less than 3 years.
               </p>
               <div className="flex flex-col gap-4">
                 {AGE_OPTIONS.map(opt => (
                   <button 
                     key={opt.key} 
                     onClick={() => { setAge(opt.key); if(currentStep === 1) setCurrentStep(2); }} 
                     className={`flex items-center gap-4 px-6 py-5 rounded-2xl border-[1.5px] font-semibold text-left transition-all w-full
                       ${age === opt.key ? 'border-[#0565E6] bg-[#0565E6]/5 text-[#0565E6]' : 'border-gray-100 text-gray-700 bg-white hover:border-gray-200'}`}
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
            </EvaluationStepCard>
            <EvaluationStepCard title="3. Any functional problems?" active={currentStep >= 2}>
               <div className="grid grid-cols-2 gap-4">
                 {['Yes', 'No'].map(v => (
                   <button key={v} onClick={() => handleFunctionalSelect(v.toLowerCase())} className={`py-5 rounded-2xl border-[1.5px] font-black transition-all ${((functionalIssues === 'yes' && v === 'Yes') || (functionalIssues === 'no' && v === 'No')) ? 'border-[#0565E6] bg-[#0565E6]/5 text-[#0565E6]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>{v}</button>
                 ))}
               </div>
            </EvaluationStepCard>
            <EvaluationStepCard title="4. Any screen issues?" active={currentStep >= 3}>
               <div className="grid grid-cols-2 gap-4">
                 {['Yes', 'No'].map(v => (
                   <button key={v} onClick={() => handleScreenSelect(v.toLowerCase())} className={`py-5 rounded-2xl border-[1.5px] font-black transition-all ${((screenIssues === 'yes' && v === 'Yes') || (screenIssues === 'no' && v === 'No')) ? 'border-[#0565E6] bg-[#0565E6]/5 text-[#0565E6]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>{v}</button>
                 ))}
               </div>
            </EvaluationStepCard>
            <EvaluationStepCard title="5. Any body damage?" active={currentStep >= 4}>
               <div className="grid grid-cols-2 gap-4">
                 {['Yes', 'No'].map(v => (
                   <button key={v} onClick={() => handleBodySelect(v.toLowerCase())} className={`py-5 rounded-2xl border-[1.5px] font-black transition-all ${((bodyIssues === 'yes' && v === 'Yes') || (bodyIssues === 'no' && v === 'No')) ? 'border-[#0565E6] bg-[#0565E6]/5 text-[#0565E6]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}>{v}</button>
                 ))}
               </div>
            </EvaluationStepCard>
          </div>
          <div className="w-full lg:w-[450px]">
            <div className="sticky top-8 space-y-8">
              <div className="relative">
                <div className="bg-[#0565E6]/5 rounded-[32px] p-8 border border-[#0565E6]/20 shadow-sm flex items-center justify-between transition-all">
                  <div>
                    <p className="text-[#0565E6] text-xs font-black uppercase tracking-widest mb-1">Estimated Value</p>
                    <p className="text-4xl font-black text-[#0452B9] tracking-tighter">
                      {breakdown ? formatCurrency(currentPrice) : '₹ XX,XXX'}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">Updates as you answer</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm space-y-8">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Summary</h4>
                <div className="space-y-5">
                   <SummaryItem label="Age" value={age ? AGE_OPTIONS.find(o => o.key === age).label : '-'} />
                   <SummaryItem label="Functional" value={issuesList.length > 0 ? `${issuesList.length} issue(s)` : functionalIssues === 'no' ? 'No Issues' : '-'} />
                   <SummaryItem label="Screen" value={screenIssuesList.length > 0 ? `${screenIssuesList.length} issue(s)` : screenIssues === 'no' ? 'No Issues' : '-'} />
                   <SummaryItem label="Body" value={bodyIssuesList.length > 0 ? `${bodyIssuesList.length} issue(s)` : bodyIssues === 'no' ? 'No Issues' : '-'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LaptopSpecModal isOpen={isSpecsModalOpen} onClose={() => setIsSpecsModalOpen(false)} device={device} onComplete={handleSpecsUpdate} initialValues={specs} />
      <IssuesModal isOpen={isIssuesModalOpen} onClose={handleIssuesModalClose} onFinish={handleIssuesFinish} initialList={issuesList} />
      <ScreenIssuesModal isOpen={isScreenModalOpen} onClose={handleScreenModalClose} onFinish={handleScreenFinish} initialList={screenIssuesList} />
      <BodyIssuesModal isOpen={isBodyModalOpen} onClose={handleBodyModalClose} onFinish={handleBodyFinish} initialList={bodyIssuesList} />
      <AccessoriesModal isOpen={isAccessoriesModalOpen} onClose={() => setIsAccessoriesModalOpen(false)} onFinish={handleAccessoriesFinish} initialList={accessories} />
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
      <span className="text-sm font-bold text-gray-500 leading-relaxed group-hover:text-[#111827] transition-colors">{label}</span>
    </label>
  );
}

function EvaluationDetailRow({ label, value, color }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
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
      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3">
        {original && <span className="text-sm text-gray-300 line-through">₹{original}</span>}
        <span className={`font-black ${isFree ? 'text-[#0565E6]' : 'text-[#111827]'}`}>{isFree ? 'Free' : formatCurrency(value)}</span>
      </div>
    </div>
  );
}

function IssuesModal({ isOpen, onClose, onFinish, initialList }) {
  const [selected, setSelected] = useState(initialList || []);
  const issues = [
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
  const toggle = (id) => selected.includes(id) ? setSelected(selected.filter(i => i !== id)) : setSelected([...selected, id]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Functional Issues" size="5xl">
       <p className="text-[13px] text-gray-500 font-bold mb-6">Select all issues that apply. Each issue reduces the price by the shown percentage.</p>
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{issues.map(i => (
         <button key={i.id} onClick={() => toggle(i.id)} className={`p-5 rounded-3xl border-[1.5px] flex flex-col items-center gap-3 transition-all relative ${selected.includes(i.id) ? 'border-[#0565E6] bg-[#0565E6]/5' : 'border-gray-100 bg-white'}`}>
           <div className="text-2xl">{i.icon}</div>
           <span className="text-[11px] font-black text-center leading-tight">{i.label}</span>
           <span className="text-[9px] font-black text-red-400">{i.pct}</span>
         </button>
       ))}</div>
       <button onClick={() => onFinish(selected)} className="w-full mt-8 py-4 bg-[#0565E6] text-white rounded-2xl font-black">Proceed</button>
    </Modal>
  );
}

function ScreenIssuesModal({ isOpen, onClose, onFinish, initialList }) {
  const [selected, setSelected] = useState(initialList || []);
  const issues = [
    { id: 'screenCracked', label: 'Screen cracked or broken', icon: '💔', pct: '18%' },
    { id: 'lineDiscolour', label: 'Line, discolouration or spot', icon: '🖥️', pct: '18%' },
  ];
  const toggle = (id) => selected.includes(id) ? setSelected(selected.filter(i => i !== id)) : setSelected([...selected, id]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Screen Condition" size="3xl">
       <p className="text-[13px] text-gray-500 font-bold mb-6">Select any screen issues that apply.</p>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{issues.map(i => (
         <button key={i.id} onClick={() => toggle(i.id)} className={`p-8 rounded-3xl border-[1.5px] flex flex-col items-center gap-4 transition-all ${selected.includes(i.id) ? 'border-[#0565E6] bg-[#0565E6]/5' : 'border-gray-100 bg-white'}`}>
           <div className="text-3xl">{i.icon}</div>
           <span className="text-sm font-black text-center">{i.label}</span>
           <span className="text-[10px] font-black text-red-400">{i.pct}</span>
         </button>
       ))}</div>
       <button onClick={() => onFinish(selected)} className="w-full mt-8 py-4 bg-[#0565E6] text-white rounded-2xl font-black">Proceed</button>
    </Modal>
  );
}

function BodyIssuesModal({ isOpen, onClose, onFinish, initialList }) {
  const [selected, setSelected] = useState(initialList || []);
  const issues = [
    { id: 'minorDentTop', label: 'Minor dent on top panel', icon: '📱', pct: '8%' },
    { id: 'minorDentBase', label: 'Minor dent on base panel', icon: '📱', pct: '8%' },
    { id: 'majorDentTop', label: 'Major dent on top panel', icon: '💥', pct: '35%' },
    { id: 'majorDentBase', label: 'Major dent on base panel', icon: '💥', pct: '40%' },
    { id: 'minorScratch', label: 'Minor scratch on body', icon: '✨', pct: '5%' },
    { id: 'majorScratch', label: 'Major scratch on body', icon: '🔪', pct: '8%' },
  ];
  const toggle = (id) => selected.includes(id) ? setSelected(selected.filter(i => i !== id)) : setSelected([...selected, id]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Body Condition" size="4xl">
       <p className="text-[13px] text-gray-500 font-bold mb-6">Select all body damage issues that apply.</p>
       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{issues.map(i => (
         <button key={i.id} onClick={() => toggle(i.id)} className={`p-6 rounded-3xl border-[1.5px] flex flex-col items-center gap-3 transition-all ${selected.includes(i.id) ? 'border-[#0565E6] bg-[#0565E6]/5' : 'border-gray-100 bg-white'}`}>
           <div className="text-2xl">{i.icon}</div>
           <span className="text-[11px] font-black text-center leading-tight">{i.label}</span>
           <span className="text-[10px] font-black text-red-400">{i.pct}</span>
         </button>
       ))}</div>
       <button onClick={() => onFinish(selected)} className="w-full mt-8 py-4 bg-[#0565E6] text-white rounded-2xl font-black">Proceed</button>
    </Modal>
  );
}

function AccessoriesModal({ isOpen, onClose, onFinish, initialList }) {
  const [selected, setSelected] = useState(initialList || []);
  const items = [{ id: 'bill', label: 'Bill', icon: '📄' }, { id: 'box', label: 'Box', icon: '📦' }, { id: 'charger', label: 'Charger', icon: '🔌' }];
  const toggle = (id) => selected.includes(id) ? setSelected(selected.filter(i => i !== id)) : setSelected([...selected, id]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Accessories" size="3xl">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">{items.map(i => (<button key={i.id} onClick={() => toggle(i.id)} className={`p-8 rounded-[24px] border-[1.5px] flex flex-col items-center gap-4 transition-all ${selected.includes(i.id) ? 'border-[#0565E6] bg-[#0565E6]/5' : 'border-gray-100 bg-white'}`}><div className="text-3xl">{i.icon}</div><span className="text-xs font-black">{i.label}</span></button>))}</div>
       <button onClick={() => onFinish(selected)} className="w-full py-5 bg-[#0565E6] text-white rounded-[20px] font-black text-lg shadow-xl shadow-[#0565E6]/30">GET BEST PRICE →</button>
    </Modal>
  );
}

function SummaryItem({ label, value }) {
  return (<div className="flex justify-between items-center group"><span className="text-sm font-bold text-gray-800">{label}</span><span className={`text-sm font-black ${value === '-' ? 'text-gray-300' : 'text-[#111827]'}`}>{value}</span></div>);
}

function EvaluationStepCard({ title, active, children }) {
  return (<div className={`bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm transition-all duration-500 ${active ? 'ring-2 ring-[#0565E6]/20 scale-[1.01]' : 'opacity-30 pointer-events-none'}`}><h3 className="text-base font-black text-[#111827] mb-4">{title}</h3>{children}</div>);
}
