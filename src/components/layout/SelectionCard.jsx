import { Link } from "react-router-dom";

/**
 * Grid card used on brand / model / category selection pages.
 * `compact` — square white brand tile (Earth Age style) with Siri-style border on hover.
 */
export default function SelectionCard({
  to,
  state,
  image,
  imageAlt = "",
  title,
  subtitle,
  footer,
  onClick,
  className = "",
  compact = false,
  compactMedium = false,
  compactLarge = false,
}) {
  const isCompact = compact || compactMedium || compactLarge;

  const imageWrapClass = isCompact
    ? "flex flex-1 items-center justify-center w-full min-h-0 px-1"
    : "h-[88px] sm:h-[110px] flex items-center justify-center mb-3 rounded-xl bg-white border border-gray-100";

  const imgClass = compactLarge
    ? "max-h-[58px] sm:max-h-[68px] max-w-[88%] object-contain transition-transform duration-300 group-hover:scale-105"
    : compactMedium
      ? "max-h-[56px] sm:max-h-[64px] max-w-[88%] object-contain transition-transform duration-300 group-hover:scale-105"
      : compact
        ? "max-h-[52px] sm:max-h-[60px] max-w-[88%] object-contain transition-transform duration-300 group-hover:scale-105"
        : "max-h-[72px] sm:max-h-[90px] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105";

  const titleClass =
    compactLarge || compactMedium
      ? compactLarge
        ? "text-base font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 w-full shrink-0"
        : "text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 w-full shrink-0"
      : compact
        ? "text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 w-full shrink-0"
        : "text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-primary transition-colors line-clamp-2";

  const subtitleClass = compactLarge
    ? "text-sm text-gray-500 mt-1 leading-none line-clamp-1 w-full shrink-0"
    : compactMedium
      ? "text-xs text-gray-500 mt-0.5 leading-none line-clamp-1 w-full shrink-0"
      : compact
        ? "text-xs text-gray-500 mt-0.5 leading-none line-clamp-1 w-full shrink-0"
        : "text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2";

  const facePad = compactLarge
    ? "p-4 sm:p-5"
    : compactMedium
      ? "p-4 sm:p-[1.125rem]"
      : "p-3 sm:p-4";

  const compactInner = (
    <>
      {image != null && (
        <div className={imageWrapClass}>
          {typeof image === "string" ? (
            <img
              src={image}
              alt={imageAlt || title}
              className={imgClass}
              loading="lazy"
            />
          ) : (
            image
          )}
        </div>
      )}
      <div className="w-full shrink-0 pt-1">
        {title && <h2 className={titleClass}>{title}</h2>}
        {subtitle && <p className={subtitleClass}>{subtitle}</p>}
        {footer}
      </div>
    </>
  );

  const defaultInner = (
    <>
      {image != null && (
        <div className={imageWrapClass}>
          {typeof image === "string" ? (
            <img
              src={image}
              alt={imageAlt || title}
              className={imgClass}
              loading="lazy"
            />
          ) : (
            image
          )}
        </div>
      )}
      {title && <h2 className={titleClass}>{title}</h2>}
      {subtitle && <p className={subtitleClass}>{subtitle}</p>}
      {footer}
    </>
  );

  if (isCompact) {
    const siriClass = `group brand-card-siri aspect-square no-underline ${className}`;
    const faceClass = `brand-card-siri__face ${facePad}`;

    if (to) {
      return (
        <Link to={to} state={state} className={siriClass} onClick={onClick}>
          <span className="brand-card-siri__spin" aria-hidden="true" />
          <span className={faceClass}>{compactInner}</span>
        </Link>
      );
    }

    return (
      <button type="button" className={`${siriClass} text-left w-full`} onClick={onClick}>
        <span className="brand-card-siri__spin" aria-hidden="true" />
        <span className={faceClass}>{compactInner}</span>
      </button>
    );
  }

  const classes = `group flex flex-col bg-[#F7F9FC] rounded-2xl border border-[#E8EEF5] p-4 sm:p-5 no-underline transition-all duration-200 hover:border-primary/40 hover:bg-white hover:shadow-[0_10px_28px_rgba(5,101,230,0.1)] hover:-translate-y-0.5 ${className}`;

  if (to) {
    return (
      <Link to={to} state={state} className={classes} onClick={onClick}>
        {defaultInner}
      </Link>
    );
  }

  return (
    <button type="button" className={`${classes} text-left w-full`} onClick={onClick}>
      {defaultInner}
    </button>
  );
}
