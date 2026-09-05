import { useState } from 'react';

/**
 * Shows a custom quiz PNG when available; falls back to Lucide Icon.
 */
export default function QuizOptionIcon({
  src,
  Icon,
  size = 40,
  selected = false,
  alt = '',
  className = '',
}) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  if (showImg) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 rounded-xl bg-white/80 ${className}`}
        style={{ width: size + 8, height: size + 8 }}
      >
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="object-contain"
          style={{ width: size, height: size }}
        />
      </span>
    );
  }

  if (Icon) {
    return (
      <Icon
        size={size * 0.7}
        strokeWidth={1.6}
        className={`shrink-0 ${selected ? 'text-primary' : 'text-gray-500'} ${className}`}
      />
    );
  }

  return null;
}
