import { Link } from "react-router-dom";

/**
 * Grid card used on brand / model / category selection pages.
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
}) {
  const inner = (
    <>
      {image != null && (
        <div className="h-[88px] sm:h-[110px] flex items-center justify-center mb-3 rounded-xl bg-white border border-gray-100">
          {typeof image === "string" ? (
            <img
              src={image}
              alt={imageAlt || title}
              className="max-h-[72px] sm:max-h-[90px] max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            image
          )}
        </div>
      )}
      {title && (
        <h2 className="text-sm sm:text-base font-extrabold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
          {subtitle}
        </p>
      )}
      {footer}
    </>
  );

  const classes = `group flex flex-col bg-[#F7F9FC] rounded-2xl border border-[#E8EEF5] p-4 sm:p-5 no-underline transition-all duration-200 hover:border-primary/40 hover:bg-white hover:shadow-[0_10px_28px_rgba(5,101,230,0.1)] hover:-translate-y-0.5 ${className}`;

  if (to) {
    return (
      <Link to={to} state={state} className={classes} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={`${classes} text-left w-full`} onClick={onClick}>
      {inner}
    </button>
  );
}
