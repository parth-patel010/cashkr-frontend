import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Search, Settings, Percent, Wallet } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { formatCurrency } from '../../utils/formatCurrency';
import './admin.css';

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
              <th>Base min (₹)</th>
              <th>Base max (₹)</th>
              <th>Commission %</th>
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
        Bracket is chosen by catalog base price. Commission ₹ = DeviceKart offer × %. Leave max empty for open-ended.
      </p>
    </div>
  );
}

function GlobalSettingsModal({ open, onClose, onSaved }) {
  const [brackets, setBrackets] = useState([emptyBracket()]);
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
        const { data } = await adminService.getVendorCommissionSettings();
        if (cancelled) return;
        setBrackets(data.defaultBrackets?.length ? data.defaultBrackets : [emptyBracket()]);
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
      await adminService.saveVendorCommissionSettings({ defaultBrackets: brackets });
      setMessage('Saved.');
      onSaved?.();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Global vendor commission</h3>
          <button type="button" className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-body space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <BracketEditor title="Default brackets" rows={brackets} onChange={setBrackets} />
          )}
          {message && <p className="text-sm font-600 text-blue-800">{message}</p>}
        </div>
        <div className="admin-modal-footer flex justify-end gap-2">
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>Close</button>
          <button type="button" className="admin-btn admin-btn-primary" disabled={loading || saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorDetailModal({ vendorId, onClose, onSaved }) {
  const [detail, setDetail] = useState(null);
  const [brackets, setBrackets] = useState([emptyBracket()]);
  const [useDefault, setUseDefault] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!vendorId) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await adminService.getVendorCommissionDetail(vendorId);
        if (cancelled) return;
        setDetail(data);
        const hasOverride = Boolean(data.vendor?.hasOverride);
        setUseDefault(!hasOverride);
        setBrackets(
          hasOverride && data.vendor.commissionBrackets?.length
            ? data.vendor.commissionBrackets
            : (data.defaultBrackets?.length ? data.defaultBrackets : [emptyBracket()]),
        );
      } catch (err) {
        if (!cancelled) setMessage(err.response?.data?.message || 'Failed to load vendor.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [vendorId]);

  if (!vendorId) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await adminService.updateVendorCommissionBrackets(vendorId, useDefault
        ? { useDefault: true }
        : { commissionBrackets: brackets });
      setMessage('Saved.');
      onSaved?.();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const v = detail?.vendor;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 840 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3>{v?.name || 'Vendor commission'}</h3>
            <p className="text-xs text-slate-500 mt-1">{v?.phone} · {v?.city || '—'}</p>
          </div>
          <button type="button" className="admin-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="admin-modal-body space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] font-700 text-slate-500 uppercase">Wallet</div>
                  <div className="text-lg font-900">{formatCurrency(v?.walletBalance || 0)}</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] font-700 text-slate-500 uppercase">Avg commission %</div>
                  <div className="text-lg font-900">{v?.averageCommissionPercent ?? 0}%</div>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] font-700 text-slate-500 uppercase">Override</div>
                  <div className="text-lg font-900">{v?.hasOverride ? 'Yes' : 'Global'}</div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-700 text-slate-700">
                <input
                  type="checkbox"
                  checked={useDefault}
                  onChange={(e) => setUseDefault(e.target.checked)}
                />
                Use global default brackets
              </label>

              {!useDefault && (
                <BracketEditor title="Vendor override brackets" rows={brackets} onChange={setBrackets} />
              )}

              {Array.isArray(detail?.ledger) && detail.ledger.length > 0 && (
                <div>
                  <h4 className="text-sm font-800 text-slate-800 mb-2">Recent ledger</h4>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-56 overflow-y-auto">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>When</th>
                          <th>Title</th>
                          <th>Amount</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.ledger.slice(0, 20).map((row) => (
                          <tr key={row._id}>
                            <td className="text-xs whitespace-nowrap">
                              {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                            </td>
                            <td className="text-sm">{row.title}</td>
                            <td className="font-700">{formatCurrency(row.amount || 0)}</td>
                            <td className="text-xs capitalize">{row.accountType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
          {message && <p className="text-sm font-600 text-blue-800">{message}</p>}
        </div>
        <div className="admin-modal-footer flex justify-between gap-2">
          <Link to={`/admin/vendors/${vendorId}`} className="admin-btn admin-btn-ghost text-sm">
            Open vendor profile
          </Link>
          <div className="flex gap-2">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>Close</button>
            <button type="button" className="admin-btn admin-btn-primary" disabled={loading || saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVendorCommission() {
  const [vendors, setVendors] = useState([]);
  const [defaultBrackets, setDefaultBrackets] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('highest');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminService.listVendorCommissions({
        search: search || undefined,
        sort,
      });
      setVendors(data.vendors || []);
      setDefaultBrackets(data.defaultBrackets || []);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load vendor commissions.');
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-900 text-slate-900 flex items-center gap-2">
            <Percent size={22} /> Vendor Commission
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Wallet ₹ deducted on accept = % of DeviceKart offer by catalog base-price brackets.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setSettingsOpen(true)}>
          <Settings size={16} /> Global defaults
        </button>
      </div>

      <div className="admin-stat-card p-4 flex flex-wrap items-center gap-3">
        <Wallet size={18} className="text-slate-500" />
        <span className="text-sm font-700 text-slate-700">
          Global brackets: {defaultBrackets.length || 0} band(s)
        </span>
        <span className="text-xs text-slate-500">
          {defaultBrackets.map((b) => `${b.min}–${b.max ?? '∞'}: ${b.percent}%`).join(' · ') || 'Not configured'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="admin-input pl-9"
            placeholder="Search vendor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="highest">Highest commission %</option>
          <option value="lowest">Lowest commission %</option>
          <option value="wallet">Highest wallet</option>
        </select>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm font-600 text-blue-800">
          {message}
        </div>
      )}

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>Vendors ({vendors.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Wallet</th>
                <th>Avg %</th>
                <th>Source</th>
                <th>Effective bands</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-600">Loading…</td>
                </tr>
              ) : !vendors.length ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400 font-600">No vendors found</td>
                </tr>
              ) : (
                vendors.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-slate-50/80"
                    onClick={() => setSelectedId(row.id)}
                  >
                    <td>
                      <div className="font-700 text-slate-800">{row.name}</div>
                      <div className="text-[11px] text-slate-500">{row.phone} · {row.city || '—'}</div>
                    </td>
                    <td className="font-800">{formatCurrency(row.walletBalance || 0)}</td>
                    <td className="font-900 text-emerald-700">{row.averageCommissionPercent}%</td>
                    <td>
                      <span className={`text-[11px] font-800 uppercase px-2 py-1 rounded-full ${row.hasOverride ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'}`}>
                        {row.hasOverride ? 'Override' : 'Global'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 max-w-[280px]">
                      {(row.effectiveBrackets || [])
                        .map((b) => `${b.min}–${b.max ?? '∞'}: ${b.percent}%`)
                        .join(' · ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <GlobalSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={load}
      />
      {selectedId && (
        <VendorDetailModal
          vendorId={selectedId}
          onClose={() => setSelectedId(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
