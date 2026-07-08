import { ORDER_STATUS } from '../../constants/orderStatus';

export default function Badge({ status, className = '' }) {
  const config = ORDER_STATUS[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  );
}
