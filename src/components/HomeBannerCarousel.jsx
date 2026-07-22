import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const REPAIR_BANNER = {
  id: 'repair-banner',
  imageUrl: '/bannerr.jpeg',
  ctaLink: '/repair',
  title: 'Book a Repair Now',
  enabled: true,
  sortOrder: 3,
};

/** Homepage creatives: repair (test) + sell (fest). */
const APP_BANNERS = [
  {
    id: 'app-banner-1',
    imageUrl: '/test.jpeg',
    ctaLink: '/repair',
    title: 'Mobile Phone Repair',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'app-banner-2',
    imageUrl: '/fest.jpeg',
    ctaLink: '/sell-old-mobile-phones/brand',
    title: 'Sell Your Old Device',
    enabled: true,
    sortOrder: 2,
  },
];

function withRepairBanner(list) {
  const hasRepair = list.some(
    (b) =>
      b.id === 'repair-banner' ||
      b.ctaLink === '/repair' ||
      String(b.imageUrl || '').includes('bannerr'),
  );
  if (hasRepair) return list;
  return [...list, REPAIR_BANNER];
}

export async function fetchHomeBanners() {
  try {
    const { data } = await api.get('/app-settings');
    const fromAdmin = (data.banners || [])
      .filter((b) => b.enabled !== false && b.imageUrl)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (fromAdmin.length) return withRepairBanner(fromAdmin);
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
      className="w-full h-auto block"
    />
  );

  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden bg-[#E8F2FF]">
        {banner.ctaLink ? (
          <Link to={banner.ctaLink} className="block w-full no-underline">
            {slide}
          </Link>
        ) : (
          <div className="w-full">{slide}</div>
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
    </section>
  );
}
