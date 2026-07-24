import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { deviceService } from "../services/device.service";
import { repairService } from "../services/repair.service";
import {
  fetchWebsiteCategories,
  sellCategories,
  buyCategories,
  FALLBACK_WEBSITE_CATEGORIES,
} from "../utils/websiteCategories";
import logo from "../assets/logo.png";

const TOP_BRANDS_COUNT = 6;

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3l7 3v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" fill="#0565E6" />
    <path d="M9.2 12.2l1.8 1.8 3.8-3.8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function scrollToHash(hash) {
  const el = document.getElementById(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function categoryDisplayLabel(cat) {
  if (cat.key === "mobile") return "Phone";
  if (cat.key === "mac") return "iMac";
  return cat.label;
}

function sellBrandPath(cat, brandName) {
  const slug = encodeURIComponent((brandName || "").toLowerCase());
  const base = (cat.sellPath || "").replace(/\/brand\/?$/, "") || `/sell/${cat.key}`;
  return `${base}/${slug}`;
}

function buyBrandPath(cat, brand) {
  const slug = encodeURIComponent((brand.slug || brand.brand || "").toLowerCase());
  return `/buy/${cat.key}/${slug}`;
}

function MegaDropdown({
  type,
  categories,
  activeKey,
  onHoverCategory,
  onClearCategory,
  brands,
  brandsLoading,
  onNavigate,
}) {
  const clearTimer = useRef(null);
  const activeCat = activeKey ? categories.find((c) => c.key === activeKey) : null;
  const showBrands = Boolean(activeCat);

  const label = activeCat ? categoryDisplayLabel(activeCat) : "";
  const topBrands = brands.slice(0, TOP_BRANDS_COUNT);

  const allBrandsPath = activeCat
    ? type === "sell"
      ? activeCat.sellPath
      : type === "buy"
        ? activeCat.buyPath || `/buy/${activeCat.key}/brand`
        : "/repair"
    : null;

  const brandTo = (brand) => {
    if (type === "sell") return sellBrandPath(activeCat, brand.brand);
    if (type === "buy") return buyBrandPath(activeCat, brand);
    return `/repair?brand=${encodeURIComponent(brand.brand)}`;
  };

  const scheduleClearBrands = () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => onClearCategory(), 60);
  };

  const cancelClearBrands = () => {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
  };

  useEffect(() => () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
  }, []);

  return (
    <div className="absolute left-0 top-full z-[2000]">
      <div className="flex bg-white rounded-b-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-t-0 border-gray-100 overflow-hidden">
        {/* Categories — brands appear only while a category is hovered */}
        <div
          className={`w-[200px] py-2 bg-gray-50 ${showBrands ? "border-r border-gray-100" : ""}`}
          onMouseLeave={scheduleClearBrands}
        >
          {categories.map((cat) => {
            const isActive = showBrands && cat.key === activeCat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onMouseEnter={() => {
                  cancelClearBrands();
                  onHoverCategory(cat.key);
                }}
                onFocus={() => onHoverCategory(cat.key)}
                onClick={() =>
                  onNavigate(
                    type === "repair"
                      ? "/repair"
                      : type === "sell"
                        ? cat.sellPath
                        : cat.buyPath || `/buy/${cat.key}/brand`
                  )
                }
                className={`w-full flex items-center justify-between px-5 py-3 text-left text-[15px] font-semibold transition-colors
                  ${isActive ? "bg-white text-[#0565E6]" : "text-gray-800 hover:bg-white/80"}`}
              >
                <span>{categoryDisplayLabel(cat)}</span>
                <span className={isActive ? "text-[#0565E6]" : "text-gray-300"}>
                  <ChevronRight />
                </span>
              </button>
            );
          })}
        </div>

        {/* Brands — stays while hovering category or this panel; gone otherwise */}
        {showBrands && (
          <div
            className="w-[260px] py-4 px-5 min-h-[220px] bg-white"
            onMouseEnter={cancelClearBrands}
            onMouseLeave={scheduleClearBrands}
          >
            <p className="text-xs text-gray-400 font-medium mb-3">More in {label}</p>
            <p className="text-sm font-bold text-gray-900 mb-2">Top Brands</p>

            {brandsLoading ? (
              <div className="py-6 text-sm text-gray-400">Loading…</div>
            ) : topBrands.length === 0 ? (
              <div className="py-6 text-sm text-gray-400">No brands yet</div>
            ) : (
              <div className="flex flex-col">
                {topBrands.map((b) => (
                  <button
                    key={b.brand}
                    type="button"
                    onClick={() => onNavigate(brandTo(b), { brandName: b.brand })}
                    className="text-left py-2 text-[14px] text-gray-700 hover:text-[#0565E6] transition-colors"
                  >
                    {b.brand}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onNavigate(allBrandsPath)}
                  className="text-left py-2.5 mt-1 text-[14px] font-medium text-gray-800 hover:text-[#0565E6] transition-colors"
                >
                  More {label} Brands
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_WEBSITE_CATEGORIES);
  const [openMenu, setOpenMenu] = useState(null);
  const [activeCategory, setActiveCategory] = useState({});
  const [brandsCache, setBrandsCache] = useState({});
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [mobileExpand, setMobileExpand] = useState(null);
  const [mobileCat, setMobileCat] = useState({});

  const closeTimer = useRef(null);
  const brandsCacheRef = useRef({});
  const loadingKeysRef = useRef(new Set());
  const auth = useAuth();
  const isLoggedIn = auth?.isAuthenticated;
  const userName = auth?.user?.name;
  const navigate = useNavigate();
  const location = useLocation();

  const sellCats = useMemo(() => sellCategories(categories), [categories]);
  const buyCats = useMemo(() => buyCategories(categories), [categories]);
  const repairCats = useMemo(
    () => [{ key: "mobile", label: "Phone", sellPath: "/repair", buyPath: "/repair" }],
    []
  );

  const menuCategories = useCallback(
    (type) => {
      if (type === "sell") return sellCats;
      if (type === "buy") return buyCats;
      return repairCats;
    },
    [sellCats, buyCats, repairCats]
  );

  useEffect(() => {
    fetchWebsiteCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMenu(null);
    setMobileExpand(null);
  }, [location.pathname, location.hash]);

  const cacheKey = (type, catKey) => `${type}:${catKey}`;

  const loadBrands = useCallback(async (type, catKey) => {
    if (!catKey) return;
    const key = cacheKey(type, catKey);
    if (brandsCacheRef.current[key] || loadingKeysRef.current.has(key)) return;

    loadingKeysRef.current.add(key);
    setBrandsLoading(true);
    try {
      let list = [];
      if (type === "repair") {
        const { data } = await repairService.getBrands(catKey);
        list = Array.isArray(data) ? data : [];
      } else {
        const offer = type === "buy" ? "buy" : "sell";
        const { data } = await deviceService.getBrands(catKey, offer);
        list = Array.isArray(data) ? data : [];
        if (type === "buy") {
          list = list.filter((b) => Number(b.modelCount) > 0);
        }
      }
      list = [...list].sort((a, b) => (a.brand || "").localeCompare(b.brand || ""));
      brandsCacheRef.current[key] = list;
      setBrandsCache((prev) => ({ ...prev, [key]: list }));
    } catch {
      brandsCacheRef.current[key] = [];
      setBrandsCache((prev) => ({ ...prev, [key]: [] }));
    } finally {
      loadingKeysRef.current.delete(key);
      setBrandsLoading(false);
    }
  }, []);

  const openDropdown = (type) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenMenu(type);
    // Don't preselect a category — brands panel appears only after category hover
    setActiveCategory((prev) => ({ ...prev, [type]: null }));
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
      setActiveCategory({});
    }, 120);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const hoverCategory = (type, catKey) => {
    setActiveCategory((prev) => ({ ...prev, [type]: catKey }));
    loadBrands(type, catKey);
  };

  const clearCategory = (type) => {
    setActiveCategory((prev) => ({ ...prev, [type]: null }));
  };

  const goTo = (to, state) => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    setMobileExpand(null);
    if (state) navigate(to, { state });
    else navigate(to);
  };

  const handleSimpleNav = (to) => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
    if (!to.includes("#")) {
      navigate(to);
      return;
    }
    const [path, hash] = to.split("#");
    const targetPath = path || "/";
    if (window.location.pathname !== targetPath) {
      navigate(to);
      setTimeout(() => scrollToHash(hash), 100);
    } else {
      navigate({ pathname: targetPath, hash });
      scrollToHash(hash);
    }
  };

  const dropdownMenus = [
    { key: "sell", label: "Sell Device", activeMatch: (p) => p.startsWith("/sell") },
    { key: "buy", label: "Buy Refurbished", activeMatch: (p) => p.startsWith("/buy") },
    { key: "repair", label: "Repair Device", activeMatch: (p) => p.startsWith("/repair") },
  ];

  const simpleLinks = [
    { label: "How It Works", to: "/#how-it-works" },
    { label: "Bulk Deals", to: "/corporate" },
  ];

  return (
    <nav className="sticky top-0 z-[1000] bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-stretch justify-between gap-4">
        <Link to="/" className="flex items-center shrink-0 no-underline self-center" aria-label="DeviceKart Home">
          <img
            src={logo}
            alt="DeviceKart — Sell Old. Upgrade Smart."
            className="h-11 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-stretch justify-center gap-0.5 xl:gap-1 flex-1 self-stretch">
          {dropdownMenus.map((menu) => {
            const isOpen = openMenu === menu.key;
            const isActive = menu.activeMatch(location.pathname);
            const catKey = activeCategory[menu.key] || null;
            const brandKey = catKey ? cacheKey(menu.key, catKey) : null;
            return (
              <div
                key={menu.key}
                className="relative flex items-center h-full"
                onMouseEnter={() => {
                  cancelClose();
                  openDropdown(menu.key);
                }}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1.5 px-3 xl:px-4 h-full text-[15px] font-medium whitespace-nowrap transition-colors
                    ${isOpen || isActive ? "text-[#0565E6]" : "text-gray-700 hover:text-[#0565E6]"}`}
                  aria-expanded={isOpen}
                  onClick={() => (isOpen ? setOpenMenu(null) : openDropdown(menu.key))}
                >
                  {menu.label}
                  <ChevronDown open={isOpen} />
                </button>

                {isOpen && (
                  <MegaDropdown
                    type={menu.key}
                    categories={menuCategories(menu.key)}
                    activeKey={catKey}
                    onHoverCategory={(key) => hoverCategory(menu.key, key)}
                    onClearCategory={() => clearCategory(menu.key)}
                    brands={brandKey ? brandsCache[brandKey] || [] : []}
                    brandsLoading={Boolean(brandKey && !brandsCache[brandKey] && (brandsLoading || loadingKeysRef.current.has(brandKey)))}
                    onNavigate={goTo}
                  />
                )}
              </div>
            );
          })}

          {simpleLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleSimpleNav(link.to)}
              className="px-3 xl:px-4 text-[15px] font-medium whitespace-nowrap text-gray-700 hover:text-[#0565E6] transition-colors self-center"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right utilities */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-center">
          <div className="hidden sm:flex items-center gap-2 text-gray-400">
            <ShieldIcon />
            <span className="text-sm font-medium tracking-wide whitespace-nowrap">Secure &amp; Trusted</span>
          </div>

          <Link
            to={isLoggedIn ? "/dashboard" : "/login"}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors no-underline"
            aria-label={isLoggedIn ? "Go to dashboard" : "Login"}
            title={isLoggedIn ? userName || "Dashboard" : "Login"}
          >
            {isLoggedIn && userName ? (
              <span className="text-sm font-bold text-[#0565E6]">{userName[0]?.toUpperCase()}</span>
            ) : (
              <UserIcon />
            )}
          </Link>

          <button
            type="button"
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay + panel */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="lg:hidden fixed inset-0 top-[72px] z-[999] bg-black/30 border-none cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="lg:hidden relative z-[1000] border-t border-gray-100 bg-white shadow-lg max-h-[calc(100vh-72px)] overflow-y-auto">
            <div className="px-3 py-3 space-y-1">
              {dropdownMenus.map((menu) => {
              const expanded = mobileExpand === menu.key;
              const cats = menuCategories(menu.key);
              const catKey = mobileCat[menu.key] || cats[0]?.key;
              const brands = brandsCache[cacheKey(menu.key, catKey)] || [];

              return (
                <div key={menu.key} className="border-b border-gray-50 pb-1">
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium transition-colors
                      ${expanded ? "text-[#0565E6] bg-[#EEF4FF]" : "text-gray-700 hover:bg-gray-50"}`}
                    onClick={() => {
                      const next = expanded ? null : menu.key;
                      setMobileExpand(next);
                      if (next && catKey) {
                        setMobileCat((prev) => ({ ...prev, [menu.key]: catKey }));
                        loadBrands(menu.key, catKey);
                      }
                    }}
                  >
                    {menu.label}
                    <ChevronDown open={expanded} />
                  </button>

                  {expanded && (
                    <div className="mt-1 mb-2 mx-2 rounded-xl border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Category
                      </div>
                      {cats.map((cat) => {
                        const selected = cat.key === catKey;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            className={`w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-semibold
                              ${selected ? "text-[#0565E6] bg-white" : "text-gray-700 bg-white hover:bg-gray-50"}`}
                            onClick={() => {
                              setMobileCat((prev) => ({ ...prev, [menu.key]: cat.key }));
                              loadBrands(menu.key, cat.key);
                            }}
                          >
                            {categoryDisplayLabel(cat)}
                            <ChevronRight />
                          </button>
                        );
                      })}

                      <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-t border-gray-100">
                        Top Brands — {categoryDisplayLabel(cats.find((c) => c.key === catKey) || cats[0])}
                      </div>
                      <div className="bg-white px-2 py-1">
                        {brands.slice(0, TOP_BRANDS_COUNT).map((b) => {
                          const cat = cats.find((c) => c.key === catKey) || cats[0];
                          const to =
                            menu.key === "sell"
                              ? sellBrandPath(cat, b.brand)
                              : menu.key === "buy"
                                ? buyBrandPath(cat, b)
                                : `/repair?brand=${encodeURIComponent(b.brand)}`;
                          return (
                            <button
                              key={b.brand}
                              type="button"
                              onClick={() => goTo(to, { brandName: b.brand })}
                              className="w-full text-left px-3 py-3.5 text-sm text-gray-700 hover:text-[#0565E6]"
                            >
                              {b.brand}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            const cat = cats.find((c) => c.key === catKey) || cats[0];
                            const path =
                              menu.key === "sell"
                                ? cat.sellPath
                                : menu.key === "buy"
                                  ? cat.buyPath || `/buy/${cat.key}/brand`
                                  : "/repair";
                            goTo(path);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-800 hover:text-[#0565E6]"
                        >
                          More {categoryDisplayLabel(cats.find((c) => c.key === catKey) || cats[0])} Brands
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {simpleLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleSimpleNav(link.to)}
                className="w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50"
              >
                {link.label}
              </button>
            ))}

            <div className="flex items-center gap-2 px-4 py-3 text-gray-400 sm:hidden">
              <ShieldIcon />
              <span className="text-sm font-medium">Secure &amp; Trusted</span>
            </div>
          </div>
        </div>
        </>
      )}
    </nav>
  );
}
