import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ThumbsUp, ThumbsDown, Package, FileText, Cable, ArrowRight, Calendar, AlertTriangle, Check, X,
} from 'lucide-react';
import { deviceService } from '../services/device.service';
import { useQuote } from '../hooks/useQuote';
import { useAuth } from '../hooks/useAuth';
import { calculateCategoryQuizPrice } from '../utils/categoryQuizPrice';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/ui/Loader';
import PageCanvas from '../components/layout/PageCanvas';
import { recordDeviceQuizOnce } from '../utils/recordDeviceQuiz';
import { setLoginContext } from '../utils/loginContext';
import { reportLastQuizDevice } from '../utils/reportLastQuiz';
import { formatCategoryQuizAnswerSummary } from '../utils/formatQuizAnswers';
import {
  DEFAULT_EARBUDS_QUIZ,
  EARBUDS_OPTION_DETAILS,
} from '../data/earbudsQuizDefaults';

const ACCESSORY_ICONS = {
  acc_box: Package,
  acc_case: Package,
  acc_cable: Cable,
  acc_bill: FileText,
};

const REQUIRED_WINDOW_IDS = ['power', 'voice_mic', 'connectivity', 'physical', 'accessories', 'age'];

function resolveEarbudsQuiz(apiQuiz) {
  const windows = apiQuiz?.windows;
  if (!Array.isArray(windows) || windows.length < REQUIRED_WINDOW_IDS.length) {
    return DEFAULT_EARBUDS_QUIZ;
  }
  const ids = new Set(windows.map((w) => w.id));
  if (!REQUIRED_WINDOW_IDS.every((id) => ids.has(id))) {
    return DEFAULT_EARBUDS_QUIZ;
  }
  return apiQuiz;
}

function personalizeQuestion(text, modelName) {
  if (!text) return text;
  return String(text)
    .replace(/Your Device/gi, `Your ${modelName}`)
    .replace(/your device/gi, `your ${modelName}`)
    .replace(/Device/g, modelName);
}

export default function EarbudsConditionQuizPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storage = searchParams.get('storage');
  const { updateQuote } = useQuote();
  const { isAuthenticated, user } = useAuth();

  const [device, setDevice] = useState(null);
  const [quiz, setQuiz] = useState(DEFAULT_EARBUDS_QUIZ);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);

  const windows = quiz?.windows?.length ? quiz.windows : DEFAULT_EARBUDS_QUIZ.windows;
  const step = windows[stepIndex];
  const modelName = device?.modelName || 'Device';

  const basePrice = useMemo(() => {
    if (!device) return 0;
    const variant = device.variants?.find((v) => v.storage === storage) || device.variants?.[0];
    return variant?.basePrice || 0;
  }, [device, storage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [devRes, quizRes] = await Promise.all([
          deviceService.getDevice(slug),
          deviceService.getCategoryQuiz('earbuds').catch(() => null),
        ]);
        if (cancelled) return;
        const dev = devRes.data;
        setDevice(dev);
        recordDeviceQuizOnce(slug);
        if (quizRes?.data) setQuiz(resolveEarbudsQuiz(quizRes.data));
        const variant = dev.variants?.find((v) => v.storage === storage) || dev.variants?.[0];
        setCurrentPrice(variant?.basePrice || 0);
      } catch {
        if (!cancelled) setDevice(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, storage]);

  const normalizedAnswers = useMemo(() => {
    const a = { ...answers };
    const accessoriesIdx = windows.findIndex((w) => w.id === 'accessories');
    if (accessoriesIdx >= 0 && stepIndex >= accessoriesIdx && !('accessories' in a)) {
      a.accessories = [];
    }
    if (showResult && !('accessories' in a)) a.accessories = [];
    return a;
  }, [answers, stepIndex, windows, showResult]);

  useEffect(() => {
    if (!device || !quiz) return;
    const result = calculateCategoryQuizPrice({
      basePrice,
      quiz,
      answers: normalizedAnswers,
      deviceSlug: device.slug,
    });
    setCurrentPrice(result.finalPrice);
    setBreakdown(result);
  }, [device, quiz, normalizedAnswers, basePrice]);

  const setSingle = (windowId, optionId) => {
    setAnswers((a) => ({ ...a, [windowId]: optionId }));
  };

  const toggleMulti = (windowId, optionId) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[windowId]) ? a[windowId] : [];
      const next = cur.includes(optionId)
        ? cur.filter((id) => id !== optionId)
        : [...cur, optionId];
      return { ...a, [windowId]: next };
    });
  };

  const powerRejected = normalizedAnswers.power === 'power_no';
  const accessories = Array.isArray(normalizedAnswers.accessories)
    ? normalizedAnswers.accessories
    : [];
  const hasBoxOrBill = accessories.includes('acc_box') || accessories.includes('acc_bill');

  const canContinue = () => {
    if (!step) return false;
    if (step.id === 'power' && powerRejected) return false;
    if (step.choiceType === 'single') return Boolean(answers[step.id]);
    if (step.id === 'accessories') return hasBoxOrBill;
    return true;
  };

  const buildQuizCtx = (finalAnswers = null) => {
    const answers = finalAnswers || {
      ...normalizedAnswers,
      accessories: normalizedAnswers.accessories || [],
    };
    return {
      category: 'earbuds',
      brand: device.brand,
      modelName: device.modelName,
      slug: device.slug,
      storage: storage || device.variants?.[0]?.storage || '',
      quizPath: `/sell/earbuds/${encodeURIComponent(String(brand || device.brand || '').toLowerCase())}/${device.slug}/quiz`,
      answers,
      answerSummary: formatCategoryQuizAnswerSummary(quiz, answers),
    };
  };

  const handleGetBestPrice = () => {
    const finalAnswers = {
      ...normalizedAnswers,
      accessories: normalizedAnswers.accessories || [],
    };
    const result = calculateCategoryQuizPrice({
      basePrice,
      quiz,
      answers: finalAnswers,
      deviceSlug: device.slug,
    });
    const quizCtx = buildQuizCtx(finalAnswers);
    updateQuote({
      device: {
        brand: device.brand,
        modelName: device.modelName,
        slug: device.slug,
        category: 'earbuds',
        imageUrl: device.imageUrl || '',
        storage: quizCtx.storage,
        quizAnswers: finalAnswers,
        answerSummary: quizCtx.answerSummary,
      },
      priceBreakdown: result,
    });
    setLoginContext(quizCtx);
    if (isAuthenticated) reportLastQuizDevice(quizCtx);
    setCurrentPrice(result.finalPrice);
    setBreakdown(result);
    setShowResult(true);
  };

  const handleContinue = () => {
    if (!canContinue()) return;
    if (stepIndex < windows.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    handleGetBestPrice();
  };

  const handleSchedulePickup = () => {
    const quizCtx = buildQuizCtx();
    setLoginContext(quizCtx);
    if (isAuthenticated) reportLastQuizDevice(quizCtx);
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/schedule-pickup');
    } else {
      navigate('/schedule-pickup');
    }
  };

  if (loading) return <Loader />;
  if (!device) {
    return (
      <PageCanvas>
        <div className="text-center py-20 text-gray-500 font-semibold">Device not found</div>
      </PageCanvas>
    );
  }

  if (showResult) {
    return (
      <PageCanvas>
        <div className="max-w-4xl mx-auto py-8 sm:py-12">
          <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 p-6 sm:p-10 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="w-36 h-36 bg-gray-50 rounded-2xl flex items-center justify-center p-4">
                <img
                  src={device.imageUrl || '/category_assets/buy/audio_devices.png'}
                  alt={device.modelName}
                  className="max-h-full object-contain"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-primary text-sm font-extrabold uppercase tracking-wider mb-2 block">
                  Offer ready — instant payout
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">
                  {device.modelName}
                </h1>
                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                  {formatCurrency(currentPrice)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowResult(false);
                    setStepIndex(0);
                    setAnswers({});
                  }}
                  className="text-primary font-extrabold text-sm underline underline-offset-4"
                >
                  Recalculate
                </button>
              </div>
            </div>
            <p className="mt-8 text-sm text-gray-500 leading-relaxed">
              Final value of {formatCurrency(currentPrice)} is subject to inspection at pickup.
              WhatsApp: +91 {user?.phone || '9076116803'}.
            </p>
            <button
              type="button"
              onClick={handleSchedulePickup}
              className="w-full mt-8 bg-primary text-white font-extrabold py-4 rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              Get My {formatCurrency(currentPrice)} Now
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </PageCanvas>
    );
  }

  const isPositiveOption = (optId) =>
    /(_yes|_ok)$/.test(optId) || optId === 'physical_ok' || optId.startsWith('age_');

  return (
    <PageCanvas>
      <div className="max-w-5xl mx-auto py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6 text-xs sm:text-sm font-bold text-gray-400">
          <span>
            Step {stepIndex + 1} of {windows.length}
          </span>
          <span className="text-primary">{formatCurrency(currentPrice)}</span>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-5 sm:p-10">
          {/* Binary condition cards */}
          {step && ['power', 'voice_mic', 'connectivity', 'physical'].includes(step.id) && (
            <div>
              <div className="text-center mb-8 max-w-3xl mx-auto">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">
                  {personalizeQuestion(step.question, modelName)}
                </h2>
                <p className="text-sm text-gray-500">
                  {step.id === 'power'
                    ? 'We currently only accept devices that switch on without any issues.'
                    : personalizeQuestion(
                        step.id === 'physical'
                          ? 'Let us know if you have any physical damage on your device or case.'
                          : 'Let us know whether everything works correctly or has issues.',
                        modelName,
                      )}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {(step.options || []).map((opt) => {
                  const selected = answers[step.id] === opt.id;
                  const positive = isPositiveOption(opt.id);
                  const details = EARBUDS_OPTION_DETAILS[opt.id] || [];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSingle(step.id, opt.id)}
                      className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
                        selected
                          ? 'border-primary shadow-sm'
                          : 'border-dashed border-gray-300 hover:border-primary/40'
                      }`}
                    >
                      <div className="px-4 py-3 bg-[#F4F8FF] flex items-center gap-2 border-b border-gray-100">
                        {positive ? (
                          <ThumbsUp size={16} className="text-primary" />
                        ) : (
                          <ThumbsDown size={16} className="text-gray-500" />
                        )}
                        <span className="font-extrabold text-gray-900">{opt.label}</span>
                      </div>
                      <ul className="p-4 space-y-2 bg-white">
                        {details.map((line) => (
                          <li key={line} className="flex items-start gap-2 text-sm text-gray-600">
                            {positive ? (
                              <Check size={16} className="text-primary shrink-0 mt-0.5" />
                            ) : (
                              <X size={16} className="text-gray-400 shrink-0 mt-0.5" />
                            )}
                            <span>{personalizeQuestion(line, modelName)}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
              {powerRejected && step.id === 'power' && (
                <p className="mt-6 text-center text-sm font-bold text-red-500">
                  Sorry, we only accept earbuds that switch on.
                </p>
              )}
            </div>
          )}

          {/* Accessories */}
          {step?.id === 'accessories' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">
                  Select Original {modelName} Accessories You Have?
                </h2>
                <p className="text-sm text-gray-500">
                  Make sure you have your bill with you to know the age of your device
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
                {(step.options || []).map((opt) => {
                  const selected = accessories.includes(opt.id);
                  const Icon = ACCESSORY_ICONS[opt.id] || Package;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleMulti('accessories', opt.id)}
                      className={`rounded-2xl border-2 overflow-hidden transition-all ${
                        selected ? 'border-primary' : 'border-gray-200 hover:border-primary/30'
                      }`}
                    >
                      <div className="h-20 flex items-center justify-center bg-white text-primary">
                        <Icon size={26} strokeWidth={2} />
                      </div>
                      <div
                        className={`px-2 py-3 text-xs sm:text-sm font-bold text-center ${
                          selected ? 'bg-primary-light text-primary' : 'bg-[#F4F7FB] text-gray-800'
                        }`}
                      >
                        {opt.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 max-w-3xl mx-auto rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-amber-800">
                  Either genuine bill or box is required for device to be acceptable at pickup!
                </p>
              </div>
            </div>
          )}

          {/* Age */}
          {step?.id === 'age' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">
                  How Old Is Your {modelName}?
                </h2>
                <p className="text-sm text-gray-500">
                  Make sure all your accessories are in place when you schedule a pickup.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {(step.options || []).map((opt) => {
                  const selected = answers.age === opt.id;
                  const details = EARBUDS_OPTION_DETAILS[opt.id] || [];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSingle('age', opt.id)}
                      className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
                        selected
                          ? 'border-primary shadow-sm'
                          : 'border-dashed border-gray-300 hover:border-primary/40'
                      }`}
                    >
                      <div className="px-4 py-4 bg-[#F4F8FF] flex flex-col items-center gap-2 border-b border-gray-100">
                        <Calendar size={22} className="text-primary" />
                        <span className="font-extrabold text-gray-900 text-center text-sm">
                          {opt.label}
                        </span>
                      </div>
                      <ul className="p-4 space-y-2 bg-white">
                        {details.map((line) => (
                          <li key={line} className="flex items-start gap-2 text-xs text-gray-600">
                            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              disabled={!canContinue()}
              onClick={handleContinue}
              className="inline-flex items-center gap-2 bg-primary text-white font-extrabold px-10 py-3.5 rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {stepIndex < windows.length - 1 ? 'Continue' : 'Get Price'}
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {stepIndex > 0 && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                className="text-sm font-bold text-gray-400 hover:text-gray-700"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </PageCanvas>
  );
}
