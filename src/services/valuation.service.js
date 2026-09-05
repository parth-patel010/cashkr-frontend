import api from './api';

/** Submit only saves the record — live market agent runs server-side while the modal polls status. */
const VALUATION_SUBMIT_TIMEOUT_MS = 60 * 1000;

/** Never show partner brand names in customer-facing valuation errors. */
export function sanitizePublicValuationError(message) {
  let text = String(message || '').trim();
  if (!text) return 'Could not fetch live valuation. Please try again.';
  return text.replace(/\bcashify\b/gi, 'live market');
}

function valuationPost(path, payload) {
  return postWithDbRetry(() => api.post(path, {
    clientPlatform: 'Website',
    ...payload,
  }, { timeout: VALUATION_SUBMIT_TIMEOUT_MS }));
}
function isDbUnavailableError(err) {
  const status = err?.response?.status;
  const message = String(err?.response?.data?.message || err?.message || '');
  return status === 503 || /database temporarily unavailable/i.test(message);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollValuationStatus(getStatus, onTick, {
  intervalMs = 2500,
  maxAttempts = 480,
} = {}) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await getStatus();
      const data = response.data;
      onTick?.(data);
      if (data.done) {
        if (data.success && data.ourOffer != null) return data;
        throw new Error(sanitizePublicValuationError(data.error || data.note || 'Could not fetch live valuation. Please try again.'));
      }
    } catch (err) {
      if (isDbUnavailableError(err)) {
        await sleep(Math.min(1500 + attempt * 200, 8000));
        continue;
      }
      if (err?.response?.data?.message) {
        throw new Error(sanitizePublicValuationError(err.response.data.message));
      }
      throw err;
    }
    await sleep(intervalMs);
  }
  throw new Error('Valuation is taking longer than expected. Please keep this tab open or try again in a moment.');
}

export const valuationService = {
  submitLaptopQuote: (payload) => valuationPost('/valuation/laptop/quote', payload),
  getLaptopStatus: (recordId) => api.get(`/valuation/laptop/status/${recordId}`, { timeout: 30000 }),
  getAgentStatus: () => api.get('/valuation/laptop/agent-status'),

  submitMobileQuote: (payload) => valuationPost('/valuation/mobile/quote', payload),
  getMobileStatus: (recordId) => api.get(`/valuation/mobile/status/${recordId}`, { timeout: 30000 }),
  getMobileAgentStatus: () => api.get('/valuation/mobile/agent-status'),

  pollValuationStatus,
};

async function postWithDbRetry(requestFn, { maxDbRetries = 15 } = {}) {
  let dbRetries = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await requestFn();
    } catch (err) {
      if (isDbUnavailableError(err) && dbRetries < maxDbRetries) {
        dbRetries += 1;
        await sleep(1500 + dbRetries * 400);
        continue;
      }
      throw err;
    }
  }
}
