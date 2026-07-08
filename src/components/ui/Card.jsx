export default function Card({ children, className = '', selected, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border transition-all duration-200
        ${selected ? 'border-2 border-primary bg-primary-light shadow-[0_8px_40px_rgba(5,101,230,0.10)]' : 'border-border shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
