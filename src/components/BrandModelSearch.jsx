import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { deviceService } from "../services/device.service";

const CATEGORY_ROUTE_MAP = {
  mobile: "/sell-old-mobile-phones",
  tablet: "/sell-tablet",
  laptop: "/sell-old-laptops",
  mac: "/sell-imac",
  tv: "/sell/tv",
  refrigerator: "/sell/refrigerator",
  earbuds: "/sell/earbuds",
  smartwatch: "/sell/smartwatch",
  gaming: "/sell/gaming",
};

/** Category-only fallbacks — never reuse phone chips on other brand pages. */
const FALLBACK_POPULAR_BY_CATEGORY = {
  mobile: ["iPhone 15", "Galaxy S23 Ultra", "OnePlus 11R", "iPhone 14", "Nothing Phone (2)"],
  laptop: ["MacBook Air M2", "MacBook Pro", "Dell XPS 13", "HP Pavilion", "Lenovo ThinkPad"],
  tablet: ["iPad Air", "iPad Pro", "iPad 10th Gen", "Galaxy Tab S9", "Galaxy Tab A9"],
  mac: ["iMac 24-inch", "iMac M1", "iMac M3", "iMac 27-inch", "iMac Retina"],
  smartwatch: ["Apple Watch Series 9", "Apple Watch SE", "Galaxy Watch 6", "Noise ColorFit", "boAt Wave"],
  earbuds: ["AirPods Pro", "AirPods 3", "Galaxy Buds 2", "OnePlus Buds", "Sony WF-1000XM5"],
  gaming: ["PlayStation 5", "Xbox Series X", "Xbox Series S", "Nintendo Switch", "PlayStation 4"],
  tv: ["Samsung Smart TV", "LG OLED", "Sony Bravia", "Mi TV", "OnePlus TV"],
  refrigerator: ["Samsung Fridge", "LG Refrigerator", "Whirlpool", "Godrej", "Haier"],
};

function getFallbackPopular(category) {
  return FALLBACK_POPULAR_BY_CATEGORY[category] || [];
}

/**
 * Pill search + popular queries for the sell brand page.
 * Popular chips are always scoped to the page category (never universal phone list).
 */
export default function BrandModelSearch({ category = "mobile" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [popular, setPopular] = useState(() => getFallbackPopular(category));
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setPopular(getFallbackPopular(category));
    setQuery("");
    setResults([]);
    setShowResults(false);

    let cancelled = false;
    deviceService
      .getPopularSearches(5, category)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const labels = list
          .filter((d) => !d.category || d.category === category)
          .map((d) => d.label || d.modelName)
          .filter(Boolean);
        setPopular(labels.length ? labels : getFallbackPopular(category));
      })
      .catch(() => {
        if (!cancelled) setPopular(getFallbackPopular(category));
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  const performSearch = useCallback(
    async (q) => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const { data } = await deviceService.searchDevices(q.trim(), category);
        setResults(Array.isArray(data) ? data : []);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [category],
  );

  const onSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    setShowResults(true);
    debounceRef.current = setTimeout(() => performSearch(value), 280);
  };

  const goToResult = (result) => {
    if (result.slug) {
      deviceService.recordSearch(result.slug).catch(() => {});
    }
    if (result.category === "tv" || result.category === "refrigerator") {
      navigate(CATEGORY_ROUTE_MAP[result.category] || "/sell");
    } else {
      const base = CATEGORY_ROUTE_MAP[result.category] || "/sell-old-mobile-phones";
      navigate(`${base}/${encodeURIComponent(result.brand)}/${result.slug}`);
    }
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const runSearch = () => {
    if (query.trim().length >= 2) performSearch(query);
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 sm:mt-12 px-1">
      <div ref={searchRef} className="relative">
        <div className="flex items-center gap-2 sm:gap-3 bg-[#EEF2F7] rounded-full pl-4 sm:pl-5 pr-2 py-2 shadow-[0_4px_18px_rgba(15,23,42,0.06)] border border-white/80">
          <Search size={18} className="text-[#0565E6] shrink-0" strokeWidth={2.4} />
          <input
            type="search"
            value={query}
            onChange={onSearchChange}
            onFocus={() => {
              if (results.length || searching) setShowResults(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder="Search your brand or model..."
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm sm:text-[15px] text-gray-800 placeholder:text-gray-400 py-2"
            aria-label="Search brand or model"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={runSearch}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0565E6] hover:bg-[#0450C5] text-white flex items-center justify-center shrink-0 transition-colors shadow-md shadow-[#0565E6]/30"
            aria-label="Search"
          >
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {showResults && (
          <div
            className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_16px_40px_rgba(15,23,42,0.16)] z-[60] max-h-72 overflow-y-auto"
            role="listbox"
          >
            {searching ? (
              <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                No devices found for &quot;{query}&quot;
              </div>
            ) : (
              results.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  role="option"
                  onClick={() => goToResult(r)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F4F8FF] border-b border-gray-50 last:border-0 bg-white"
                >
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt=""
                      className="w-9 h-9 object-contain rounded shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-gray-100 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.modelName}</p>
                    <p className="text-xs text-gray-400">{r.brand}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 mt-4 transition-opacity duration-200 ${
          showResults ? "opacity-30 pointer-events-none select-none" : "opacity-100"
        }`}
        aria-hidden={showResults}
      >
        {popular.length > 0 ? (
          <>
            <span className="text-sm font-bold text-gray-800 mr-1">Popular Searches:</span>
            {popular.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  performSearch(tag);
                }}
                className="text-sm font-medium text-gray-600 bg-[#EEF2F7] hover:bg-[#E8F0FE] hover:text-[#0565E6] rounded-full px-3.5 py-2 transition-colors"
              >
                {tag}
              </button>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
