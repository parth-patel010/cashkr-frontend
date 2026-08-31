import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Smartphone, Palette, Camera, Battery, CircleDot, Wifi, Fingerprint, User,
  Volume2, Plug, Zap, Phone, Bluetooth, Vibrate, Mic, Radar, FileText, Package, Cable, Monitor,
} from 'lucide-react';
import { deviceService } from '../services/device.service';
import { valuationService } from '../services/valuation.service';
import { useQuote } from '../hooks/useQuote';
import { useAuth } from '../hooks/useAuth';
import { calculatePrice } from '../utils/priceCalculator';
import { formatCurrency } from '../utils/formatCurrency';
import { isSpecialModel } from '../utils/specialModels';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import NoIndexSEO from '../components/seo/NoIndexSEO';
import LaptopValuationModal, { VALUATION_DURATION_SEC } from '../components/LaptopValuationModal';
import { trackPhoneLead, trackPhoneInitiateCheckout } from '../utils/metaPixel';
import { setLoginContext } from '../utils/loginContext';
import { recordDeviceQuizOnce } from '../utils/recordDeviceQuiz';
import { reportLastQuizDevice } from '../utils/reportLastQuiz';
import { formatMobileQuizAnswerSummary } from '../utils/formatQuizAnswers';
import { buildAgentPriceLock } from '../utils/buildPriceLock';
import {
  MOBILE_STEPS,
  MOBILE_ACCESSORIES,
  MOBILE_PHYSICAL_ISSUES,
  MOBILE_TECHNICAL_ISSUES,
  MOBILE_AGE_OPTIONS,
  SCREEN_PHYSICAL_DETAIL_OPTIONS,
  PANEL_CONDITION_OPTIONS,
  BENT_CONDITION_OPTIONS,
  SCREEN_PHYSICAL_DETAIL_LABELS,
  PANEL_CONDITION_LABELS,
  BENT_CONDITION_LABELS,
  supportsESIM,
  toEsimPayload,
  fromEsimPayload,
} from '../data/quiz/mobileQuiz';

// --- Icons & Assets (Matching Screenshots) ---
const IconTrend = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);

const PHYSICAL_ICON_MAP = {
  glass_crack: Smartphone,
  screen_spot: Monitor,
  back_panel: Palette,
  panel_missing: Package,
  camera_glass_broken: Camera,
};

const TECHNICAL_ICON_MAP = {
  battery_service: Battery,
  front_camera: Camera,
  back_camera: Camera,
  volume_button: CircleDot,
  wifi_issue: Wifi,
  finger_touch: Fingerprint,
  face_unlock: User,
  speaker_faulty: Volume2,
  power_button: Plug,
  charging_port: Zap,
  audio_receiver: Phone,
  bluetooth: Bluetooth,
  vibrator: Vibrate,
  microphone: Mic,
  proximity_sensor: Radar,
  silent_button: CircleDot,
};

const ALL_STEPS = MOBILE_STEPS;
const ALL_ACCESSORIES = MOBILE_ACCESSORIES.map((a) => ({
  ...a,
  Icon: a.id === 'Bill' ? FileText : a.id === 'Box' ? Package : Cable,
}));
const PHYSICAL_ISSUES = MOBILE_PHYSICAL_ISSUES.map((i) => ({
  ...i,
  Icon: PHYSICAL_ICON_MAP[i.id] || Smartphone,
}));
const TECHNICAL_ISSUES = MOBILE_TECHNICAL_ISSUES.map((i) => ({
  ...i,
  Icon: TECHNICAL_ICON_MAP[i.id] || Smartphone,
}));
const AGE_OPTIONS = MOBILE_AGE_OPTIONS;

export default function ConditionQuizPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storage = searchParams.get('storage');
  const { updateQuote } = useQuote();
  const { isAuthenticated, user } = useAuth();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Derived: special models skip Age/Warranty step and Bill accessory
  const special = device ? isSpecialModel(device.brand, device.modelName) : false;
  const STEPS = special ? ALL_STEPS.filter(s => s.id !== 'warranty') : ALL_STEPS;
  const ACCESSORIES = special ? ALL_ACCESSORIES.filter(a => a.id !== 'Bill') : ALL_ACCESSORIES;
  
  // Selections (matching new requirements)
  const [deviceAge, setDeviceAge] = useState(null);
  const [underWarranty, setUnderWarranty] = useState(null);
  const [eSIMSupport, seteSIMSupport] = useState(null); // 'single' | 'dual'

  const [ableToMakeCalls, setAbleToMakeCalls] = useState(null);
  const [isTouchScreenWorking, setIsTouchScreenWorking] = useState(null);
  const [isScreenOriginal, setIsScreenOriginal] = useState(null);

  const [physicalIssues, setPhysicalIssues] = useState([]);
  const [technicalIssues, setTechnicalIssues] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [screenPhysicalDetail, setScreenPhysicalDetail] = useState(null);
  const [panelCondition, setPanelCondition] = useState(null);
  const [bentCondition, setBentCondition] = useState(null);

  // Special (out-of-warranty) models: no age/warranty quiz — persist as out of warranty
  useEffect(() => {
    if (!device || !isSpecialModel(device.brand, device.modelName)) return;
    setSelectedAccessories((prev) => prev.filter((a) => a !== 'Bill'));
    if (underWarranty !== false) setUnderWarranty(false);
    if (deviceAge !== 'Above 11 Months') setDeviceAge('Above 11 Months');
  }, [device, underWarranty, deviceAge]);

  const [showResult, setShowResult] = useState(false);
  const [priceAnimating, setPriceAnimating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);
  const [valuationOpen, setValuationOpen] = useState(false);
  const [valuationAgentStatus, setValuationAgentStatus] = useState('pending');
  const [valuationCached, setValuationCached] = useState(false);
  const [valuationQueuePos, setValuationQueuePos] = useState(0);
  const [valuationAgentBusy, setValuationAgentBusy] = useState(false);
  const [valuationError, setValuationError] = useState(null);
  const leadTrackedRef = useRef(false);
  const quizRestoredRef = useRef(false);
  const autoShowResultRef = useRef(false);

  const quizStorageKey = `devicekart_quiz_${slug}_${storage || 'default'}`;

  const getQuizReturnPath = () => {
    const params = storage ? `?storage=${encodeURIComponent(storage)}` : '';
    return `/sell-old-mobile-phones/${brand}/${slug}/quiz${params}`;
  };

  const buildMobileQuizReport = () => {
    const resolvedStorage = storage || device?.variants?.[0]?.storage || '';
    const resolvedAge = special ? 'Above 11 Months' : deviceAge;
    const resolvedWarranty = special ? false : underWarranty;
    const quizPayload = {
      slug: device.slug,
      storage: resolvedStorage,
      deviceAge: resolvedAge,
      ableToMakeCalls,
      isTouchScreenWorking,
      isScreenOriginal,
      underWarranty: resolvedWarranty,
      eSIMSupport: toEsimPayload(eSIMSupport),
      physicalIssues,
      technicalIssues,
      accessories: selectedAccessories,
      screenPhysicalDetail,
      panelCondition,
      bentCondition,
    };
    const answerSummary = formatMobileQuizAnswerSummary(quizPayload);
    return {
      category: 'mobile',
      brand: device.brand,
      modelName: device.modelName,
      slug: device.slug,
      storage: resolvedStorage,
      quizPath: getQuizReturnPath(),
      answerSummary,
      quizPayload,
      answers: quizPayload,
    };
  };

  const persistQuizState = (extra = {}) => {
    try {
      sessionStorage.setItem(quizStorageKey, JSON.stringify({
        currentStepIndex,
        deviceAge,
        underWarranty,
        eSIMSupport,
        ableToMakeCalls,
        isTouchScreenWorking,
        isScreenOriginal,
        physicalIssues,
        technicalIssues,
        selectedAccessories,
        screenPhysicalDetail,
        panelCondition,
        bentCondition,
        ...extra,
      }));
    } catch {
      // ignore storage errors
    }
  };

  const applySavedQuizState = (saved) => {
    if (saved.currentStepIndex != null) setCurrentStepIndex(saved.currentStepIndex);
    if (saved.deviceAge) setDeviceAge(saved.deviceAge);
    if (saved.underWarranty !== undefined) setUnderWarranty(saved.underWarranty);
    if (saved.ableToMakeCalls !== undefined) setAbleToMakeCalls(saved.ableToMakeCalls);
    if (saved.isTouchScreenWorking !== undefined) setIsTouchScreenWorking(saved.isTouchScreenWorking);
    if (saved.isScreenOriginal !== undefined) setIsScreenOriginal(saved.isScreenOriginal);
    if (saved.physicalIssues) setPhysicalIssues(saved.physicalIssues);
    if (saved.technicalIssues) setTechnicalIssues(saved.technicalIssues);
    if (saved.selectedAccessories) setSelectedAccessories(saved.selectedAccessories);
    if (saved.screenPhysicalDetail) setScreenPhysicalDetail(saved.screenPhysicalDetail);
    if (saved.panelCondition) setPanelCondition(saved.panelCondition);
    if (saved.bentCondition) setBentCondition(saved.bentCondition);
    if (saved.eSIMSupport) seteSIMSupport(fromEsimPayload(saved.eSIMSupport));
  };

  const redirectToLogin = (pendingShowResult = false) => {
    persistQuizState({ pendingShowResult });
    setLoginContext({
      category: 'mobile',
      brand: device?.brand || brand,
      modelName: device?.modelName || '',
      slug,
      storage: storage || '',
      quizPath: getQuizReturnPath(),
    });
    const returnUrl = encodeURIComponent(getQuizReturnPath());
    navigate(`/login?returnUrl=${returnUrl}`);
  };

  useEffect(() => {
    if (!showResult || !device || leadTrackedRef.current) return;
    leadTrackedRef.current = true;
    trackPhoneLead({
      brand: device.brand,
      modelName: device.modelName,
      value: breakdown?.finalPrice ?? currentPrice,
    });
  }, [showResult, device, breakdown, currentPrice]);

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
    } catch {
      // ignore
    }
  }, [isAuthenticated, device, quizStorageKey]);

  useEffect(() => {
    deviceService.getDevice(slug).then(res => {
      const dev = res.data;
      setDevice(dev);
      setLoading(false);
      recordDeviceQuizOnce(slug);
      const selectedVariant = dev.variants.find(v => v.storage === storage) || dev.variants[0];
      setCurrentPrice(selectedVariant.basePrice);
      
      if (!supportsESIM(dev.modelName)) {
        seteSIMSupport('single');
      }

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
        } catch {
          // ignore corrupt storage
        }
      }
    }).catch(() => setLoading(false));
  }, [slug, storage, quizStorageKey, isAuthenticated]);

  // Auto-set warranty to "No" (with no deduction) for devices older than 11 months
  useEffect(() => {
    if (deviceAge === 'Above 11 Months') {
      setUnderWarranty(false);
    }
  }, [deviceAge]);

  useEffect(() => {
    if (showResult || !device) return;
    const variant = device.variants.find(v => v.storage === storage) || device.variants[0];
    
    // Calculate new price based on user inputs
    const result = calculatePrice({
      brand: device.brand,
      modelName: device.modelName,
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
    selectedAccessories,
    showResult,
  ]);

  useEffect(() => {
    if (!autoShowResultRef.current || !isAuthenticated || !device) return;
    if (ableToMakeCalls == null || isTouchScreenWorking == null || isScreenOriginal == null) return;
    autoShowResultRef.current = false;
    runAgentValuation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, device, ableToMakeCalls, isTouchScreenWorking, isScreenOriginal]);

  const finalizeAgentValuation = (offerPrice, agentBreakdown = {}) => {
    const quizCtx = buildMobileQuizReport();
    const quoteValue = offerPrice;
    const priceBreakdown = {
      ...breakdown,
      ...agentBreakdown,
      quotedFinalPrice: quoteValue,
      priceSource: agentBreakdown.priceSource || 'agent_valuation',
    };
    setCurrentPrice(quoteValue);
    setBreakdown(priceBreakdown);
    updateQuote({
      device: {
        brand: device.brand,
        modelName: device.modelName,
        slug: device.slug,
        category: 'mobile',
        imageUrl: device.imageUrl || '',
        storage: storage || device.variants[0].storage,
        deviceAge: special ? 'Above 11 Months' : deviceAge,
        ableToMakeCalls,
        isTouchScreenWorking,
        isScreenOriginal,
        underWarranty: special ? false : underWarranty,
        hasGSTBill: selectedAccessories.includes('Bill'),
        eSIMSupport,
        physicalIssues,
        technicalIssues,
        accessories: selectedAccessories,
        screenPhysicalDetail,
        panelCondition,
        bentCondition,
        answerSummary: quizCtx.answerSummary,
      },
      priceBreakdown,
      price: quoteValue,
      priceLock: buildAgentPriceLock(quoteValue, {
        valuationRecordId: agentBreakdown.recordId,
        quizHash: agentBreakdown.quizHash,
      }),
    });
    if (!leadTrackedRef.current) {
      leadTrackedRef.current = true;
      trackPhoneLead({
        brand: device.brand,
        modelName: device.modelName,
        value: quoteValue,
      });
    }
    setLoginContext(quizCtx);
    reportLastQuizDevice(quizCtx);
    setValuationOpen(false);
    setShowResult(true);
  };

  const pollMobileValuation = async (recordId) => {
    // ~20 min max — queue can wait while higher-value jobs run first.
    for (let attempt = 0; attempt < 480; attempt += 1) {
      const { data } = await valuationService.getMobileStatus(recordId);
      setValuationAgentStatus(data.agentStatus);
      setValuationQueuePos(data.queuePosition || 0);
      setValuationAgentBusy(Boolean(data.agentBusy));
      setValuationCached(Boolean(data.cached));
      if (data.done) {
        if (data.success && data.ourOffer != null) return data;
        throw new Error(data.error || 'Could not fetch live valuation. Please try again.');
      }
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    throw new Error('Valuation is taking longer than expected. Please keep this tab open or try again in a moment.');
  };

  const runAgentValuation = async () => {
    if (!device) return;
    const quizCtx = buildMobileQuizReport();
    setValuationError(null);
    setValuationOpen(true);
    setValuationAgentStatus('pending');
    setValuationCached(false);
    setValuationQueuePos(0);
    const waitStartedAt = Date.now();
    const minWaitMs = (cached) => (cached ? 2800 : VALUATION_DURATION_SEC * 1000);
    const ensureMinWait = async (cached) => {
      const remaining = minWaitMs(cached) - (Date.now() - waitStartedAt);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
    };

    try {
      const { data: start } = await valuationService.submitMobileQuote({
        slug: device.slug,
        brand: device.brand,
        modelName: device.modelName,
        storage: quizCtx.storage,
        quizPayload: quizCtx.quizPayload,
        quizSummary: quizCtx.answerSummary,
      });

      setValuationAgentStatus(start.agentStatus || 'pending');
      setValuationQueuePos(start.queuePosition || 0);
      setValuationAgentBusy(Boolean(start.agentBusy));
      setValuationCached(Boolean(start.cached));

      let result = start;
      if (start.cached && start.ourOffer != null) {
        setValuationCached(true);
        setValuationAgentStatus('overridden');
        await ensureMinWait(true);
      } else {
        result = await pollMobileValuation(start.recordId);
        setValuationAgentStatus(result.agentStatus === 'overridden' ? 'overridden' : 'completed');
        await ensureMinWait(false);
      }

      finalizeAgentValuation(result.ourOffer, {
        cashifyEstimate: result.cashifyPrice,
        internalPrice: result.internalPrice,
        priceSource: start.cached ? 'valuation_cache' : 'agent_valuation',
        agentStatus: result.agentStatus,
        recordId: start.recordId || result.recordId,
        quizHash: start.quizHash || result.quizHash,
      });
    } catch (err) {
      setValuationError(err.response?.data?.message || err.message || 'Valuation failed');
      setValuationAgentStatus('failed');
    }
  };

  const handleValuationModalComplete = ({ failed } = {}) => {
    if (failed) {
      setValuationOpen(false);
      setValuationError(null);
    }
  };

  const handleGetBestPrice = () => {
    if (!isAuthenticated) {
      redirectToLogin(true);
      return;
    }
    runAgentValuation();
  };

  const handleSchedulePickup = () => {
    if (!leadTrackedRef.current) {
      leadTrackedRef.current = true;
      trackPhoneLead({
        brand: device.brand,
        modelName: device.modelName,
        value: breakdown?.finalPrice ?? currentPrice,
      });
    }
    trackPhoneInitiateCheckout({
      brand: device.brand,
      modelName: device.modelName,
      value: breakdown?.finalPrice ?? currentPrice,
    });
    if (!isAuthenticated) {
      setLoginContext({
        category: 'mobile',
        brand: device.brand,
        modelName: device.modelName,
        slug: device.slug,
        storage: storage || '',
        quizPath: getQuizReturnPath(),
      });
      navigate('/login?returnUrl=/schedule-pickup');
    } else {
      navigate('/schedule-pickup');
    }
  };

  useEffect(() => {
    if (showResult && !isAuthenticated && device) {
      redirectToLogin(true);
    }
  }, [showResult, isAuthenticated, device]);

  if (loading) return <Loader />;
  if (!device) return <div className="text-center py-20 text-gray-500">Device not found</div>;

  const valuationOverlay = (
    <LaptopValuationModal
      open={valuationOpen}
      agentStatus={valuationAgentStatus}
      cached={valuationCached}
      queuePosition={valuationQueuePos}
      agentBusy={valuationAgentBusy}
      error={valuationError}
      onComplete={handleValuationModalComplete}
      deviceKind="phone"
    />
  );

  if (showResult && !isAuthenticated) {
    return <Loader />;
  }

  // --- RESULT VIEW ---
  if (showResult) {
    return (
      <>
        {valuationOverlay}
      <div className="bg-[#F7F9FC] min-h-screen py-10 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Progress */}
          <div className="flex items-center justify-end gap-12 mb-10 text-sm font-bold">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">1</span>
              <span className="text-gray-900">Payment</span>
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
              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 p-8 sm:p-12 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-10">
                  <div className="w-40 h-40 bg-gray-50 rounded-2xl sm:rounded-[28px] flex items-center justify-center p-6">
                    <img 
                      src={device.imageUrl || "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"} 
                      alt={device.modelName}
                      className="max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-primary text-sm font-extrabold uppercase tracking-wider mb-2 block">Live market valuation</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
                      {device.modelName} ({storage || device.variants[0].storage})
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-4 mb-6">
                      <span className="text-5xl font-extrabold text-gray-900">{formatCurrency(currentPrice)}</span>
                      <div className="flex items-center gap-1.5 bg-primary-light text-primary px-3 py-1.5 rounded-xl border border-primary/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                        <span className="text-xs font-extrabold uppercase tracking-wider">Sales team touch</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        leadTrackedRef.current = false;
                        setShowResult(false);
                        setCurrentStepIndex(0);
                        setDeviceAge(special ? 'Above 11 Months' : null);
                        setUnderWarranty(special ? false : null);
                        seteSIMSupport(null);
                        setAbleToMakeCalls(null);
                        setIsTouchScreenWorking(null);
                        setIsScreenOriginal(null);
                        setPhysicalIssues([]);
                        setTechnicalIssues([]);
                        setScreenPhysicalDetail(null);
                        setPanelCondition(null);
                        setBentCondition(null);
                        setSelectedAccessories(special ? [] : []);
                        setBreakdown(null);
                        try {
                          sessionStorage.setItem(quizStorageKey, JSON.stringify({
                            currentStepIndex: 0,
                            pendingShowResult: false,
                          }));
                        } catch { /* ignore */ }
                      }}
                      className="text-primary font-extrabold text-sm underline underline-offset-8 hover:text-primary-dark transition-all"
                    >
                      Recalculate
                    </button>
                  </div>
                </div>

                <div className="mt-12 space-y-4 pt-10 border-t border-gray-50">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all" />
                      <svg className="absolute top-1 left-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 leading-relaxed group-hover:text-gray-900 transition-colors">
                      Receive updates via Whatsapp (+91 {user?.phone || '9076116803'})
                    </span>
                  </label>
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative mt-1">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-6 h-6 border-2 border-gray-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all" />
                      <svg className="absolute top-1 left-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-500 leading-relaxed group-hover:text-gray-900 transition-colors">
                      I agree to the <span className="text-primary font-bold">terms and conditions</span> of the service and understand that the final value of {formatCurrency(currentPrice)} is subject to physical device inspection by our technician at the time of pickup.
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSchedulePickup}
                  className="w-full mt-8 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(5,101,230,0.25)] text-base flex items-center justify-center gap-2"
                >
                  Get My {formatCurrency(currentPrice)} Now
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>

                <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 text-[13px] font-bold text-gray-400">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Free doorstep pickup
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Instant payment at pickup
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Provide Our Sales Team Suggestion or Human Touch ;)
                  </span>
                </div>
              </div>

              {/* Device Evaluation Summary */}
              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 p-10 shadow-sm">
                <h3 className="text-2xl font-extrabold text-gray-900 mb-10">Device Evaluation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {!special && <EvaluationRow label="Device Age" value={deviceAge} color="#0565E6" />}
                  {!special && <EvaluationRow label="Under Warranty" value={underWarranty ? 'Yes' : 'No'} color={underWarranty ? '#0565E6' : '#EF4444'} />}
                  {supportsESIM(device?.modelName) && (
                    <EvaluationRow label="eSIM Support" value={eSIMSupport === 'dual' ? 'Dual eSIM' : 'Single eSIM'} color={eSIMSupport === 'dual' ? '#EF4444' : '#0565E6'} />
                  )}
                  <EvaluationRow label="Calls Functional" value={ableToMakeCalls ? 'Yes' : 'No (Dead)'} color={ableToMakeCalls ? '#0565E6' : '#EF4444'} />
                  <EvaluationRow label="Touch Screen working" value={isTouchScreenWorking ? 'Yes' : 'No'} color={isTouchScreenWorking ? '#0565E6' : '#EF4444'} />
                  <EvaluationRow label="Screen Original" value={isScreenOriginal ? 'Yes' : 'No (Copy Screen)'} color={isScreenOriginal ? '#0565E6' : '#EF4444'} />
                  <EvaluationRow label="Physical Issues" value={physicalIssues.length > 0 ? physicalIssues.map((id) => PHYSICAL_ISSUES.find((i) => i.id === id)?.label || id).join(', ') : 'No Issues'} color={physicalIssues.length > 0 ? '#EF4444' : '#0565E6'} />
                  {screenPhysicalDetail && (
                    <EvaluationRow label="Screen Detail" value={SCREEN_PHYSICAL_DETAIL_LABELS[screenPhysicalDetail]} color="#EF4444" />
                  )}
                  {panelCondition && (
                    <EvaluationRow label="Panel Condition" value={PANEL_CONDITION_LABELS[panelCondition]} color={panelCondition === 'none' ? '#0565E6' : '#EF4444'} />
                  )}
                  {bentCondition && (
                    <EvaluationRow label="Bent / Loose" value={BENT_CONDITION_LABELS[bentCondition]} color={bentCondition === 'none' ? '#0565E6' : '#EF4444'} />
                  )}
                  <EvaluationRow label="Technical Issues" value={technicalIssues.length > 0 ? technicalIssues.join(', ') : 'No Issues'} color={technicalIssues.length > 0 ? '#EF4444' : '#0565E6'} />
                  <EvaluationRow label="Accessories" value={selectedAccessories.join(', ') || 'None'} color="#0565E6" />
                </div>
              </div>
            </div>

            {/* Sidebars */}
            <div className="w-full lg:w-96 space-y-6">
              {/* Payment Summary */}
              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">Payment Summary</h3>
                </div>
                <div className="space-y-6">
                  <PriceRow label="Base Price" value={breakdown?.basePrice} />
                  <PriceRow label="Pickup Fee" value={0} originalValue={100} isFree />
                  <PriceRow label="Processing Fee" value={0} originalValue={100} />
                  <PriceRow label="Promo Code" value={0} isBonus />
                  <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-extrabold text-gray-900">Final Offer</span>
                    <span className="text-2xl font-extrabold text-gray-900">{formatCurrency(currentPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Apply Coupon */}
              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 5V7M15 11V13M15 17V19M5 5C3.34315 5 2 6.34315 2 8V10C3.10457 10 4 10.8954 4 12C4 13.1046 3.10457 14 2 14V16C2 17.6569 3.34315 19 5 19H19C20.6569 19 22 17.6569 22 16V14C20.8954 14 20 13.1046 20 12C20 10.8954 20.8954 10 22 10V8C22 6.34315 20.6569 5 19 5H5Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Apply Coupon</h3>
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
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-primary transition-all"
                  />
                  <button className="bg-gray-100 text-gray-400 px-6 py-3.5 rounded-xl font-extrabold text-sm cursor-not-allowed">
                    Apply
                  </button>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/></svg>
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900">Cancellation Policy</h3>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  You can cancel your order anytime before the pickup is completed. Once the device is picked up and verified, the order cannot be cancelled. For any help, reach out to our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // --- QUIZ VIEW ---
  return (
    <>
      {valuationOverlay}
    <div className="bg-[#F7F9FC] min-h-[70vh] py-6 sm:py-10 px-4 sm:px-6">
      <NoIndexSEO title="Device Condition Quiz" path={`/sell-old-mobile-phones/${brand}/${slug}/quiz`} />
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-5 sm:gap-6">
        <div className="flex-1 space-y-5">
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
            <div className="p-5 sm:p-6 flex items-center gap-4 sm:gap-5 border-b border-[#E8EEF5] bg-[#F4F7FB]">
              <div className="w-16 h-20 sm:w-20 sm:h-24 bg-white rounded-xl border border-[#E8EEF5] flex items-center justify-center p-2 shrink-0">
                <img src={device.imageUrl || 'https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg'} alt={device.modelName} className="h-full object-contain" />
              </div>
              <div>
                <p className="text-primary text-[11px] font-bold uppercase tracking-wider mb-1">Evaluating</p>
                <h1 className="text-lg sm:text-2xl font-extrabold text-gray-900 leading-tight">
                  {device.modelName}{" "}
                  <span className="text-gray-400 font-semibold text-sm sm:text-base">
                    ({storage || device.variants[0].storage})
                  </span>
                </h1>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-b border-[#E8EEF5]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                {STEPS.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className={`text-[11px] sm:text-xs font-bold ${idx === currentStepIndex ? 'text-primary' : idx < currentStepIndex ? 'text-gray-600' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                    {idx < STEPS.length - 1 && <span className="text-gray-300 text-xs font-bold">&gt;</span>}
                  </div>
                ))}
              </div>
              <div className="h-1.5 w-full bg-[#E8EEF5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-5 sm:p-8 min-h-[380px] flex flex-col justify-between">
              <div>
                {/* STEP: Age & Warranty (shown only for non-special models) */}
                {STEPS[currentStepIndex]?.id === 'warranty' && (
                  <div className="space-y-10">
                    {/* Q1: Age */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">1. How old is your device?</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {AGE_OPTIONS.map(age => (
                          <button
                            key={age}
                            onClick={() => setDeviceAge(age)}
                            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                              ${deviceAge === age 
                                ? 'border-primary bg-primary-light text-primary' 
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                          >
                            {age}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Q2: Warranty */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">2. Is your device under manufacturer warranty?</h3>
                      {deviceAge === 'Above 11 Months' && (
                        <p className="text-xs text-amber-500 font-semibold -mt-2">Warranty is automatically set to No for devices older than 11 months.</p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => { if (deviceAge !== 'Above 11 Months') setUnderWarranty(true); }}
                          disabled={deviceAge === 'Above 11 Months'}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${underWarranty === true 
                              ? 'border-primary bg-primary-light text-primary' 
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
                              ? 'border-primary bg-primary-light text-primary' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}
                            ${deviceAge === 'Above 11 Months' ? 'cursor-not-allowed' : ''}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Q3: eSIM Support (Conditional) */}
                    {supportsESIM(device?.modelName) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">3. How many eSIMs does your device support?</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest -mt-2">Choose what applies to your device</p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => seteSIMSupport('single')}
                            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                              ${eSIMSupport === 'single'
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                          >
                            Single eSIM
                          </button>
                          <button
                            type="button"
                            onClick={() => seteSIMSupport('dual')}
                            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                              ${eSIMSupport === 'dual'
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                          >
                            Dual eSIM
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP: General & Screen */}
                {STEPS[currentStepIndex]?.id === 'screen' && (
                  <div className="space-y-10">
                    {/* Q1: Calls */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">1. Are you able to make and receive calls?</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setAbleToMakeCalls(true)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${ableToMakeCalls === true 
                              ? 'border-primary bg-primary-light text-primary' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setAbleToMakeCalls(false)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${ableToMakeCalls === false 
                              ? 'border-primary bg-primary-light text-primary' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          No (Dead)
                        </button>
                      </div>
                    </div>

                    {/* Q2: Touch Screen */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">2. Is your device's touch screen working properly?</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setIsTouchScreenWorking(true)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isTouchScreenWorking === true 
                              ? 'border-primary bg-primary-light text-primary' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setIsTouchScreenWorking(false)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isTouchScreenWorking === false 
                              ? 'border-primary bg-primary-light text-primary' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Q3: Original Screen */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-gray-900">3. Is your phone's screen original?</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setIsScreenOriginal(true)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isScreenOriginal === true 
                              ? 'border-primary bg-primary-light text-primary' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setIsScreenOriginal(false)}
                          className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                            ${isScreenOriginal === false 
                              ? 'border-primary bg-primary-light text-primary' 
                              : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                        >
                          No (Copy Screen)
                        </button>
                      </div>
                    </div>

                    {/* Q4: eSIM Support (Conditional for special models) */}
                    {special && supportsESIM(device?.modelName) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">4. How many eSIMs does your device support?</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest -mt-2">Choose what applies to your device</p>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => seteSIMSupport('single')}
                            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                              ${eSIMSupport === 'single'
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                          >
                            Single eSIM
                          </button>
                          <button
                            type="button"
                            onClick={() => seteSIMSupport('dual')}
                            className={`py-4 rounded-xl border-2 font-bold text-sm transition-all
                              ${eSIMSupport === 'dual'
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}
                          >
                            Dual eSIM
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP: Physical Issues */}
                {STEPS[currentStepIndex]?.id === 'physical' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Select screen / body defects (if any)</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Choose what applies to your device — leave unselected if none apply, then answer detail questions below
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {PHYSICAL_ISSUES.map(issue => {
                        const selected = physicalIssues.includes(issue.id);
                        const Icon = issue.Icon;
                        return (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => {
                              setPhysicalIssues((prev) => {
                                const next = prev.includes(issue.id)
                                  ? prev.filter((i) => i !== issue.id)
                                  : [...prev, issue.id];
                                if (!next.includes('glass_crack')) setScreenPhysicalDetail(null);
                                return next;
                              });
                            }}
                            className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[9rem]
                              ${selected
                                ? 'border-primary bg-primary-light'
                                : 'border-gray-100 bg-white hover:border-gray-200'}`}
                          >
                            <Icon size={28} strokeWidth={1.6} className={selected ? 'text-primary' : 'text-gray-500'} />
                            <div>
                              <p className={`font-extrabold text-sm ${selected ? 'text-primary' : 'text-gray-900'}`}>{issue.label}</p>
                              <p className="text-xs text-gray-400 mt-1">{issue.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <h4 className="text-base font-extrabold text-gray-900">Screen scratch / crack detail</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {physicalIssues.includes('glass_crack')
                          ? 'Required — choose one'
                          : 'Select “Broken/scratch on device screen” above to unlock this'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SCREEN_PHYSICAL_DETAIL_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            disabled={!physicalIssues.includes('glass_crack')}
                            onClick={() => setScreenPhysicalDetail(opt.key)}
                            className={`py-4 px-4 rounded-2xl border-2 font-bold text-sm text-left transition-all
                              ${!physicalIssues.includes('glass_crack') ? 'opacity-40 cursor-not-allowed' : ''}
                              ${screenPhysicalDetail === opt.key
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <h4 className="text-base font-extrabold text-gray-900">Side / back panel condition</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Required — choose one</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PANEL_CONDITION_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setPanelCondition(opt.key)}
                            className={`py-4 px-4 rounded-2xl border-2 font-bold text-sm text-left transition-all
                              ${panelCondition === opt.key
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <h4 className="text-base font-extrabold text-gray-900">Bent / loose screen</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Required — choose one</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BENT_CONDITION_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setBentCondition(opt.key)}
                            className={`py-4 px-4 rounded-2xl border-2 font-bold text-sm text-left transition-all
                              ${bentCondition === opt.key
                                ? 'border-primary bg-primary-light text-primary'
                                : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP: Technical Issues */}
                {STEPS[currentStepIndex]?.id === 'technical' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Select technical/hardware issues (if any)</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Leave unselected if none apply</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[360px] overflow-y-auto pr-2 no-scrollbar">
                      {TECHNICAL_ISSUES.map(issue => {
                        const selected = technicalIssues.includes(issue.id);
                        const Icon = issue.Icon;
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
                                ? 'border-primary bg-primary-light text-primary' 
                                : 'border-gray-50 bg-white text-gray-500 hover:border-gray-100'}`}
                          >
                            <Icon size={28} strokeWidth={1.6} className={selected ? 'text-primary' : 'text-gray-500'} />
                            <span className="text-xs font-bold leading-tight">{issue.label}</span>
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
                      <h3 className="text-lg font-bold text-gray-900">Which original accessories do you have?</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Deductions apply if unchecked</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {ACCESSORIES.map(acc => {
                        const selected = selectedAccessories.includes(acc.id);
                        const Icon = acc.Icon;
                        return (
                          <button
                            key={acc.id}
                            onClick={() => {
                              setSelectedAccessories(prev => 
                                prev.includes(acc.id) ? prev.filter(a => a !== acc.id) : [...prev, acc.id]
                              );
                            }}
                            className={`p-6 rounded-2xl border-2 text-left transition-all flex flex-col justify-between h-40 group
                              ${selected 
                                ? 'border-primary bg-primary-light' 
                                : 'border-gray-100 bg-white hover:border-gray-200'}`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <Icon size={28} strokeWidth={1.6} className={selected ? 'text-primary' : 'text-gray-500'} />
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                                ${selected ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                {selected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                              </div>
                            </div>
                            <div>
                              <p className={`font-extrabold text-sm ${selected ? 'text-primary' : 'text-gray-900'}`}>{acc.label}</p>
                              <p className="text-xs text-gray-400 mt-1">{acc.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-5 border-t border-[#E8EEF5]">
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex(prev => Math.max(prev - 1, 0))}
                  disabled={currentStepIndex === 0}
                  className="px-6 py-3.5 rounded-xl border border-[#E8EEF5] font-bold text-gray-500 hover:bg-[#F7F9FC] transition-all disabled:opacity-50"
                >
                  ← Back
                </button>

                {currentStepIndex < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(prev => prev + 1)}
                    disabled={
                      (STEPS[currentStepIndex]?.id === 'warranty' && (
                        deviceAge === null
                        || underWarranty === null
                        || (supportsESIM(device?.modelName) && eSIMSupport === null)
                      )) ||
                      (STEPS[currentStepIndex]?.id === 'screen' && (
                        ableToMakeCalls === null ||
                        isTouchScreenWorking === null ||
                        isScreenOriginal === null ||
                        (special && supportsESIM(device?.modelName) && eSIMSupport === null)
                      )) ||
                      (STEPS[currentStepIndex]?.id === 'physical' && (
                        (physicalIssues.includes('glass_crack') && screenPhysicalDetail === null)
                        || panelCondition === null
                        || bentCondition === null
                      ))
                    }
                    className="bg-primary text-white font-bold px-6 py-3.5 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 shadow-[0_4px_14px_rgba(5,101,230,0.25)]"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetBestPrice}
                    className="bg-primary text-white font-extrabold px-6 py-3.5 rounded-xl hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(5,101,230,0.25)] flex items-center justify-center gap-2"
                  >
                    Get Best Price →
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        <div className="w-full lg:w-[340px]">
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-5 sm:p-6 sticky top-24">
            <h2 className="text-lg font-extrabold text-gray-900 mb-5">Device Evaluation</h2>

            {/* Summary List */}
            <div className="space-y-6">
              {!special && <SummaryItem label="Device Age" value={deviceAge || 'Not answered'} active={deviceAge != null} />}
              {!special && <SummaryItem label="Warranty" value={underWarranty === null ? 'Not answered' : (underWarranty ? 'Under Warranty' : 'Out of Warranty')} active={underWarranty !== null} />}
              {supportsESIM(device?.modelName) && (
                <SummaryItem label="eSIM Support" value={eSIMSupport === null ? 'Not answered' : (eSIMSupport === 'dual' ? 'Dual eSIM' : 'Single eSIM')} active={eSIMSupport !== null} />
              )}
              <SummaryItem label="General & Screen" value={ableToMakeCalls === null ? 'Not answered' : `Calls: ${ableToMakeCalls ? 'Yes' : 'No'}, Touch: ${isTouchScreenWorking ? 'Yes' : 'No'}, Original: ${isScreenOriginal ? 'Yes' : 'No'}`} active={ableToMakeCalls !== null} />
              <SummaryItem
                label="Physical Issues"
                value={
                  STEPS.findIndex((s) => s.id === 'physical') > currentStepIndex
                    ? '-'
                    : [
                        physicalIssues.length ? `${physicalIssues.length} defects` : 'No multi-select defects',
                        screenPhysicalDetail ? SCREEN_PHYSICAL_DETAIL_LABELS[screenPhysicalDetail] : null,
                        panelCondition ? PANEL_CONDITION_LABELS[panelCondition] : null,
                        bentCondition ? BENT_CONDITION_LABELS[bentCondition] : null,
                      ].filter(Boolean).join(' · ')
                }
                active={STEPS.findIndex((s) => s.id === 'physical') <= currentStepIndex}
              />
              <SummaryItem label="Technical Issues" value={technicalIssues.length > 0 ? `${technicalIssues.length} issues selected` : 'No Issues'} active={STEPS.findIndex(s=>s.id==='technical') <= currentStepIndex} />
              <SummaryItem label="Accessories" value={selectedAccessories.length > 0 ? selectedAccessories.join(', ') : 'None selected'} active={STEPS.findIndex(s=>s.id==='accessories') <= currentStepIndex} />
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function SummaryItem({ label, value, active }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-bold text-gray-900">{label}</h4>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-primary' : 'bg-gray-200'}`} />
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
        <span className={`font-extrabold ${isFree || isBonus ? 'text-primary' : 'text-gray-900'}`}>
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
        <span className="font-extrabold text-gray-900">{value || 'N/A'}</span>
      </div>
    </div>
  );
}
