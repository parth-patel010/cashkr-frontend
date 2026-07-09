const CURRENCY = 'INR';
const MOBILE_CATEGORY = 'mobile';

function trackMetaEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, params);
  }
}

/** Ad landing: user opens the sell-phone brand page */
export function trackPhoneViewContent() {
  trackMetaEvent('ViewContent', {
    content_category: MOBILE_CATEGORY,
    content_name: 'Sell Old Mobile Phones',
  });
}

/** User completed the condition quiz and received a price quote */
export function trackPhoneLead({ brand, modelName, value }) {
  trackMetaEvent('Lead', {
    content_category: MOBILE_CATEGORY,
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}

/** User opened the schedule-pickup step */
export function trackPhoneInitiateCheckout({ brand, modelName, value }) {
  trackMetaEvent('InitiateCheckout', {
    content_category: MOBILE_CATEGORY,
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}

/** User placed an order (pickup scheduled) */
export function trackPhonePurchase({ orderId, brand, modelName, value }) {
  trackMetaEvent('Purchase', {
    content_category: MOBILE_CATEGORY,
    content_ids: orderId ? [orderId] : [],
    content_name: `${brand} ${modelName}`,
    value: value || 0,
    currency: CURRENCY,
  });
}
