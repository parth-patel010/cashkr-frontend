import { useEffect, useRef, useState } from 'react';

export const VALUATION_VIDEO_SOURCES = [
  '/valuation-motion.mp4',
  '/DeviceKart_AI_valuation_motion_g._202608290956.mp4',
];
export const VALUATION_DURATION_SEC = 45;

const HUMAN_TOUCH = 'Provide Our Sales Team Suggestion or Human Touch ;)';

function copyForDevice(deviceKind = 'laptop') {
  const noun = deviceKind === 'phone' || deviceKind === 'mobile' ? 'phone' : 'laptop';
  return {
    progress: [
      `Analyzing your ${noun} configuration…`,
      'Matching specs with live market data…',
      'Checking resale demand for your model…',
      'Comparing prices across India\'s largest buyback network…',
      'Calculating your best DeviceKart offer…',
      `Almost there — ${HUMAN_TOUCH}`,
    ],
    queue: [
      'Our AI agent is finishing another valuation — you\'re in the queue.',
      'Higher-value devices are valued first so you get a fair market rate.',
      'Please stay on this screen — we\'ll finish as soon as the agent is free.',
      `Free doorstep pickup · Instant payment · ${HUMAN_TOUCH}`,
    ],
    tips: [
      { icon: '🤝', text: HUMAN_TOUCH },
      { icon: '⚡', text: `Most ${noun}s are valued in under a minute.` },
      { icon: '🏠', text: 'Free doorstep pickup — no visiting any store.' },
      { icon: '💳', text: 'Get paid instantly at pickup via UPI or bank transfer.' },
      { icon: '📈', text: 'We check live market rates so you get a fair offer.' },
      { icon: '✅', text: 'Fill the same quiz again — you\'ll get the exact same price.' },
    ],
    trust: [
      { value: '50,000+', label: 'Devices bought' },
      { value: 'Human', label: 'Sales touch' },
      { value: '₹0', label: 'Pickup fee' },
      { value: '100%', label: 'Instant pay' },
    ],
    steps: [
      { id: 1, label: 'Reading specs' },
      { id: 2, label: 'Checking condition' },
      { id: 3, label: 'Live market scan' },
      { id: 4, label: 'Building your offer' },
      { id: 5, label: 'Sales team touch' },
    ],
  };
}

function normalizeStatus(status) {
  return status === 'skipped' ? 'overridden' : status;
}

function phaseFromStatus(status, cached) {
  const s = normalizeStatus(status);
  if (cached || s === 'overridden') return 'cached';
  if (s === 'pending') return 'queued';
  if (s === 'running') return 'running';
  if (['completed', 'partial'].includes(s)) return 'done';
  if (s === 'failed') return 'failed';
  return 'running';
}

export default function LaptopValuationModal({
  open,
  agentStatus = 'pending',
  cached = false,
  queuePosition = 0,
  agentBusy = false,
  error = null,
  onComplete,
  deviceKind = 'laptop',
}) {
  const copy = copyForDevice(deviceKind);
  const PROGRESS_MESSAGES = copy.progress;
  const QUEUE_MESSAGES = copy.queue;
  const ENGAGEMENT_TIPS = copy.tips;
  const TRUST_STATS = copy.trust;
  const STEPS = copy.steps;
  const videoRef = useRef(null);
  const startedAtRef = useRef(null);
  const [progress, setProgress] = useState(4);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [videoSourceIndex, setVideoSourceIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const phase = phaseFromStatus(agentStatus, cached);
  const videoSrc = VALUATION_VIDEO_SOURCES[videoSourceIndex];

  useEffect(() => {
    if (!open) {
      setProgress(4);
      setElapsedSec(0);
      setMessageIndex(0);
      setTipIndex(0);
      setVideoSourceIndex(0);
      setVideoFailed(false);
      startedAtRef.current = null;
      return;
    }
    startedAtRef.current = Date.now();
    const video = videoRef.current;
    if (video) {
      video.load();
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => setVideoFailed(true));
      }
    }
  }, [open, videoSourceIndex]);

  useEffect(() => {
    if (!open) return undefined;

    if (phase === 'cached') {
      setProgress(100);
      return undefined;
    }

    if (phase === 'done' || phase === 'failed') {
      setProgress(100);
      return undefined;
    }

    const tick = setInterval(() => {
      const elapsed = startedAtRef.current
        ? (Date.now() - startedAtRef.current) / 1000
        : 0;
      setElapsedSec(Math.floor(elapsed));

      setProgress((prev) => {
        const targetDuration = VALUATION_DURATION_SEC;
        const timePct = Math.min((elapsed / targetDuration) * 92, 92);
        if (phase === 'queued') {
          const queueCap = agentBusy ? 28 : 35;
          return Math.min(Math.max(prev, timePct * 0.4), queueCap);
        }
        return Math.max(prev, timePct);
      });
    }, 250);

    const msgTick = setInterval(() => {
      setMessageIndex((i) => i + 1);
      setTipIndex((i) => (i + 1) % ENGAGEMENT_TIPS.length);
    }, 4500);

    return () => {
      clearInterval(tick);
      clearInterval(msgTick);
    };
  }, [open, phase, agentBusy]);

  const handleVideoError = () => {
    if (videoSourceIndex < VALUATION_VIDEO_SOURCES.length - 1) {
      setVideoSourceIndex((i) => i + 1);
      return;
    }
    setVideoFailed(true);
  };

  if (!open) return null;

  const messages = phase === 'queued' ? QUEUE_MESSAGES : PROGRESS_MESSAGES;
  const subline = messages[messageIndex % messages.length];
  const tip = ENGAGEMENT_TIPS[tipIndex];
  const remainingSec = Math.max(0, VALUATION_DURATION_SEC - elapsedSec);
  const activeStep = Math.min(
    STEPS.length,
    Math.max(1, Math.ceil((progress / 92) * STEPS.length)),
  );

  const headline = phase === 'queued' && queuePosition > 1
    ? `In queue — position ${queuePosition}`
    : phase === 'queued' && agentBusy
      ? 'Waiting for valuation agent…'
      : phase === 'queued'
        ? 'Queued for live valuation…'
        : phase === 'running'
        ? 'Getting your live valuation…'
        : phase === 'cached'
          ? 'Found your locked price'
          : phase === 'done'
            ? 'Valuation ready'
            : phase === 'failed'
              ? 'Valuation failed'
              : 'Starting valuation…';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1220]/75 backdrop-blur-sm px-4">
      <div className="w-full max-w-xl bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="relative bg-gradient-to-b from-[#EEF4FF] via-[#F8FAFF] to-white px-6 pt-6 pb-4">
          {!videoFailed ? (
            <div className="relative rounded-2xl overflow-hidden bg-[#0B1220] shadow-inner">
              <video
                ref={videoRef}
                key={videoSrc}
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onLoadedData={() => videoRef.current?.play()?.catch(() => {})}
                onError={handleVideoError}
                className="w-full h-[200px] sm:h-[240px] object-cover mx-auto"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1220]/30 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-[200px] sm:h-[240px] flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF4FF] to-[#DDD6FE]">
              <div className="valuation-orbit-animation relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-4xl">💻</div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 pb-8 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-gray-900">{headline}</h2>
            <p className="text-sm font-semibold text-gray-600 min-h-[36px]">{error || subline}</p>
            {phase !== 'failed' && phase !== 'cached' && (
              <p className="text-xs font-bold text-primary">
                ~{remainingSec}s remaining · usually ready in 40–50 seconds
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  phase === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-primary to-[#7C3AED]'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
              <span>{phase === 'queued' ? 'In queue' : 'Valuation progress'}</span>
              <span>{Math.round(Math.min(progress, 100))}%</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {STEPS.map((step) => {
              const done = step.id < activeStep;
              const active = step.id === activeStep;
              return (
                <div key={step.id} className="text-center">
                  <div
                    className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold mb-1 transition-all ${
                      done
                        ? 'bg-primary text-white'
                        : active
                          ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {done ? '✓' : step.id}
                  </div>
                  <div className={`text-[9px] font-bold leading-tight ${active ? 'text-primary' : 'text-gray-400'}`}>
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="text-center rounded-xl bg-[#F8FAFC] border border-gray-100 py-2 px-1">
                <div className="text-sm font-extrabold text-primary">{stat.value}</div>
                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] border border-gray-100 px-4 py-3 flex items-start gap-3">
            <span className="text-xl shrink-0">{tip.icon}</span>
            <p className="text-sm font-semibold text-gray-700 leading-snug">{tip.text}</p>
          </div>

          {phase === 'failed' && (
            <button
              type="button"
              onClick={() => onComplete?.({ failed: true })}
              className="w-full py-3.5 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1.2s linear infinite; }
      `}</style>
    </div>
  );
}

export { VALUATION_VIDEO_SOURCES as VALUATION_VIDEO, HUMAN_TOUCH };
