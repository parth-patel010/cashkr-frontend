import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deviceService } from "../services/device.service";
import {
  fetchWebsiteCategories,
  sellCategories,
  buyCategories,
  FALLBACK_WEBSITE_CATEGORIES,
} from "../utils/websiteCategories";
import logo from "../assets/logo.png";

function buildNavItems(categories) {
  const sell = sellCategories(categories);
  const buy = buyCategories(categories);
  const byKey = Object.fromEntries(categories.map((c) => [c.key, c]));
  const mobile = byKey.mobile;
  const laptop = byKey.laptop;
  const gadgets = sell.filter((c) => c.key !== 'mobile');
  const firstSell = sell[0]?.sellPath || '/sell-old-mobile-phones/brand';

  const items = [{ label: 'All', hasDropdown: false, to: '/#our-services' }];

  if (mobile?.enabledSell !== false) {
    items.push({
      label: 'Sell Phone',
      hasDropdown: false,
      to: mobile?.sellPath || '/sell-old-mobile-phones/brand',
    });
  }

  if (gadgets.length > 0) {
    items.push({
      label: 'Sell Gadgets',
      hasDropdown: true,
      items: gadgets.map((c) => ({ label: c.label, to: c.sellPath || '/' })),
    });
  }

  if (buy.length > 0) {
    items.push({ label: 'Buy Refurbished Devices', hasDropdown: false, to: '/buy' });
    items.push({ label: 'Find New Gadget', hasDropdown: false, to: '/buy' });
  }

  items.push({ label: 'Repair', hasDropdown: false, to: '/repair' });

  if (laptop?.enabledBuy !== false) {
    items.push({
      label: 'Buy Laptop',
      hasDropdown: false,
      to: laptop?.buyPath || '/buy/laptop/brand',
    });
  }

  return { items, firstSell };
}

const CATEGORY_ROUTE_MAP = {
  mobile: "/sell-old-mobile-phones",
  tablet: "/sell-tablet",
  laptop: "/sell-old-laptops",
  mac: "/sell-imac",
};

const CATEGORY_LABELS = {
  mobile: "Mobile",
  tablet: "Tablet",
  laptop: "Laptop",
  mac: "iMac",
};

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [activeItem, setActiveItem] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_WEBSITE_CATEGORIES);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const debounceTimer = useRef(null);

  const auth = useAuth();
  const isLoggedIn = auth?.isAuthenticated;
  const userName = auth?.user?.name;
  const navigate = useNavigate();

  const { items: navItems, firstSell } = useMemo(() => buildNavItems(categories), [categories]);

  useEffect(() => {
    fetchWebsiteCategories().then(setCategories);
  }, []);

  const handleMobileExpand = (label) => {
    setMobileExpanded((prev) => (prev === label ? null : label));
  };

  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const { data } = await deviceService.searchDevices(query.trim());
      setSearchResults(data);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    setShowResults(true);
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleResultClick = (result) => {
    const basePath = CATEGORY_ROUTE_MAP[result.category] || "/sell-old-mobile-phones";
    navigate(`${basePath}/${encodeURIComponent(result.brand)}/${result.slug}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOutsideDesktop = searchRef.current && !searchRef.current.contains(e.target);
      const clickedOutsideMobile = !mobileSearchRef.current || !mobileSearchRef.current.contains(e.target);
      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const renderSearchResults = () => {
    if (!showResults) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[2000] max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
        {isSearching ? (
          <div className="px-4 py-3 text-center text-gray-500 text-sm">Searching...</div>
        ) : searchResults.length === 0 ? (
          <div className="px-4 py-3 text-center text-gray-500 text-sm">
            No devices found for "<strong>{searchQuery}</strong>"
          </div>
        ) : (
          searchResults.map((result) => (
            <button
              key={result.slug}
              onClick={() => handleResultClick(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
            >
              {result.imageUrl ? (
                <img src={result.imageUrl} alt={result.modelName} className="w-10 h-10 object-cover rounded" />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                  <SearchIcon />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{result.modelName}</p>
                <p className="text-xs text-gray-500">
                  {result.brand} · {CATEGORY_LABELS[result.category] || result.category}
                </p>
              </div>
              {result.maxPrice > 0 && (
                <p className="text-sm font-semibold text-primary whitespace-nowrap">
                  ₹{result.maxPrice.toLocaleString("en-IN")}
                </p>
              )}
            </button>
          ))
        )}
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-[1000] bg-white border-b border-gray-100 mx-4 sm:mx-8 mt-2 rounded-xl shadow-sm">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 h-16 gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center no-underline shrink-0">
          <img
            src={logo}
            alt="DeviceKart"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Search (Desktop) */}
        <div className="hidden md:block flex-1 max-w-md relative" ref={searchRef}>
          <input
            type="text"
            placeholder="Search for mobiles, accessories & more"
            className="w-full pl-4 pr-10 py-2.5 border-1.5 border-gray-300 rounded-xl text-sm font-sans text-gray-800 outline-none bg-gray-200 focus:border-primary focus:bg-white transition-all"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchResults.length > 0 || searchQuery.length >= 2) setShowResults(true);
            }}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
            <SearchIcon />
          </button>
          {renderSearchResults()}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm no-underline transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                {userName?.[0]?.toUpperCase() || "U"}
              </div>
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm no-underline transition-colors">
              <UserIcon />
              Login
            </Link>
          )}

          <Link
            to={firstSell}
            className="bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-all no-underline shadow-sm hover:-translate-y-px active:translate-y-0 uppercase tracking-wide"
          >
            Sell Now
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Bottom Nav (Desktop) */}
      <div className="hidden md:flex items-center justify-around px-8 h-12 gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.label)}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeItem === item.label ? "text-text-primary font-bold bg-gray-50" : "text-gray-500 hover:text-primary hover:bg-primary-light"}`}
              onClick={() => {
                setActiveItem(item.label);
                if (!item.to) return;
                if (item.to.includes('#')) {
                  const [path, hash] = item.to.split('#');
                  if (path && path !== '/' && window.location.pathname !== path) {
                    navigate(item.to);
                  } else {
                    navigate({ pathname: path || '/', hash: hash || undefined });
                    const el = document.getElementById(hash);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                } else {
                  navigate(item.to);
                }
              }}
            >
              {item.label}
              {item.hasDropdown && (
                <span className={`transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`}>
                  <ChevronDown />
                </span>
              )}
            </button>

            {item.hasDropdown && openDropdown === item.label && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl min-w-[200px] py-2 z-[2000] animate-in fade-in slide-in-from-top-2 duration-150">
                {item.items.map((sub) => (
                  <button
                    key={sub.label || sub}
                    className="block w-full text-left px-5 py-2.5 text-sm text-gray-600 hover:bg-primary-light hover:text-primary transition-colors font-sans"
                    onClick={() => {
                      setActiveItem(item.label);
                      setOpenDropdown(null);
                      if (sub.to) navigate(sub.to);
                    }}
                  >
                    {sub.label || sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-18 bg-white z-[999] overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200 p-4">
          <div className="mb-6 relative" ref={mobileSearchRef}>
            <input
              type="text"
              placeholder="Search for mobiles, accessories & more"
              className="w-full px-4 py-3 border-1.5 border-gray-300 rounded-xl text-sm font-sans bg-gray-200 outline-none focus:border-primary focus:bg-white"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0 || searchQuery.length >= 2) setShowResults(true);
              }}
            />
            {renderSearchResults()}
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <button
                  className={`flex items-center justify-between w-full px-5 py-4 text-left font-medium border-b border-gray-50 transition-colors
                    ${activeItem === item.label ? "text-primary font-bold" : "text-gray-700 hover:bg-gray-50"}`}
                  onClick={() => {
                    if (!item.hasDropdown) {
                      setActiveItem(item.label);
                      setMobileMenuOpen(false);
                      if (item.to) navigate(item.to);
                    } else {
                      handleMobileExpand(item.label);
                    }
                  }}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <span className={`transition-transform duration-200 ${mobileExpanded === item.label ? "rotate-180" : ""}`}>
                      <ChevronDown />
                    </span>
                  )}
                </button>

                {item.hasDropdown && mobileExpanded === item.label && (
                  <div className="bg-gray-50 px-8 py-2 border-b border-gray-100">
                    {item.items.map((sub) => (
                      <button
                        key={sub.label || sub}
                        className="block w-full text-left py-3 text-sm text-gray-500 hover:text-primary transition-colors"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (sub.to) navigate(sub.to);
                        }}
                      >
                        {sub.label || sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {isLoggedIn ? (
              <Link to="/dashboard" className="flex items-center justify-center gap-2 p-4 border-1.5 border-gray-200 rounded-xl font-medium text-gray-700 no-underline hover:border-primary hover:text-primary transition-colors">
                <UserIcon /> Dashboard
              </Link>
            ) : (
              <Link to="/login" className="flex items-center justify-center gap-2 p-4 border-1.5 border-gray-200 rounded-xl font-medium text-gray-700 no-underline hover:border-primary hover:text-primary transition-colors">
                <UserIcon /> Login
              </Link>
            )}
            <Link to={firstSell} className="bg-primary text-white p-4 rounded-xl font-bold text-center no-underline shadow-lg uppercase tracking-wider">
              Sell Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}