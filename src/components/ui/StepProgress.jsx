export default function StepProgress({ current, total, labels = [] }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shrink-0
              ${i < current ? 'bg-primary text-white' : i === current ? 'bg-primary text-white ring-4 ring-primary-light' : 'bg-gray-100 text-gray-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            {i < total - 1 && (
              <div className={`h-0.5 flex-1 mx-2 rounded transition-all duration-300 ${i < current ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>
      {labels.length > 0 && (
        <div className="flex justify-between">
          {labels.map((label, i) => (
            <span key={i} className={`text-xs font-medium ${i <= current ? 'text-primary' : 'text-gray-400'}`}
              style={{ width: `${100 / total}%`, textAlign: i === 0 ? 'left' : i === total - 1 ? 'right' : 'center' }}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
