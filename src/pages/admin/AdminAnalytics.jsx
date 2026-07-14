import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  ClipboardList,
  Megaphone,
  UserMinus,
  ShoppingBag,
  IndianRupee,
  Settings,
  X,
  CalendarRange,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

function formatINR(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function toLocalISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { fromDate: toLocalISODate(from), toDate: toLocalISODate(to) };
}

function MetaSpendModal({ open, fromDate, toDate, initialAmount, onClose, onSaved }) {
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(initialAmount != null ? String(initialAmount) : '');
      setError('');
    }
  }, [open, initialAmount]);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (Number.isNaN(numeric) || numeric < 0) {
      setError('Enter a valid non-negative amount');
      return;
    }
    if (!fromDate || !toDate) {
      setError('Select a date range first');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await adminService.updateMetaSpend({ fromDate, toDate, amount: numeric });
      onSaved(numeric);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Meta spend');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Set Meta Ad Spend</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="admin-modal-body space-y-4">
            <p className="text-sm text-slate-500">
              Spend is saved for the selected range{' '}
              <span className="font-semibold text-slate-700">
                {fromDate || '—'} → {toDate || '—'}
              </span>
              . Cost per user and cost per order update from this amount.
            </p>
            <div className="admin-field">
              <label>Meta spend (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="admin-select w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                autoFocus
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save spend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const defaults = useMemo(() => defaultDateRange(), []);
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const res = await adminService.getAnalytics(params);
      setData(res.data);
    } catch {
      setError('Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    setFromDate(toLocalISODate(from));
    setToDate(toLocalISODate(to));
  };

  const cards = [
    {
      key: 'users',
      label: 'Users',
      value: data?.users ?? '—',
      icon: <Users size={20} className="text-blue-500" />,
      bg: 'rgba(59, 130, 246, 0.1)',
      accent: '#60a5fa',
      hint: 'New signups in range',
    },
    {
      key: 'orders',
      label: 'Orders',
      value: data?.orders ?? '—',
      icon: <ClipboardList size={20} className="text-emerald-500" />,
      bg: 'rgba(16, 185, 129, 0.1)',
      accent: '#34d399',
      hint: 'Orders placed in range',
    },
    {
      key: 'metaSpend',
      label: 'Meta Spend',
      value: formatINR(data?.metaSpend),
      icon: <Megaphone size={20} className="text-indigo-500" />,
      bg: 'rgba(99, 102, 241, 0.1)',
      accent: '#818cf8',
      hint: 'Ad spend for this range',
      settings: true,
    },
    {
      key: 'costPerUser',
      label: 'Cost / User',
      value: formatINR(data?.costPerUser),
      icon: <UserMinus size={20} className="text-amber-500" />,
      bg: 'rgba(245, 158, 11, 0.1)',
      accent: '#fbbf24',
      hint: 'Meta spend ÷ users',
    },
    {
      key: 'costPerOrder',
      label: 'Cost / Order',
      value: formatINR(data?.costPerOrder),
      icon: <ShoppingBag size={20} className="text-rose-500" />,
      bg: 'rgba(244, 63, 94, 0.1)',
      accent: '#fb7185',
      hint: 'Meta spend ÷ orders',
    },
    {
      key: 'revenue',
      label: 'Completed Revenue',
      value: formatINR(data?.revenue),
      icon: <IndianRupee size={20} className="text-teal-500" />,
      bg: 'rgba(20, 184, 166, 0.1)',
      accent: '#2dd4bf',
      hint: 'Completed orders in range',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CalendarRange size={18} className="text-blue-500" />
            Performance Analytics
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Track users, orders, and Meta acquisition cost for any date range.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="admin-btn admin-btn-ghost text-xs py-2 px-3" onClick={() => applyPreset(7)}>
            Last 7 days
          </button>
          <button type="button" className="admin-btn admin-btn-ghost text-xs py-2 px-3" onClick={() => applyPreset(30)}>
            Last 30 days
          </button>
          <input
            type="date"
            className="admin-select"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
            title="From date"
          />
          <input
            type="date"
            className="admin-select"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
            title="To date"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="admin-stat-card admin-skeleton h-[140px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.key}
              className="admin-stat-card relative"
              style={{ '--card-accent': card.accent }}
            >
              {card.settings && (
                <button
                  type="button"
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Set Meta spend"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings size={16} />
                </button>
              )}
              <div className="admin-stat-icon" style={{ backgroundColor: card.bg }}>
                {card.icon}
              </div>
              <div className="admin-stat-value">{card.value}</div>
              <div className="admin-stat-label">{card.label}</div>
              <p className="text-xs text-slate-400 mt-2">{card.hint}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && data && (
        <div className="admin-table-wrapper p-5">
          <h4 className="font-bold text-slate-800 mb-3">Range summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              Period:{' '}
              <span className="font-semibold text-slate-900">
                {fromDate || 'All time'} → {toDate || 'All time'}
              </span>
            </div>
            <div>
              Formula:{' '}
              <span className="font-semibold text-slate-900">
                Cost/User = Meta Spend ÷ Users · Cost/Order = Meta Spend ÷ Orders
              </span>
            </div>
            {data.metaSpend <= 0 && (
              <div className="md:col-span-2 text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                No Meta spend saved for this range yet. Click the settings icon on the Meta Spend card to add it.
              </div>
            )}
          </div>
        </div>
      )}

      <MetaSpendModal
        open={settingsOpen}
        fromDate={fromDate}
        toDate={toDate}
        initialAmount={data?.metaSpend ?? 0}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => fetchAnalytics()}
      />
    </div>
  );
}
