import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const PAGE_SIZE = 50;

export default function AdminPincodes() {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', city: '', state: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchPincodes();
  }, [debouncedSearch, page]);

  const fetchPincodes = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getPincodes({
        search: debouncedSearch || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setPincodes(data.pincodes || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch pincodes:', error);
      alert(error.response?.data?.message || 'Failed to load pincodes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pincode = null) => {
    if (pincode) {
      setEditingId(pincode._id);
      setForm({
        code: pincode.code,
        city: pincode.city || '',
        state: pincode.state || '',
        isActive: pincode.isActive !== false,
      });
    } else {
      setEditingId(null);
      setForm({ code: '', city: '', state: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = String(form.code || '').replace(/\D/g, '').slice(0, 6);
    if (code.length !== 6) {
      alert('Pincode must be a 6-digit number');
      return;
    }
    if (!form.city?.trim() || !form.state?.trim()) {
      alert('City and state are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code,
        city: form.city.trim(),
        state: form.state.trim(),
        isActive: Boolean(form.isActive),
      };
      if (editingId) {
        await adminService.updatePincode(editingId, payload);
      } else {
        await adminService.createPincode(payload);
      }
      setShowModal(false);
      setPage(1);
      // Refresh list (new codes sort by code ascending)
      const { data } = await adminService.getPincodes({
        search: debouncedSearch || undefined,
        page: 1,
        limit: PAGE_SIZE,
      });
      setPincodes(data.pincodes || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save pincode');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pincode?')) return;
    try {
      await adminService.deletePincode(id);
      fetchPincodes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete pincode');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search pincode, city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search pl-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">
            Total: <span className="text-slate-900 font-bold">{total}</span>
          </span>
          <button type="button" className="admin-btn admin-btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Add Pincode
          </button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>
            Serviceable Pincodes
            <span className="text-slate-400 font-medium text-sm ml-2">
              (showing {pincodes.length} of {total})
            </span>
          </h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pincode</th>
              <th>City</th>
              <th>State</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
            ) : pincodes.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No pincodes found</td></tr>
            ) : (
              pincodes.map((pin) => (
                <tr key={pin._id}>
                  <td className="font-bold text-[#0F172A]">{pin.code}</td>
                  <td>{pin.city}</td>
                  <td>{pin.state}</td>
                  <td>
                    <span className={`admin-badge ${pin.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {pin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(pin)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-blue-500 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pin._id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Pincode' : 'Add New Pincode'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form id="pincodeForm" onSubmit={handleSubmit}>
                <div className="admin-field">
                  <label>Pincode</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    value={form.code}
                    onChange={(e) =>
                      setForm({ ...form, code: e.target.value.replace(/\D/g, '').slice(0, 6) })
                    }
                    placeholder="e.g. 400001"
                  />
                </div>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>City</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                  <div className="admin-field">
                    <label>State</label>
                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                </div>
                <div className="admin-field">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm text-slate-600">Is Active</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" form="pincodeForm" disabled={submitting} className="admin-btn admin-btn-primary">
                {submitting ? 'Saving...' : 'Save Pincode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
