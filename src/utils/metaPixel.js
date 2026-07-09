const CURRENCY = 'INR';
const MOBILE_CATEGORY = 'mobile';

function trackMetaEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params);
  }
}

/** Fire each named event at most once per browser session (avoids React StrictMode doubles) */
function trackOnce(sessionKey, eventName, params = {}) {
  if (typeof window === 'undefined') return;
  try {
    const key = `meta_pixel_${sessionKey}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage unavailable — still fire the event
  }
  trackMetaEvent(eventName, params);
}

export function isMobileQuote(device) {
  if (!device) return false;
  if (device.category === 'mobile') return true;
  // Phone quotes have storage; laptop/tablet quotes use ram / yearBracket
  if (device.storage && !device.ram && device.category !== 'laptop' && device.category !== 'tablet' && device.category !== 'mac') {
    return true;
  }
  return false;
}

/** Ad landing: user opens the sell-phone brand page */
export function trackPhoneViewContent() {
  trackOnce('view_content_mobile', 'ViewContent', {
    content_category: MOBILE_CATEGORY,
    content_name: 'Sell Old Mobile Phones',
  });
}

/** User completed the condition quiz and received a price quote */
export function trackPhoneLead({ brand, modelName, value }) {
  const slug = `${brand}_${modelName}`.replace(/\s+/g, '_').toLowerCase();
  trackOnce(`lead_${slug}`, 'Lead', {
    content_category: MOBILE_CATEGORY,
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}

/** User opened the schedule-pickup step */
export function trackPhoneInitiateCheckout({ brand, modelName, value }) {
  const slug = `${brand}_${modelName}`.replace(/\s+/g, '_').toLowerCase();
  trackOnce(`checkout_${slug}`, 'InitiateCheckout', {
    content_category: MOBILE_CATEGORY,
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}

/** User placed an order (pickup scheduled) */
export function trackPhonePurchase({ orderId, brand, modelName, value }) {
  trackOnce(`purchase_${orderId}`, 'Purchase', {
    content_category: MOBILE_CATEGORY,
    content_ids: orderId ? [orderId] : [],
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}
