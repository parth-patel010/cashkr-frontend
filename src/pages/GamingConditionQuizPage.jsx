import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Disc3, Usb, Monitor, Network, Bluetooth, Wifi,
  Gamepad2, Cable, Package, FileText, ArrowRight,
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
  DEFAULT_GAMING_QUIZ,
  GAMING_PHYSICAL_DETAILS,
} from '../data/gamingQuizDefaults';

const FUNCTIONAL_ICONS = {
  gc_cd_drive: Disc3,
  gc_usb: Usb,
  gc_hdmi: Monitor,
  gc_lan: Network,
  gc_bluetooth: Bluetooth,
  gc_wifi: Wifi,
};

const ACCESSORY_ICONS = {
  acc_controller: Gamepad2,
  acc_charger: Cable,
  acc_box: Package,
  acc_bill: FileText,
  acc_extra_controller: Gamepad2,
};

const REQUIRED_WINDOW_IDS = ['power', 'physical', 'functional', 'accessories', 'game_cds'];

function resolveGamingQuiz(apiQuiz) {
  const windows = apiQuiz?.windows;
  if (!Array.isArray(windows) || windows.length < REQUIRED_WINDOW_IDS.length) {
    return DEFAULT_GAMING_QUIZ;
  }
  const ids = new Set(windows.map((w) => w.id));
  if (!REQUIRED_WINDOW_IDS.every((id) => ids.has(id))) {
    return DEFAULT_GAMING_QUIZ;
  }
  return apiQuiz;
}

export default function GamingConditionQuizPage() {
  const { brand, slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storage = searchParams.get('storage');
  const { updateQuote } = useQuote();
  const { isAuthenticated, user } = useAuth();

  const [device, setDevice] = useState(null);
  const [quiz, setQuiz] = useState(DEFAULT_GAMING_QUIZ);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [breakdown, setBreakdown] = useState(null);

  const windows = quiz?.windows?.length ? quiz.windows : DEFAULT_GAMING_QUIZ.windows;
  const step = windows[stepIndex];
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
          deviceService.getCategoryQuiz('gaming').catch(() => null),
        ]);
        if (cancelled) return;
        const dev = devRes.data;
        setDevice(dev);
        recordDeviceQuizOnce(slug);
        if (quizRes?.data) setQuiz(resolveGamingQuiz(quizRes.data));
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
    const functionalIdx = windows.findIndex((w) => w.id === 'functional');
    const accessoriesIdx = windows.findIndex((w) => w.id === 'accessories');
    if (functionalIdx >= 0 && stepIndex >= functionalIdx && !('functional' in a)) {
      a.functional = [];
    }
    if (accessoriesIdx >= 0 && stepIndex >= accessoriesIdx && !('accessories' in a)) {
      a.accessories = [];
    }
    if (showResult) {
      if (!('functional' in a)) a.functional = [];
      if (!('accessories' in a)) a.accessories = [];
    }
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

  const canContinue = () => {
    if (!step) return false;
    if (step.choiceType === 'single') return Boolean(answers[step.id]);
    return true;
  };

  const powerRejected = normalizedAnswers.power === 'power_no';

  const handleGetBestPrice = () => {
    const finalAnswers = {
      ...normalizedAnswers,
      functional: normalizedAnswers.functional || [],
      accessories: normalizedAnswers.accessories || [],
    };
    const result = calculateCategoryQuizPrice({
      basePrice,
      quiz,
      answers: finalAnswers,
      deviceSlug: device.slug,
    });
    const answerSummary = formatCategoryQuizAnswerSummary(quiz, finalAnswers);
    const quizCtx = {
      category: 'gaming',
      brand: device.brand,
      modelName: device.modelName,
      slug: device.slug,
      storage: storage || device.variants?.[0]?.storage || '',
      quizPath: `/sell/gaming/${encodeURIComponent(String(brand || device.brand || '').toLowerCase())}/${device.slug}/quiz`,
      answers: finalAnswers,
      answerSummary,
    };
    updateQuote({
      device: {
        brand: device.brand,
        modelName: device.modelName,
        slug: device.slug,
        category: 'gaming',
        imageUrl: device.imageUrl || '',
        storage: quizCtx.storage,
        quizAnswers: finalAnswers,
        answerSummary,
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
    if (step?.id === 'power' && powerRejected) return;
    if (stepIndex < windows.length - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    handleGetBestPrice();
  };

  const handleSchedulePickup = () => {
    const finalAnswers = {
      ...normalizedAnswers,
      functional: normalizedAnswers.functional || [],
      accessories: normalizedAnswers.accessories || [],
    };
    const quizCtx = {
      category: 'gaming',
      brand: device.brand,
      modelName: device.modelName,
      slug: device.slug,
      storage: storage || device.variants?.[0]?.storage || '',
      quizPath: `/sell/gaming/${encodeURIComponent(String(brand || device.brand || '').toLowerCase())}/${device.slug}/quiz`,
      answers: finalAnswers,
      answerSummary: formatCategoryQuizAnswerSummary(quiz, finalAnswers),
    };
    setLoginContext(quizCtx);
    if (isAuthenticated) reportLastQuizDevice(quizCtx);
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/schedule-pickup');
    } else {
      navigate('/schedule-pickup');
    }
  };

  const resetQuiz = () => {
    setShowResult(false);
    setStepIndex(0);
    setAnswers({});
    setBreakdown(null);
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
                  src={device.imageUrl || '/category_assets/buy/gaming_console.png'}
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
                  {storage ? ` (${storage})` : ''}
                </h1>
                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                  {formatCurrency(currentPrice)}
                </div>
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="text-primary font-extrabold text-sm underline underline-offset-4"
                >
                  Recalculate
                </button>
              </div>
            </div>

            <p className="mt-8 text-sm text-gray-500 leading-relaxed">
              I agree that the final value of {formatCurrency(currentPrice)} is subject to physical
              device inspection at pickup. WhatsApp updates: +91 {user?.phone || '9076116803'}.
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

  const gameCdOptions = [...(step?.options || [])].sort((a, b) => {
    const na = parseInt(a.label, 10);
    const nb = parseInt(b.label, 10);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return String(a.label).localeCompare(String(b.label));
  });

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
          {/* POWER */}
          {step?.id === 'power' && (
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                {step.question || 'Does the Gaming Console switch on?'}
              </h2>
              <p className="text-sm text-gray-500 mb-8">
                We currently only accept devices that switch on
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {(step.options || []).map((opt) => {
                  const selected = answers.power === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSingle('power', opt.id)}
                      className={`rounded-2xl border-2 px-4 py-5 font-extrabold text-lg transition-all flex items-center justify-center gap-3 ${
                        selected
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-gray-200 bg-[#F7F9FC] text-gray-800 hover:border-primary/40'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selected ? 'border-primary' : 'border-gray-300'
                        }`}
                      >
                        {selected ? <span className="w-2.5 h-2.5 rounded-full bg-primary" /> : null}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {powerRejected && (
                <p className="mt-6 text-sm font-bold text-red-500">
                  Sorry, we only accept consoles that switch on.
                </p>
              )}
            </div>
          )}

          {/* PHYSICAL */}
          {step?.id === 'physical' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  {step.title}
                </h2>
                <p className="text-sm text-gray-500">{step.question}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {(step.options || []).map((opt) => {
                  const selected = answers.physical === opt.id;
                  const details = GAMING_PHYSICAL_DETAILS[opt.id];
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSingle('physical', opt.id)}
                      className={`text-left rounded-2xl border-2 p-4 sm:p-5 transition-all ${
                        selected
                          ? 'border-primary bg-primary-light/40 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selected ? 'border-primary' : 'border-gray-300'
                          }`}
                        >
                          {selected ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          ) : null}
                        </span>
                        <span className="font-extrabold text-gray-900">{opt.label}</span>
                      </div>
                      {details?.length ? (
                        <ul className="space-y-1.5 pl-8">
                          {details.map((line) => (
                            <li key={line} className="text-xs sm:text-sm text-gray-500 list-disc">
                              {line}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FUNCTIONAL */}
          {step?.id === 'functional' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  {step.title}
                </h2>
                <p className="text-sm text-gray-500">{step.question}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {(step.options || []).map((opt) => {
                  const selected = (answers.functional || []).includes(opt.id);
                  const Icon = FUNCTIONAL_ICONS[opt.id] || Gamepad2;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleMulti('functional', opt.id)}
                      className={`rounded-2xl border-2 p-4 text-center transition-all ${
                        selected
                          ? 'border-primary bg-primary-light/50'
                          : 'border-gray-200 hover:border-primary/30'
                      }`}
                    >
                      <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-[#F7F9FC] flex items-center justify-center text-primary">
                        <Icon size={22} strokeWidth={2} />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-800 leading-snug block">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-xs text-gray-400 mt-4 font-semibold">
                Select all that apply — or none if everything works
              </p>
            </div>
          )}

          {/* ACCESSORIES */}
          {step?.id === 'accessories' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  {step.title}
                </h2>
                <p className="text-sm text-gray-500">{step.question}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {(step.options || []).map((opt) => {
                  const selected = (answers.accessories || []).includes(opt.id);
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
                      <div className="h-24 flex items-center justify-center bg-white text-primary">
                        <Icon size={28} strokeWidth={2} />
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
            </div>
          )}

          {/* GAME CDS */}
          {step?.id === 'game_cds' && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                  {step.title}
                </h2>
                <p className="text-sm text-gray-500">{step.question}</p>
              </div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select the no of CDs
              </label>
              <select
                className="w-full rounded-xl border-2 border-gray-200 bg-[#F7F9FC] px-4 py-3.5 font-bold text-gray-900 focus:border-primary focus:outline-none"
                value={answers.game_cds || ''}
                onChange={(e) => setSingle('game_cds', e.target.value)}
              >
                <option value="" disabled>
                  Select
                </option>
                {gameCdOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              disabled={!canContinue() || (step?.id === 'power' && powerRejected)}
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
