import { CheckCircle2 } from 'lucide-react';
import PageCanvas from '../layout/PageCanvas';
import SEOHead from '../seo/SEOHead';

export default function RequestFormShell({
  title,
  subtitle,
  seoTitle,
  seoDescription,
  seoPath,
  done,
  leadId,
  children,
  onReset,
}) {
  if (done) {
    return (
      <PageCanvas narrow>
        <SEOHead title={seoTitle} description={seoDescription} path={seoPath} />
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-8 sm:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={34} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Request received</h1>
          <p className="text-sm font-medium text-gray-500 max-w-md mx-auto leading-relaxed">
            Thanks! Our team will call you shortly with the next steps.
          </p>
          {leadId ? (
            <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-primary">
              Ref: {leadId}
            </p>
          ) : null}
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="mt-8 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-extrabold hover:bg-primary-dark transition-all"
            >
              Submit another request
            </button>
          ) : null}
        </div>
      </PageCanvas>
    );
  }

  return (
    <PageCanvas narrow>
      <SEOHead title={seoTitle} description={seoDescription} path={seoPath} />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
      <div className="bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] p-5 sm:p-8 space-y-7">
        {children}
      </div>
    </PageCanvas>
  );
}

export function FormSection({ step, title, hint, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 shrink-0 rounded-xl bg-[#F4F7FB] border border-[#E8EEF5] flex items-center justify-center text-xs font-extrabold text-gray-800">
          {step}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
          {hint ? <p className="text-xs font-medium text-gray-400 mt-0.5">{hint}</p> : null}
        </div>
      </div>
      <div className="pl-0 sm:pl-11">{children}</div>
    </section>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  maxLength,
  required,
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#F7F9FC] border border-[#E8EEF5] rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all"
      />
    </label>
  );
}
