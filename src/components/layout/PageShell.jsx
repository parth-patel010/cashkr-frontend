export default function PageShell({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  eyebrowTone = "green",
  title,
  titleAccent,
  subtitle,
  children,
  headerAlign = "center",
  className = "",
  bodyClassName = "",
  headerClassName = "",
}) {
  const tones = {
    green: "text-[#16A34A] bg-[#DCFCE7] border-[#86EFAC]/40",
    blue: "text-primary bg-primary-light border-border-light",
    amber: "text-amber-700 bg-amber-50 border-amber-200/60",
  };

  const align =
    headerAlign === "left" ? "text-left items-start" : "text-center items-center";

  return (
    <div
      className={`rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden mt-4 ${className}`}
    >
      {(eyebrow || title || subtitle) && (
        <div
          className={`px-5 sm:px-8 pt-7 sm:pt-9 pb-6 border-b border-[#E8EEF5] bg-[#F4F7FB] flex flex-col ${align} ${headerClassName}`}
        >
          {eyebrow && (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase border px-3 py-1.5 rounded-full mb-3 ${tones[eyebrowTone] || tones.green}`}
            >
              {EyebrowIcon && <EyebrowIcon size={12} strokeWidth={2.5} />}
              {eyebrow}
            </span>
          )}
          {title && (
            <h1 className="text-2xl sm:text-[2rem] font-extrabold text-gray-900 tracking-tight leading-tight">
              {title}
              {titleAccent != null && (
                <>
                  {" "}
                  <span className="text-primary">{titleAccent}</span>
                </>
              )}
            </h1>
          )}
          {subtitle && (
            <p
              className={`text-sm sm:text-base text-gray-500 mt-2.5 leading-relaxed ${
                headerAlign === "center" ? "max-w-xl mx-auto" : "max-w-2xl"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={`p-5 sm:p-8 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
