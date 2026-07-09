const PIXEL_ID = '1003046282498279';
const CURRENCY = 'INR';
const MOBILE_CATEGORY = 'mobile';

function fireFbq(method, eventName, params = {}) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return false;
  window.fbq(method, PIXEL_ID, eventName, params);
  return true;
}

function trackOnce(sessionKey, fn) {
  if (typeof window === 'undefined') return;
  try {
    const key = `meta_pixel_${sessionKey}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage unavailable
  }
  fn();
}

export function isMobileQuote(device) {
  if (!device) return false;
  if (device.category === 'mobile') return true;
  if (device.storage && !device.ram && device.category !== 'laptop' && device.category !== 'tablet' && device.category !== 'mac') {
    return true;
  }
  return false;
}

function buildPhoneParams({ brand, modelName, value }) {
  return {
    content_category: MOBILE_CATEGORY,
    content_name: `${brand} ${modelName}`,
    value: Number(value) || 0,
    currency: CURRENCY,
  };
}

/** Retry until fbq is ready (async script load) */
function fireWithRetry(fn, retries = 5, delayMs = 400) {
  if (fn()) return;
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (fn() || attempts >= retries) clearInterval(timer);
  }, delayMs);
}

export function trackPhoneViewContent() {
  trackOnce('view_content_mobile', () => {
    fireWithRetry(() => fireFbq('trackSingle', 'ViewContent', {
      content_category: MOBILE_CATEGORY,
      content_name: 'Sell Old Mobile Phones',
    }));
  });
}

/**
 * Phone quote completed.
 * Fires standard Lead (for Meta Ads) + custom PhoneQuote (visible in Pixel Helper if Lead is filtered).
 */
export function trackPhoneLead({ brand, modelName, value }) {
  const params = buildPhoneParams({ brand, modelName, value });

  const fire = () => {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return false;
    // trackSingle targets this pixel explicitly
    window.fbq('trackSingle', PIXEL_ID, 'Lead', params);
    // Custom event — not blocked by most ad blockers; create a Custom Conversion on this in Meta
    window.fbq('trackSingleCustom', PIXEL_ID, 'PhoneQuote', params);
    return true;
  };

  fireWithRetry(fire);
}

export function trackPhoneInitiateCheckout({ brand, modelName, value }) {
  const slug = `${brand}_${modelName}`.replace(/\s+/g, '_').toLowerCase();
  const params = buildPhoneParams({ brand, modelName, value });
  trackOnce(`checkout_${slug}`, () => {
    fireWithRetry(() => fireFbq('trackSingle', 'InitiateCheckout', params));
  });
}

export function trackPhonePurchase({ orderId, brand, modelName, value }) {
  const params = {
    ...buildPhoneParams({ brand, modelName, value }),
    content_ids: orderId ? [orderId] : [],
  };
  trackOnce(`purchase_${orderId}`, () => {
    fireWithRetry(() => fireFbq('trackSingle', 'Purchase', params));
  });
}
