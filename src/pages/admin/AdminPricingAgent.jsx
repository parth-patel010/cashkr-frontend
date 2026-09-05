import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshCw,
  Play,
  Download,
  ChevronDown,
  Database,
  X,
  Settings,
  Plus,
  Trash2,
  CalendarRange,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { formatCurrency } from '../../utils/formatCurrency';
import './admin.css';

function normalizeStatus(status) {
  return status === 'skipped' ? 'overridden' : status;
}

function cashifyValuationHeadline(record) {
  if (record.cashifyPrice != null) return formatCurrency(record.cashifyPrice);
  const status = normalizeStatus(record.displayStatus || record.agentStatus);
  if (status === 'running') return 'Running…';
  if (status === 'pending') return 'Queued…';
  if (status === 'failed') return 'Failed — not completed';
  if (status === 'partial') return 'Partial — see note';
  return 'Not run yet';
}

const STATUS_STYLES = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  running: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Running' },
  completed: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  partial: { bg: '#E0E7FF', color: '#3730A3', label: 'Partial' },
  failed: { bg: '#FEE2E2', color: '#991B1B', label: 'Failed' },
  overridden: { bg: '#FEF9C3', color: '#854D0E', label: 'Overridden' },
  skipped: { bg: '#FEF9C3', color: '#854D0E', label: 'Overridden' },
};

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const style = STATUS_STYLES[normalized] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-800 uppercase tracking-wide ${normalized === 'running' ? 'pricing-agent-pulse' : ''}`}
      style={{ background: style.bg, color: style.color }}
    >
      {normalized === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current pricing-agent-dot" />
      )}
      {style.label}
    </span>
  );
}

function recordActivityTime(row) {
  const stamps = [row?.updatedAt, row?.runAt, row?.completedAt, row?.capturedAt, row?.createdAt]
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter((n) => Number.isFinite(n));
  if (!stamps.length) return null;
  return new Date(Math.max(...stamps));
}

function recordHasQuiz(row) {
  return Array.isArray(row?.quizSummary)
    && row.quizSummary.some((r) => r && String(r.question || '').trim() && String(r.answer ?? '').trim() !== '');
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

function emptyBracket() {
  return { min: 0, max: '', percent: 0 };
}

function BracketEditor({ title, rows, onChange }) {
  const updateRow = (idx, key, value) => {
    const next = rows.map((row, i) => (i === idx ? { ...row, [key]: value } : row));
    onChange(next);
  };
  const addRow = () => onChange([...rows, emptyBracket()]);
  const removeRow = (idx) => onChange(rows.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-800 text-slate-800">{title}</h4>
        <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={addRow}>
          <Plus size={14} /> Add bracket
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="admin-table">
          <thead>
            <tr>
              <th>DeviceKart base min (₹)</th>
              <th>DeviceKart base max (₹)</th>
              <th>Increment %</th>
              <th style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={`${title}-${idx}`}>
                <td>
                  <input
                    type="number"
                    className="admin-input"
                    value={row.min ?? 0}
                    onChange={(e) => updateRow(idx, 'min', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="admin-input"
                    placeholder="∞"
                    value={row.max ?? ''}
                    onChange={(e) => updateRow(idx, 'max', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="admin-input"
                    value={row.percent ?? 0}
                    onChange={(e) => updateRow(idx, 'percent', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="p-2 text-slate-400 hover:text-red-500"
                    onClick={() => removeRow(idx)}
                    disabled={rows.length <= 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500 font-600">
        Bracket is chosen by catalog base price. Leave max empty for open-ended. Offer = Cashify × (1 + %).
      </p>
    </div>
  );
}

function PricingSettingsModal({ open, onClose }) {
  const [mobileBrackets, setMobileBrackets] = useState([emptyBracket()]);
  const [laptopBrackets, setLaptopBrackets] = useState([emptyBracket()]);
  const [fallbackFixedInr, setFallbackFixedInr] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMessage('');
      try {
        const { data } = await adminService.getPricingAgentSettings();
        if (cancelled) return;
        setMobileBrackets(data.mobileBrackets?.length ? data.mobileBrackets : [emptyBracket()]);
        setLaptopBrackets(data.laptopBrackets?.length ? data.laptopBrackets : [emptyBracket()]);
        setFallbackFixedInr(data.fallbackFixedInr ?? 1000);
      } catch (err) {
        if (!cancelled) setMessage(err.response?.data?.message || 'Failed to load settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await adminService.savePricingAgentSettings({
        mobileBrackets,
        laptopBrackets,
        fallbackFixedInr: Number(fallbackFixedInr) || 0,
      });
      setMessage('Saved. New valuations will use these brackets.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 820 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3>Pricing brackets</h3>
            <p className="text-xs text-slate-500 mt-1">
              Set % increment by DeviceKart catalog base price; applied to the Cashify quote.
            </p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="admin-modal-body space-y-6">
          {loading ? (
            <p className="text-sm text-slate-500 font-600">Loading…</p>
          ) : (
            <>
              <BracketEditor title="Phone (Mobile)" rows={mobileBrackets} onChange={setMobileBrackets} />
              <BracketEditor title="Laptop" rows={laptopBrackets} onChange={setLaptopBrackets} />
              <label className="block space-y-1.5">
                <span className="text-xs font-800 uppercase tracking-wide text-slate-500">
                  Fallback fixed ₹ (if no bracket matches)
                </span>
                <input
                  type="number"
                  className="admin-input max-w-[200px]"
                  value={fallbackFixedInr}
                  onChange={(e) => setFallbackFixedInr(e.target.value)}
                />
              </label>
            </>
          )}
          {message && (
            <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-sm font-600 text-blue-800">
              {message}
            </div>
          )}
        </div>
        <div className="admin-modal-footer flex justify-end gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={loading || saving}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save brackets'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ComparisonModal({ record, onClose, onRun, runBusy = false }) {
  if (!record) return null;
  const diff = record.difference;
  const diffColor = diff == null ? 'text-slate-400' : diff >= 0 ? 'text-emerald-600' : 'text-red-600';
  const isOverridden = normalizeStatus(record.agentStatus) === 'overridden';
  const status = normalizeStatus(record.displayStatus || record.agentStatus);
  const canRun = status !== 'overridden';

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 920 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3>{record.brand} {record.modelName}</h3>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {record.category}{record.storage ? ` · ${record.storage}` : ''}
              {' · '}
              {record.clientPlatform === 'App' ? 'App' : 'Website'}
            </p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="admin-modal-body">
          {isOverridden && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm font-600 text-amber-900">
              Quiz overridden — this exact quiz always returns the locked override price below.
              {record.overridePrice != null && (
                <span className="block mt-1 font-800 text-base">
                  Override price: {formatCurrency(record.overridePrice)}
                </span>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-100 bg-amber-100/50">
                <div className="text-[11px] font-800 uppercase tracking-wider text-amber-900">DeviceKart Quiz</div>
                <div className="text-lg font-900 text-slate-900 mt-1">
                  {record.internalPrice != null ? formatCurrency(record.internalPrice) : '—'}
                </div>
              </div>
              <div className="divide-y divide-amber-50 bg-white/80">
                {record.quizSummary?.length ? record.quizSummary.map((row, idx) => (
                  <div key={`${row.question}-${idx}`} className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="text-[11px] font-700 text-slate-500 uppercase tracking-wide shrink-0">
                      {row.question}
                    </span>
                    <span className="text-sm font-600 text-slate-800 text-right">{row.answer}</span>
                  </div>
                )) : (
                  <div className="px-4 py-6 text-sm text-slate-400 text-center">No quiz data</div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-blue-100 bg-blue-100/50">
                <div className="text-[11px] font-800 uppercase tracking-wider text-blue-900">Cashify Valuation</div>
                <div className="text-lg font-900 text-slate-900 mt-1">
                  {cashifyValuationHeadline(record)}
                </div>
              </div>
              <div className="divide-y divide-blue-50 bg-white/80">
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-[11px] font-700 text-slate-500 uppercase">Agent Status</span>
                  <StatusBadge status={normalizeStatus(record.displayStatus || record.agentStatus)} />
                </div>
                {isOverridden && (
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="text-[11px] font-700 text-slate-500 uppercase">Override Price</span>
                    <span className="text-sm font-800 text-amber-800">
                      {record.overridePrice != null ? formatCurrency(record.overridePrice) : '—'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-[11px] font-700 text-slate-500 uppercase">Our Offer (bracket %)</span>
                  <span className="text-sm font-700 text-slate-800">
                    {record.ourOffer != null ? formatCurrency(record.ourOffer) : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-[11px] font-700 text-slate-500 uppercase">Difference</span>
                  <span className={`text-sm font-800 ${diffColor}`}>
                    {diff != null ? formatCurrency(diff) : '—'}
                  </span>
                </div>
                {record.cashifyProductUrl && (
                  <div className="px-4 py-2.5">
                    <div className="text-[11px] font-700 text-slate-500 uppercase mb-1">Cashify URL</div>
                    <a
                      href={record.cashifyProductUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 break-all hover:underline"
                    >
                      {record.cashifyProductUrl}
                    </a>
                  </div>
                )}
                {normalizeStatus(record.displayStatus || record.agentStatus) === 'running' && (
                  <div className="px-4 py-2.5 text-sm text-blue-700 bg-blue-50/80">
                    Agent is working on this valuation. Refresh in a few seconds, or use <strong>Run all pending</strong> if it stays stuck.
                  </div>
                )}
                {record.note && normalizeStatus(record.displayStatus || record.agentStatus) !== 'running' && (
                  <div className="px-4 py-2.5 text-sm text-slate-600">
                    <span className="text-[11px] font-700 text-slate-500 uppercase block mb-1">Note</span>
                    {record.note}
                  </div>
                )}
                {record.error && (
                  <div className="px-4 py-2.5 text-sm text-red-600">
                    <span className="text-[11px] font-700 uppercase block mb-1">Error</span>
                    {record.error}
                  </div>
                )}
                {record.durationMs > 0 && (
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="text-[11px] font-700 text-slate-500 uppercase">Run Duration</span>
                    <span className="text-sm font-600 text-slate-800">{(record.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="admin-modal-footer flex justify-end gap-2">
          {canRun && onRun && (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              disabled={runBusy}
              onClick={() => onRun(record)}
            >
              <Play size={14} />
              {runBusy ? 'Queuing…' : status === 'running' ? 'Re-queue valuation' : 'Run valuation'}
            </button>
          )}
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function QuizSummaryList({ summary = [], compact = false }) {
  if (!summary.length) return <span className="text-slate-400 text-xs">—</span>;
  return (
    <div className={`space-y-1 ${compact ? 'max-w-[280px]' : ''}`}>
      {summary.map((row, idx) => (
        <div key={`${row.question}-${idx}`} className="flex justify-between gap-2 text-[11px] leading-snug">
          <span className="font-700 text-slate-500 shrink-0">{row.question}</span>
          <span className="font-600 text-slate-800 text-right">{row.answer}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminPricingAgent() {
  const defaults = useMemo(() => defaultDateRange(), []);
  const [fromDate, setFromDate] = useState(defaults.fromDate);
  const [toDate, setToDate] = useState(defaults.toDate);
  const [clientPlatform, setClientPlatform] = useState('');
  const [stats, setStats] = useState({});
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState('');
  const [message, setMessage] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const downloadRef = useRef(null);

  const pages = Math.max(1, Math.ceil(total / 50));

  const progressPct = useMemo(() => {
    const done = (stats.completed || 0) + (stats.partial || 0) + (stats.overridden || 0);
    const all = stats.total || 0;
    if (!all) return 0;
    return Math.round((done / all) * 100);
  }, [stats]);

  const shouldPoll = (stats.pending || 0) + (stats.running || 0) > 0;

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const dateParams = {};
      if (fromDate) dateParams.fromDate = fromDate;
      if (toDate) dateParams.toDate = toDate;
      if (clientPlatform) dateParams.clientPlatform = clientPlatform;
      const [statsRes, recordsRes] = await Promise.all([
        adminService.getPricingAgentStats(dateParams),
        adminService.getPricingAgentRecords({ page, limit: 50, ...dateParams }),
      ]);
      setStats(statsRes.data?.stats || {});
      const rows = recordsRes.data?.records || [];
      setRecords(rows);
      setTotal(recordsRes.data?.total || rows.length);
    } catch (err) {
      if (!silent) setMessage(err.response?.data?.message || 'Failed to load pricing agent data.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, fromDate, toDate, clientPlatform]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!shouldPoll) return undefined;
    const timer = setInterval(() => loadData(true), 8000);
    return () => clearInterval(timer);
  }, [shouldPoll, loadData]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (downloadRef.current && !downloadRef.current.contains(e.target)) {
        setDownloadOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleSync = async () => {
    setActionBusy('sync');
    setMessage('');
    try {
      const { data } = await adminService.syncPricingAgent();
      setMessage(`Synced ${data.imported ?? 0} quiz record(s) from users and orders.`);
      await loadData(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Sync failed.');
    } finally {
      setActionBusy('');
    }
  };

  const handleRunAll = async () => {
    setActionBusy('run');
    setMessage('');
    try {
      const { data } = await adminService.runAllPricingAgent();
      setMessage(
        `Enqueued ${data.pending ?? 0} pending · ${data.overridden ?? data.skipped ?? 0} overridden · ${data.alreadyCompleted ?? 0} already completed.`,
      );
      await loadData(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Run All failed.');
    } finally {
      setActionBusy('');
    }
  };

  const handleRunOne = async (row, event) => {
    event?.stopPropagation?.();
    if (!row?.id) return;
    const status = normalizeStatus(row.displayStatus || row.agentStatus);
    if (status === 'overridden') return;

    setActionBusy(`run-${row.id}`);
    setMessage('');
    try {
      const { data } = await adminService.runOnePricingAgent(row.id);
      if (data.status === 'overridden') {
        setMessage(data.message || 'Quiz locked to existing override price.');
      } else {
        setMessage(
          data.queuePosition > 1
            ? `Queued (position ${data.queuePosition}) — ${row.brand} ${row.modelName}`
            : `Running soon — ${row.brand} ${row.modelName}`,
        );
      }
      await loadData(true);
      if (selectedRecord?.id === row.id) {
        const dateParams = {};
        if (fromDate) dateParams.fromDate = fromDate;
        if (toDate) dateParams.toDate = toDate;
        if (clientPlatform) dateParams.clientPlatform = clientPlatform;
        const { data: list } = await adminService.getPricingAgentRecords({ page, limit: 50, ...dateParams });
        const updated = (list?.records || []).find((r) => r.id === row.id);
        if (updated) setSelectedRecord(updated);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Run failed.');
    } finally {
      setActionBusy('');
    }
  };

  const canRunRow = (row) => normalizeStatus(row.displayStatus || row.agentStatus) !== 'overridden';

  const handleDownload = async (format) => {
    setDownloadOpen(false);
    setActionBusy(`dl-${format}`);
    try {
      const dateParams = {};
      if (fromDate) dateParams.fromDate = fromDate;
      if (toDate) dateParams.toDate = toDate;
      if (clientPlatform) dateParams.clientPlatform = clientPlatform;
      const { data } = await adminService.downloadPricingAgent(format, dateParams);
      const blob = new Blob([data], {
        type: format === 'csv'
          ? 'text/csv'
          : format === 'jsonl'
            ? 'application/x-ndjson'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.href = url;
      a.download = `pricing-agent-${stamp}.${format === 'xlsx' ? 'xlsx' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Download failed.');
    } finally {
      setActionBusy('');
    }
  };

  const formatTime = (d) => (d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }) : '—');

  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    setPage(1);
    setFromDate(toLocalISODate(from));
    setToDate(toLocalISODate(to));
  };

  const applyToday = () => {
    const today = toLocalISODate(new Date());
    setPage(1);
    setFromDate(today);
    setToDate(today);
  };

  const dateRangeLabel = fromDate && toDate
    ? (fromDate === toDate ? fromDate : `${fromDate} → ${toDate}`)
    : (!fromDate && !toDate ? 'All time' : 'All dates');

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes pricing-agent-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
        .pricing-agent-pulse { animation: pricing-agent-pulse 1.4s ease-in-out infinite; }
        @keyframes pricing-agent-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }
        .pricing-agent-dot { animation: pricing-agent-dot 1s ease-in-out infinite; }
        .pricing-agent-progress {
          height: 8px;
          border-radius: 999px;
          background: #E2E8F0;
          overflow: hidden;
        }
        .pricing-agent-progress-bar {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #2563EB, #7C3AED);
          transition: width 0.6s ease;
        }
        .pricing-agent-stat-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: #fff;
          border: 1px solid #E2E8F0;
        }
      `}</style>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-900 text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarRange size={18} className="text-blue-500" />
            Pricing Agent
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Batch Cashify pricing for captured quizzes. Filter by date to review daily quiz collection — stats and records use quiz capture time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            disabled={!!actionBusy}
            onClick={() => loadData()}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            disabled={actionBusy === 'sync'}
            onClick={handleSync}
          >
            <Database size={16} />
            {actionBusy === 'sync' ? 'Syncing…' : 'Sync Quizzes'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={actionBusy === 'run'}
            onClick={handleRunAll}
          >
            <Play size={16} />
            {actionBusy === 'run' ? 'Starting…' : 'Run All'}
          </button>
          <div className="relative" ref={downloadRef}>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={() => setDownloadOpen((v) => !v)}
            >
              <Download size={16} />
              Download
              <ChevronDown size={14} />
            </button>
            {downloadOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[140px] bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                {['xlsx', 'csv', 'jsonl'].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    className="block w-full text-left px-4 py-2 text-sm font-600 text-slate-700 hover:bg-slate-50"
                    disabled={actionBusy === `dl-${fmt}`}
                    onClick={() => handleDownload(fmt)}
                  >
                    {fmt === 'xlsx' ? 'Excel (.xlsx)' : fmt === 'csv' ? 'CSV' : 'JSONL (training)'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="admin-btn admin-btn-ghost text-xs py-2 px-3" onClick={() => { setPage(1); setFromDate(''); setToDate(''); setClientPlatform(''); }}>
          All time
        </button>
        <button type="button" className="admin-btn admin-btn-ghost text-xs py-2 px-3" onClick={applyToday}>
          Today
        </button>
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
          onChange={(e) => { setPage(1); setFromDate(e.target.value); }}
          title="From date"
        />
        <input
          type="date"
          className="admin-select"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => { setPage(1); setToDate(e.target.value); }}
          title="To date"
        />
        <span className="text-xs font-700 text-slate-500">
          Showing: {dateRangeLabel}
        </span>
        <select
          className="admin-select"
          value={clientPlatform}
          onChange={(e) => { setPage(1); setClientPlatform(e.target.value); }}
          title="Source platform"
        >
          <option value="">All sources</option>
          <option value="App">App</option>
          <option value="Website">Website</option>
        </select>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm font-600 text-blue-800">
          {message}
        </div>
      )}

      <div className="admin-stat-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-800 text-slate-700">
            Progress · {progressPct}% complete
            <span className="ml-2 text-xs font-600 text-slate-500">({dateRangeLabel})</span>
            {shouldPoll && (
              <span className="ml-2 text-blue-600 pricing-agent-pulse">Live updating…</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'running', 'completed', 'overridden', 'failed'].map((key) => (
              <span key={key} className="pricing-agent-stat-chip">
                <span className="capitalize text-slate-500">{key}</span>
                <span className="text-slate-900">{stats[key] ?? 0}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="pricing-agent-progress">
          <div className="pricing-agent-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>Quiz Records ({total}) · {dateRangeLabel}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Time</th>
                <th>Source</th>
                <th>Device</th>
                <th>Our Price</th>
                <th>Quiz</th>
                <th>Status</th>
                <th>Override Price</th>
                <th>Cashify</th>
                <th>Diff</th>
                <th style={{ width: 100 }}>Run</th>
              </tr>
            </thead>
            <tbody>
              {loading && !records.length ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400 font-600">
                    Loading…
                  </td>
                </tr>
              ) : !records.length ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400 font-600">
                    No quiz records for {dateRangeLabel}. Try another date or click Sync Quizzes.
                  </td>
                </tr>
              ) : (
                records.map((row, idx) => {
                  const sr = (page - 1) * 50 + idx + 1;
                  const diff = row.difference;
                  const diffColor = diff == null ? 'text-slate-400' : diff >= 0 ? 'text-emerald-600' : 'text-red-600';
                  const isOverridden = normalizeStatus(row.displayStatus || row.agentStatus) === 'overridden';
                  return (
                    <tr
                      key={row.id}
                      className={`cursor-pointer hover:bg-slate-50/80 ${row.agentStatus === 'running' ? 'pricing-agent-pulse' : ''} ${isOverridden ? 'bg-amber-50/30' : ''}`}
                      onClick={() => setSelectedRecord(row)}
                    >
                      <td className="font-800 text-slate-400">{sr}</td>
                      <td className="text-xs text-slate-600 whitespace-nowrap">
                        {formatTime(recordActivityTime(row))}
                      </td>
                      <td>
                        <span className={`text-[11px] font-800 uppercase px-2 py-1 rounded-full ${row.clientPlatform === 'App' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'}`}>
                          {row.clientPlatform === 'App' ? 'App' : 'Website'}
                        </span>
                      </td>
                      <td>
                        <div className="font-700 text-slate-800 text-sm">
                          {row.brand} {row.modelName}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize">
                          {row.category}
                          {row.storage ? ` · ${row.storage}` : ''}
                        </div>
                      </td>
                      <td className="font-700 text-sm">
                        {row.internalPrice != null ? formatCurrency(row.internalPrice) : '—'}
                      </td>
                      <td><QuizSummaryList summary={row.quizSummary} compact /></td>
                      <td><StatusBadge status={row.displayStatus || row.agentStatus} /></td>
                      <td className="font-800 text-sm text-amber-800">
                        {isOverridden && row.overridePrice != null
                          ? formatCurrency(row.overridePrice)
                          : isOverridden && row.ourOffer != null
                            ? formatCurrency(row.ourOffer)
                            : '—'}
                      </td>
                      <td className="font-700 text-sm">
                        {row.cashifyPrice != null ? formatCurrency(row.cashifyPrice) : '—'}
                      </td>
                      <td className={`font-800 text-sm ${diffColor}`}>
                        {diff != null ? formatCurrency(diff) : '—'}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {canRunRow(row) ? (
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost text-xs py-1.5 px-2.5"
                            disabled={actionBusy === `run-${row.id}`}
                            onClick={(e) => handleRunOne(row, e)}
                            title={
                              normalizeStatus(row.displayStatus || row.agentStatus) === 'running'
                                ? 'Re-queue if stuck'
                                : 'Queue Cashify valuation for this quiz'
                            }
                          >
                            <Play size={14} />
                            {actionBusy === `run-${row.id}`
                              ? '…'
                              : normalizeStatus(row.displayStatus || row.agentStatus) === 'running'
                                ? 'Re-run'
                                : 'Run'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-600 text-slate-400" title="Locked override">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button
              type="button"
              className="admin-btn admin-btn-ghost text-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="text-sm font-600 text-slate-500">
              Page {page} of {pages}
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-ghost text-sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ComparisonModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onRun={(row) => handleRunOne(row)}
        runBusy={selectedRecord ? actionBusy === `run-${selectedRecord.id}` : false}
      />
      <PricingSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
