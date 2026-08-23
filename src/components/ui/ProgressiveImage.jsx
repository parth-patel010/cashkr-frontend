import { useEffect, useRef, useState } from "react";

/**
 * Image with shimmer placeholder + fade-in (avoids sudden pop-in on large PNGs).
 */
export default function ProgressiveImage({
  src,
  alt = "",
  className = "",
  wrapperClassName = "",
  skeletonClassName = "",
  priority = false,
  onLoaded,
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);

    const img = new Image();
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      setLoaded(true);
      onLoadedRef.current?.();
      return undefined;
    }

    img.onload = () => {
      setLoaded(true);
      onLoadedRef.current?.();
    };
    img.onerror = () => setFailed(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    onLoadedRef.current?.();
  };

  return (
    <span className={`progressive-img-wrap inline-block relative ${wrapperClassName}`}>
      {!loaded && !failed ? (
        <span
          className={`progressive-img-skeleton absolute inset-0 rounded-2xl ${skeletonClassName}`}
          aria-hidden="true"
        />
      ) : null}
      <img
        src={src}
        alt={alt}
        className={`progressive-img ${loaded ? "is-loaded" : ""} ${className}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={handleLoad}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
