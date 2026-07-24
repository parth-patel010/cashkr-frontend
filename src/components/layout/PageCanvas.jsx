export default function PageCanvas({ children, className = "", narrow = false }) {
  return (
    <div className={`w-full bg-[#F7F9FC] min-h-[70vh] ${className}`}>
      <div
        className={`${narrow ? "max-w-[720px]" : "max-w-[1200px]"} mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-12 sm:pb-16`}
      >
        {children}
      </div>
    </div>
  );
}
