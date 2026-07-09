const CURRENCY = 'INR';
const MOBILE_CATEGORY = 'mobile';

function trackMetaEvent(eventName, params = {}, options = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params, options);
  }
}

/** Fire at most once per session (InitiateCheckout, Purchase, ViewContent) */
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
  if (device.storage && !device.ram && device.category !== 'laptop' && device.category !== 'tablet' && device.category !== 'mac') {
    return true;
  }
  return false;
}

export function trackPhoneViewContent() {
  trackOnce('view_content_mobile', 'ViewContent', {
    content_category: MOBILE_CATEGORY,
    content_name: 'Sell Old Mobile Phones',
  });
}

/** User completed the quiz and received a price quote — always fires (no session dedupe) */
export function trackPhoneLead({ brand, modelName, value }) {
  const contentName = `${brand} ${modelName}`;
  const eventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  trackMetaEvent(
    'Lead',
    {
      content_category: MOBILE_CATEGORY,
      content_name: contentName,
      value: value || 0,
      currency: CURRENCY,
    },
    { eventID: eventId },
  );
}

export function trackPhoneInitiateCheckout({ brand, modelName, value }) {
  const slug = `${brand}_${modelName}`.replace(/\s+/g, '_').toLowerCase();
  trackOnce(`checkout_${slug}`, 'InitiateCheckout', {
    content_category: MOBILE_CATEGORY,
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}

export function trackPhonePurchase({ orderId, brand, modelName, value }) {
  trackOnce(`purchase_${orderId}`, 'Purchase', {
    content_category: MOBILE_CATEGORY,
    content_ids: orderId ? [orderId] : [],
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}
