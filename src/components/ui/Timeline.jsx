import { ORDER_STATUS, ORDER_TIMELINE } from '../../constants/orderStatus';

export default function Timeline({ currentStatus }) {
  const currentIdx = ORDER_TIMELINE.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {ORDER_TIMELINE.map((status, i) => {
        const config = ORDER_STATUS[status];
        const isCompleted = i < currentIdx;
        const isCurrent = i === currentIdx;
        const isPending = i > currentIdx;

        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
                ${isCompleted ? 'bg-blue-500 text-white' : isCurrent ? 'bg-primary text-white ring-4 ring-primary-light' : 'bg-gray-100 text-gray-400'}`}>
                {isCompleted ? '✓' : i + 1}
              </div>
              {i < ORDER_TIMELINE.length - 1 && (
                <div className={`w-0.5 h-12 ${isCompleted ? 'bg-blue-200' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className={`pb-8 ${isPending ? 'opacity-40' : ''}`}>
              <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                {config.label}
              </p>
              {isCurrent && <p className="text-xs text-text-muted mt-1">In progress...</p>}
              {isCompleted && <p className="text-xs text-blue-500 mt-1">Completed</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
