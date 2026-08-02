import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, X, Inbox } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

const TYPE_LABELS = {
  sell_tv: 'Sell TV',
  sell_refrigerator: 'Sell Fridge',
  repair: 'Repair',
};

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

function photoEntries(photos = {}) {
  return ['front', 'left', 'right', 'back']
    .map((k) => ({ key: k, url: photos[k] }))
    .filter((p) => p.url);
}

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchLeads = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (type) params.type = type;
    if (status) params.status = status;
    adminService
      .getLeads(params)
      .then((res) => {
        setLeads(res.data.leads || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [debouncedSearch, type, status, page]);

  const handleStatus = async (id, nextStatus) => {
    setUpdatingId(id);
    try {
      const { data } = await adminService.updateLeadStatus(id, nextStatus);
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status: data.status } : l)));
      if (selected?._id === id) setSelected((s) => ({ ...s, status: data.status }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            className="admin-search pl-10"
            placeholder="Search name, phone, lead id…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="admin-select"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All types</option>
            <option value="sell_tv">Sell TV</option>
            <option value="sell_refrigerator">Sell Fridge</option>
            <option value="repair">Repair</option>
          </select>
          <select
            className="admin-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="text-sm font-semibold text-slate-500">
            Total: <span className="text-slate-900 font-bold">{total}</span>
          </span>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-12 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 admin-skeleton w-full" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Inbox size={28} />
            No leads found.
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Summary</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div className="font-bold text-slate-800">{lead.leadId}</div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-blue">
                        {TYPE_LABELS[lead.type] || lead.type}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.phone}</div>
                    </td>
                    <td className="text-sm text-slate-600 max-w-[220px]">
                      {[lead.brand, lead.modelName || lead.deviceCategory, lead.condition]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                      {Array.isArray(lead.issues) && lead.issues.length > 0 ? (
                        <div className="text-xs text-slate-400 mt-0.5 truncate">
                          {lead.issues.join(', ')}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <select
                        className="admin-select text-xs"
                        value={lead.status}
                        disabled={updatingId === lead._id}
                        onChange={(e) => handleStatus(lead._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleString('en-IN')
                        : '—'}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                        onClick={() => setSelected(lead)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-xs font-semibold text-slate-500">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 disabled:opacity-40"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto p-6">
            <button
              type="button"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
              onClick={() => setSelected(null)}
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">{selected.leadId}</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
              {TYPE_LABELS[selected.type] || selected.type}
            </p>

            <div className="space-y-2 text-sm">
              <Row label="Name" value={selected.name} />
              <Row label="Phone" value={selected.phone} />
              <Row label="City" value={selected.city} />
              <Row label="Pincode" value={selected.pincode} />
              <Row label="Address" value={selected.address} />
              <Row label="Brand" value={selected.brand} />
              <Row label="Model" value={selected.modelName} />
              <Row label="Device" value={selected.deviceCategory} />
              <Row label="Size" value={selected.screenSize} />
              <Row label="Type" value={selected.applianceType} />
              <Row label="Age" value={selected.ageBand} />
              <Row label="Condition" value={selected.condition} />
              <Row
                label="Issues"
                value={Array.isArray(selected.issues) ? selected.issues.join(', ') : ''}
              />
              <Row label="Slot" value={selected.preferredSlot} />
              <Row label="Date" value={selected.preferredDate} />
              <Row label="Note" value={selected.note} />
            </div>

            {photoEntries(selected.photos).length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                  Photos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {photoEntries(selected.photos).map((p) => (
                    <a
                      key={p.key}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl overflow-hidden border border-slate-100"
                    >
                      <img src={p.url} alt={p.key} className="w-full aspect-[4/3] object-cover" />
                      <span className="block text-center text-[10px] font-bold uppercase text-slate-500 py-1">
                        {p.key}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={updatingId === selected._id}
                  onClick={() => handleStatus(selected._id, s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${
                    selected.status === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-50">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 shrink-0">
        {label}
      </span>
      <span className="text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}
