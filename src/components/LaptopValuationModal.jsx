import { useEffect, useState } from 'react';

const VALUATION_VIDEO = '/DeviceKart_AI_valuation_motion_g._202608290956.mp4';

const PROGRESS_MESSAGES = [
  'Analyzing your laptop...',
  'Matching configuration with market data...',
  'Checking current resale valuation...',
  'Comparing live market prices...',
  'Calculating your best offer...',
];

const QUEUE_MESSAGES = [
  'Our valuation agent is finishing another device...',
  'You are in the queue — price will be ready shortly.',
  'Hang tight — we lock the exact same price when you return.',
];

function phaseFromStatus(status, cached) {
  if (cached) return 'cached';
  if (status === 'pending') return 'queued';
  if (status === 'running') return 'running';
  if (['completed', 'partial', 'skipped'].includes(status)) return 'done';
  if (status === 'failed') return 'failed';
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
}) {
  const [progress, setProgress] = useState(8);
  const [messageIndex, setMessageIndex] = useState(0);
  const phase = phaseFromStatus(agentStatus, cached);

  useEffect(() => {
    if (!open) {
      setProgress(8);
      setMessageIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    if (phase === 'cached' || phase === 'done') {
      setProgress(100);
      return undefined;
    }

    if (phase === 'failed') {
      setProgress(100);
      return undefined;
    }

    const tick = setInterval(() => {
      setProgress((prev) => {
        if (phase === 'queued') {
          const cap = agentBusy ? 38 : 45;
          return prev < cap ? prev + 0.6 : cap;
        }
        const cap = 92;
        return prev < cap ? prev + 1.2 : cap;
      });
    }, 400);

    const msgTick = setInterval(() => {
      setMessageIndex((i) => (i + 1) % (phase === 'queued' ? QUEUE_MESSAGES.length : PROGRESS_MESSAGES.length));
    }, 3200);

    return () => {
      clearInterval(tick);
      clearInterval(msgTick);
    };
  }, [open, phase, agentBusy, onComplete]);

  if (!open) return null;

  const messages = phase === 'queued' ? QUEUE_MESSAGES : PROGRESS_MESSAGES;
  const headline = phase === 'queued' && queuePosition > 1
    ? `In queue — position ${queuePosition}`
    : phase === 'queued' && agentBusy
      ? 'Waiting for valuation agent...'
      : phase === 'running'
        ? 'Getting your live valuation...'
        : phase === 'cached'
          ? 'Found your saved price'
          : phase === 'done'
            ? 'Valuation ready'
            : 'Valuation failed';

  const subline = messages[messageIndex % messages.length];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1220]/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="relative bg-gradient-to-b from-[#EEF4FF] to-white px-8 pt-8 pb-6">
          <video
            src={VALUATION_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-h-[220px] object-contain mx-auto rounded-2xl"
          />
        </div>

        <div className="px-8 pb-8 space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-extrabold text-gray-900">{headline}</h2>
            <p className="text-sm font-semibold text-gray-600 min-h-[40px]">{error || subline}</p>
          </div>

          <div className="space-y-2">
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  phase === 'failed' ? 'bg-red-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-widest text-gray-500">
              <span>{phase === 'queued' ? 'Queued' : 'Processing'}</span>
              <span>{Math.round(Math.min(progress, 100))}%</span>
            </div>
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
    </div>
  );
}

export { VALUATION_VIDEO, PROGRESS_MESSAGES };
