import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshCw,
  Play,
  Download,
  ChevronDown,
  ChevronRight,
  Database,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { formatCurrency } from '../../utils/formatCurrency';
import './admin.css';

const STATUS_STYLES = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  running: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Running' },
  completed: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  partial: { bg: '#E0E7FF', color: '#3730A3', label: 'Partial' },
  failed: { bg: '#FEE2E2', color: '#991B1B', label: 'Failed' },
  skipped: { bg: '#F1F5F9', color: '#475569', label: 'Skipped' },
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-800 uppercase tracking-wide ${status === 'running' ? 'pricing-agent-pulse' : ''}`}
      style={{ background: style.bg, color: style.color }}
    >
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current pricing-agent-dot" />
      )}
      {style.label}
    </span>
  );
}

function QuizChips({ summary = [] }) {
  if (!summary.length) return <span className="text-slate-400 text-xs">—</span>;
  const preview = summary.slice(0, 3);
  return (
    <div className="flex flex-wrap gap-1 max-w-[220px]">
      {preview.map((row, idx) => (
        <span
          key={`${row.question}-${idx}`}
          className="text-[10px] font-700 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
          title={`${row.question}: ${row.answer}`}
        >
          {row.question.replace(/ Issues?$/i, '')}: {String(row.answer).slice(0, 18)}
          {String(row.answer).length > 18 ? '…' : ''}
        </span>
      ))}
      {summary.length > 3 && (
        <span className="text-[10px] font-700 text-slate-400">+{summary.length - 3}</span>
      )}
    </div>
  );
}

export default function AdminPricingAgent() {
  const [stats, setStats] = useState({});
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState('');
  const [message, setMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef(null);

  const pages = Math.max(1, Math.ceil(total / 50));

  const progressPct = useMemo(() => {
    const done = (stats.completed || 0) + (stats.partial || 0) + (stats.skipped || 0);
    const all = stats.total || 0;
    if (!all) return 0;
    return Math.round((done / all) * 100);
  }, [stats]);

  const shouldPoll = (stats.pending || 0) + (stats.running || 0) > 0;

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, recordsRes] = await Promise.all([
        adminService.getPricingAgentStats(),
        adminService.getPricingAgentRecords({ page, limit: 50 }),
      ]);
      setStats(statsRes.data?.stats || {});
      setRecords(recordsRes.data?.records || []);
      setTotal(recordsRes.data?.total || 0);
    } catch (err) {
      if (!silent) setMessage(err.response?.data?.message || 'Failed to load pricing agent data.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!shouldPoll) return undefined;
    const timer = setInterval(() => loadData(true), 3000);
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
        `Enqueued ${data.pending ?? 0} pending · ${data.skipped ?? 0} skipped · ${data.alreadyCompleted ?? 0} already completed.`,
      );
      await loadData(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Run All failed.');
    } finally {
      setActionBusy('');
    }
  };

  const handleDownload = async (format) => {
    setDownloadOpen(false);
    setActionBusy(`dl-${format}`);
    try {
      const { data } = await adminService.downloadPricingAgent(format);
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
          <h2 className="text-xl font-900 text-slate-900 tracking-tight">Pricing Agent</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Batch Cashify pricing for captured mobile and laptop quizzes. Runs in the background on the server — close this tab anytime.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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

      {message && (
        <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm font-600 text-blue-800">
          {message}
        </div>
      )}

      <div className="admin-stat-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-800 text-slate-700">
            Progress · {progressPct}% complete
            {shouldPoll && (
              <span className="ml-2 text-blue-600 pricing-agent-pulse">Live updating…</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'running', 'completed', 'skipped', 'failed'].map((key) => (
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
          <h3>Quiz Records ({total})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th>Time</th>
                <th>Device</th>
                <th>Our Price</th>
                <th>Quiz</th>
                <th>Status</th>
                <th>Cashify</th>
                <th>Diff</th>
                <th style={{ width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {loading && !records.length ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-600">
                    Loading…
                  </td>
                </tr>
              ) : !records.length ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400 font-600">
                    No records yet. Complete a quiz or click Sync Quizzes.
                  </td>
                </tr>
              ) : (
                records.map((row, idx) => {
                  const sr = (page - 1) * 50 + idx + 1;
                  const expanded = expandedId === row.id;
                  const diff = row.difference;
                  const diffColor = diff == null ? 'text-slate-400' : diff >= 0 ? 'text-emerald-600' : 'text-red-600';
                  return (
                    <Fragment key={row.id}>
                      <tr className={row.agentStatus === 'running' ? 'pricing-agent-pulse' : ''}>
                        <td className="font-800 text-slate-400">{sr}</td>
                        <td className="text-xs text-slate-600 whitespace-nowrap">
                          {formatTime(row.capturedAt || row.createdAt)}
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
                        <td><QuizChips summary={row.quizSummary} /></td>
                        <td><StatusBadge status={row.agentStatus} /></td>
                        <td className="font-700 text-sm">
                          {row.cashifyPrice != null ? formatCurrency(row.cashifyPrice) : '—'}
                        </td>
                        <td className={`font-800 text-sm ${diffColor}`}>
                          {diff != null ? formatCurrency(diff) : '—'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-700"
                            onClick={() => setExpandedId(expanded ? null : row.id)}
                            aria-label="Expand quiz"
                          >
                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <td colSpan={9} className="bg-slate-50/80 !py-4">
                            <div className="grid md:grid-cols-2 gap-4 px-2">
                              <div>
                                <div className="text-[11px] font-800 uppercase tracking-wider text-slate-500 mb-2">
                                  Quiz Answers
                                </div>
                                {row.quizSummary?.length ? (
                                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    {row.quizSummary.map((q, qIdx) => (
                                      <div
                                        key={`${q.question}-${qIdx}`}
                                        className="flex justify-between gap-4 px-3 py-2 border-b border-slate-100 last:border-0"
                                      >
                                        <span className="text-[11px] font-700 text-slate-500 uppercase">
                                          {q.question}
                                        </span>
                                        <span className="text-sm font-600 text-slate-800 text-right">
                                          {q.answer}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400">No summary</span>
                                )}
                              </div>
                              <div className="text-xs text-slate-600 space-y-1">
                                <div><strong>Source:</strong> {row.sourceType} · {row.sourceId || '—'}</div>
                                <div><strong>Slug:</strong> <code className="text-[11px]">{row.slug}</code></div>
                                {row.cashifyProductUrl && (
                                  <div className="break-all">
                                    <strong>Cashify URL:</strong>{' '}
                                    <a href={row.cashifyProductUrl} target="_blank" rel="noreferrer" className="text-blue-600">
                                      {row.cashifyProductUrl}
                                    </a>
                                  </div>
                                )}
                                {row.note && <div><strong>Note:</strong> {row.note}</div>}
                                {row.error && <div className="text-red-600"><strong>Error:</strong> {row.error}</div>}
                                {row.durationMs > 0 && <div><strong>Duration:</strong> {(row.durationMs / 1000).toFixed(1)}s</div>}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
    </div>
  );
}
