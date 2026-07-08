const variants = {
  primary: 'bg-primary hover:bg-primary-dark text-white shadow-[0_4px_14px_rgba(5,101,230,0.25)] hover:shadow-[0_6px_20px_rgba(5,101,230,0.30)]',
  secondary: 'bg-white border-2 border-primary text-primary hover:bg-primary-light',
  ghost: 'bg-transparent text-text-muted hover:bg-gray-100 hover:text-text-primary',
};
const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base rounded-xl',
};

export default function Button({ variant = 'primary', size = 'md', children, className = '', disabled, loading, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 cursor-pointer
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}
        ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  );
}
