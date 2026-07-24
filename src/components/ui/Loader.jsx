const LOADER_IMG = "/favicon-512x512.png";

export default function Loader({ className = "", fullScreen = true }) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-transparent ${
        fullScreen ? "min-h-screen" : "py-16"
      } ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] flex items-center justify-center">
        {/* Circular spinner ring */}
        <svg
          className="absolute inset-0 w-full h-full dk-loader-spin"
          viewBox="0 0 100 100"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="45" stroke="#E5E7EB" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#0565E6"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="72 210"
          />
        </svg>

        {/* Center icon — no background */}
        <img
          src={LOADER_IMG}
          alt=""
          className="relative z-10 w-[54%] h-[54%] object-contain"
          draggable={false}
        />
      </div>
      <span className="sr-only">Loading…</span>
      <style>{`
        @keyframes dkLoaderSpin {
          to { transform: rotate(360deg); }
        }
        .dk-loader-spin {
          animation: dkLoaderSpin 0.9s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .dk-loader-spin { animation: none; }
        }
      `}</style>
    </div>
  );
}
