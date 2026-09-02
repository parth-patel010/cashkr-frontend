import api from './api';

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
  maxDbRetries = 20,
} = {}) {
  let dbRetries = 0;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await getStatus();
      dbRetries = 0;
      const data = response.data;
      onTick?.(data);
      if (data.done) {
        if (data.success && data.ourOffer != null) return data;
        throw new Error(data.error || 'Could not fetch live valuation. Please try again.');
      }
    } catch (err) {
      if (isDbUnavailableError(err) && dbRetries < maxDbRetries) {
        dbRetries += 1;
        await sleep(1500 + dbRetries * 400);
        continue;
      }
      throw err;
    }
    await sleep(intervalMs);
  }
  throw new Error('Valuation is taking longer than expected. Please keep this tab open or try again in a moment.');
}

export const valuationService = {
  submitLaptopQuote: (payload) => postWithDbRetry(() => api.post('/valuation/laptop/quote', payload)),
  getLaptopStatus: (recordId) => api.get(`/valuation/laptop/status/${recordId}`),
  getAgentStatus: () => api.get('/valuation/laptop/agent-status'),

  submitMobileQuote: (payload) => postWithDbRetry(() => api.post('/valuation/mobile/quote', payload)),
  getMobileStatus: (recordId) => api.get(`/valuation/mobile/status/${recordId}`),
  getMobileAgentStatus: () => api.get('/valuation/mobile/agent-status'),

  pollValuationStatus,
};

async function postWithDbRetry(requestFn, { maxDbRetries = 8 } = {}) {
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
