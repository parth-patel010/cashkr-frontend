import { Zap, Truck, ShieldCheck } from "lucide-react";

const DEFAULT_ITEMS = [
  { Icon: Zap, label: "Instant Quote", color: "bg-[#EDE9FE] text-[#7C3AED]" },
  { Icon: Truck, label: "Free Pickup", color: "bg-[#DCFCE7] text-[#16A34A]" },
  { Icon: ShieldCheck, label: "Secure Payment", color: "bg-primary-light text-primary" },
];

export default function TrustPills({ items = DEFAULT_ITEMS, className = "" }) {
  return (
    <div className={`mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 ${className}`}>
      {items.map(({ Icon, label, color }) => (
        <div
          key={label}
          className="inline-flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3.5 py-2 shadow-sm"
        >
          <span className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
            <Icon size={14} strokeWidth={2.2} />
          </span>
          <span className="text-xs sm:text-sm font-bold text-gray-700">{label}</span>
        </div>
      ))}
    </div>
  );
}
