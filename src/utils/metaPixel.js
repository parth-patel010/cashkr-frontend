const PIXEL_ID = '1003046282498279';
const CURRENCY = 'INR';
const MOBILE_CATEGORY = 'mobile';
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

function generateEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'evt_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function fireCapiEvent(eventName, params, eventId) {
  try {
    await fetch(`${API_BASE}/events/capi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventName,
        customData: params,
        eventId,
        eventSourceUrl: window.location.href,
      })
    });
  } catch (error) {
    console.error('Failed to send CAPI event:', error);
  }
}

function fireFbq(method, eventName, params = {}, eventId = null) {
  if (typeof window === 'undefined') return false;
  
  const options = eventId ? { eventID: eventId } : {};
  
  if (typeof window.fbq === 'function') {
    window.fbq(method, PIXEL_ID, eventName, params, options);
  }
  
  // Always try to fire CAPI event as well
  if (eventId && method === 'trackSingle') {
    fireCapiEvent(eventName, params, eventId);
  }
  
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
    const eventId = generateEventId();
    fireWithRetry(() => fireFbq('trackSingle', 'ViewContent', {
      content_category: MOBILE_CATEGORY,
      content_name: 'Sell Old Mobile Phones',
    }, eventId));
  });
}

/**
 * Phone quote completed.
 * Fires standard Lead (for Meta Ads) + custom PhoneQuote (visible in Pixel Helper if Lead is filtered).
 */
export function trackPhoneLead({ brand, modelName, value }) {
  const params = buildPhoneParams({ brand, modelName, value });
  const eventId = generateEventId();

  const fire = () => {
    if (typeof window === 'undefined') return false;
    
    // Fire CAPI event manually here since we have a custom flow
    fireCapiEvent('Lead', params, eventId);
    
    if (typeof window.fbq === 'function') {
      window.fbq('trackSingle', PIXEL_ID, 'Lead', params, { eventID: eventId });
      window.fbq('trackSingleCustom', PIXEL_ID, 'PhoneQuote', params);
    }
    return true;
  };

  fireWithRetry(fire);
}

export function trackPhoneInitiateCheckout({ brand, modelName, value }) {
  const slug = `${brand}_${modelName}`.replace(/\s+/g, '_').toLowerCase();
  const params = buildPhoneParams({ brand, modelName, value });
  const eventId = generateEventId();
  
  trackOnce(`checkout_${slug}`, () => {
    fireWithRetry(() => fireFbq('trackSingle', 'InitiateCheckout', params, eventId));
  });
}

export function trackPhonePurchase({ orderId, brand, modelName, value }) {
  const params = {
    ...buildPhoneParams({ brand, modelName, value }),
    content_ids: orderId ? [orderId] : [],
  };
  const eventId = orderId || generateEventId(); // orderId is a good deduplication key for Purchase
  
  trackOnce(`purchase_${orderId}`, () => {
    fireWithRetry(() => fireFbq('trackSingle', 'Purchase', params, eventId));
  });
}
