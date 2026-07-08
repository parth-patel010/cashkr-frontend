import { useState, useEffect } from 'react';

export default function CountdownTimer({ hours = 24 }) {
  const [seconds, setSeconds] = useState(hours * 3600);

  useEffect(() => {
    const timer = setInterval(() => setSeconds(s => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <span>Offer valid for {pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
}
