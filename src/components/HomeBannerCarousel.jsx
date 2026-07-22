import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import banner1 from '../assets/banners/banner1.png';
import banner2 from '../assets/banners/banner2.png';

/** Same creatives as the DeviceKart mobile app (Main_images/banner1 & banner2). */
const APP_BANNERS = [
  {
    id: 'app-banner-1',
    imageUrl: banner1,
    ctaLink: '/sell-old-mobile-phones/brand',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'app-banner-2',
    imageUrl: banner2,
    ctaLink: '/buy',
    enabled: true,
    sortOrder: 2,
  },
];

export async function fetchHomeBanners() {
  try {
    const { data } = await api.get('/app-settings');
    const fromAdmin = (data.banners || [])
      .filter((b) => b.enabled !== false && b.imageUrl)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    // Prefer admin-uploaded images; otherwise use app banner assets
    if (fromAdmin.length) return fromAdmin;
  } catch {
    // fallback below
  }
  return APP_BANNERS;
}

export default function HomeBannerCarousel() {
  const [banners, setBanners] = useState(APP_BANNERS);
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
    const timer = setInterval(() => go(1), 3500);
    return () => clearInterval(timer);
  }, [count, go]);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (!count) return null;

  const banner = banners[index] || banners[0];
  const slide = (
    <img
      src={banner.imageUrl}
      alt={banner.title || 'DeviceKart banner'}
      className="w-full h-auto object-contain block"
    />
  );

  return (
    <section className="w-full pt-3 sm:pt-4">
      <div className="relative w-full">
        <div className="relative w-full bg-[#F2F4F7]">
          {banner.ctaLink ? (
            <Link to={banner.ctaLink} className="block w-full no-underline leading-none">
              {slide}
            </Link>
          ) : (
            slide
          )}

          {count > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous banner"
                onClick={(e) => {
                  e.preventDefault();
                  go(-1);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next banner"
                onClick={(e) => {
                  e.preventDefault();
                  go(1);
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-gray-800 flex items-center justify-center shadow hover:bg-white transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="flex justify-center gap-1.5 mt-2.5 px-4">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1 rounded-full transition-all ${
                  i === index ? 'w-9 bg-[#0565E6]' : 'w-7 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
