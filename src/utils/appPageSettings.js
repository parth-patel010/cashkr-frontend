import api from '../services/api';

const DEFAULT_PAGES = [
  { key: 'sell', label: 'Sell', enabled: true },
  { key: 'buy', label: 'Buy', enabled: true },
  { key: 'repair', label: 'Repair', enabled: true },
];

let inflight = null;

/** Load app page flags (buy/repair coming soon) from public settings API. */
export async function fetchAppPageSettings({ force = false } = {}) {
  if (!force && inflight) return inflight;

  inflight = api
    .get('/app-settings')
    .then(({ data }) => {
      const pages = Array.isArray(data.pages) && data.pages.length ? data.pages : DEFAULT_PAGES;
      return pages;
    })
    .catch(() => DEFAULT_PAGES)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function isPageEnabled(pages, key) {
  const page = (pages || []).find((p) => p.key === key);
  return page ? page.enabled !== false : true;
}

export function pageLabel(pages, key, fallback = '') {
  const page = (pages || []).find((p) => p.key === key);
  return page?.label || fallback;
}
