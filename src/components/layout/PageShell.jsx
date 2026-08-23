export default function PageShell({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  eyebrowTone = "green",
  title,
  titleAccent,
  subtitle,
  children,
  headerAlign = "center",
  heroImage,
  heroImageAlt = "",
  className = "",
  bodyClassName = "",
  headerClassName = "",
  bare = false,
}) {
  const tones = {
    green: "text-[#16A34A] bg-[#DCFCE7] border border-[#86EFAC]/40",
    blue: "text-[#0565E6] bg-[#E8F0FE] border-0 shadow-[0_1px_6px_rgba(5,101,230,0.1)]",
    amber: "text-amber-700 bg-amber-50 border border-amber-200/60",
  };

  const align =
    headerAlign === "left" ? "text-left items-start" : "text-center items-center";

  const shellClass = bare
    ? `mt-4 ${className}`
    : `rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden mt-4 ${className}`;

  const headerBlockClass = bare
    ? `mb-6 sm:mb-8 ${headerClassName}`
    : `px-5 sm:px-8 pt-7 sm:pt-9 pb-6 border-b border-[#E8EEF5] bg-[#F4F7FB] ${headerClassName}`;

  const headerClass = bare
    ? `flex flex-col ${align} mb-6 sm:mb-8 ${headerClassName}`
    : `px-5 sm:px-8 pt-7 sm:pt-9 pb-6 border-b border-[#E8EEF5] bg-[#F4F7FB] flex flex-col ${align} ${headerClassName}`;

  const bodyWrapClass = bare ? bodyClassName : `p-5 sm:p-8 ${bodyClassName}`;

  const headerContent = (
    <>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase px-4 py-2 rounded-full mb-3 border ${tones[eyebrowTone] || tones.green}`}
        >
          {EyebrowIcon && <EyebrowIcon size={14} strokeWidth={2.5} />}
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
    </>
  );

  return (
    <div className={shellClass}>
      {(eyebrow || title || subtitle) && (
        heroImage ? (
          <div
            className={`flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 ${headerBlockClass}`}
          >
            <img
              src={heroImage}
              alt={heroImageAlt || title || "Category"}
              className="w-24 sm:w-32 md:w-36 h-auto object-contain shrink-0 self-start sm:self-center"
              loading="lazy"
            />
            <div className={`flex flex-col ${align} min-w-0`}>{headerContent}</div>
          </div>
        ) : (
          <div className={headerClass}>{headerContent}</div>
        )
      )}
      <div className={bodyWrapClass}>{children}</div>
    </div>
  );
}
