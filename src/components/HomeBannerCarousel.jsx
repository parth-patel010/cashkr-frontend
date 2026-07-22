import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const FALLBACK_BANNERS = [
  {
    id: 'sell-phone',
    title: 'Sell old phone',
    subtitle: 'From your doorstep across India — fair price, instant payment.',
    ctaText: 'Sell Now',
    ctaLink: '/sell-old-mobile-phones/brand',
    imageUrl: '',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'buy-refurb',
    title: 'Buy refurbished devices',
    subtitle: 'Certified quality phones, laptops and more with warranty.',
    ctaText: 'Shop Now',
    ctaLink: '/buy',
    imageUrl: '',
    enabled: true,
    sortOrder: 2,
  },
  {
    id: 'sell-laptop',
    title: 'Sell old laptop',
    subtitle: 'Get the best price for your laptop with free doorstep pickup.',
    ctaText: 'Sell Now',
    ctaLink: '/sell-old-laptops/brand',
    imageUrl: '',
    enabled: true,
    sortOrder: 3,
  },
];

export async function fetchHomeBanners() {
  try {
    const { data } = await api.get('/app-settings');
    if (Array.isArray(data.banners) && data.banners.length) {
      return data.banners.filter((b) => b.enabled !== false);
    }
  } catch {
    // fallback
  }
  return FALLBACK_BANNERS.filter((b) => b.enabled !== false);
}

export default function HomeBannerCarousel() {
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchHomeBanners().then((list) => {
      if (list.length) setBanners(list);
    });
  }, []);

  const count = banners.length;
  const go = useCallback(
    (dir) => {
      if (!count) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return undefined;
    const timer = setInterval(() => go(1), 5500);
    return () => clearInterval(timer);
  }, [count, go]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (!count) return null;

  const banner = banners[index] || banners[0];

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[200px] sm:min-h-[280px] bg-gradient-to-br from-[#0565E6] via-[#0A7BFF] to-[#044BA8]">
        {banner.imageUrl ? (
          <img
            src={banner.imageUrl}
            alt={banner.title || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div
          className={`relative z-10 flex flex-col justify-center h-full min-h-[200px] sm:min-h-[280px] px-6 sm:px-12 py-10 sm:py-14 max-w-xl ${
            banner.imageUrl ? 'bg-gradient-to-r from-black/55 via-black/35 to-transparent' : ''
          }`}
        >
          {banner.title ? (
            <h1 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-black text-white leading-tight mb-3">
              {banner.title}
            </h1>
          ) : null}
          {banner.subtitle ? (
            <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed mb-6 max-w-md">
              {banner.subtitle}
            </p>
          ) : null}
          {banner.ctaText && banner.ctaLink ? (
            <Link
              to={banner.ctaLink}
              className="inline-flex self-start items-center bg-white text-gray-900 font-bold text-sm px-6 py-3 rounded-xl no-underline hover:bg-gray-100 transition-colors shadow-lg"
            >
              {banner.ctaText}
            </Link>
          ) : null}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
