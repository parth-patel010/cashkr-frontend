import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Plus, Trash2, Edit, Tag, Upload } from 'lucide-react';
import './admin.css';

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  redirectPage: '',
  allowedPincodes: '',
  loginOnly: true,
  isActive: true,
};

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getOffers();
      setOffers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openModal = (offer = null) => {
    if (offer) {
      setEditingId(offer._id);
      setForm({
        title: offer.title || '',
        description: offer.description || '',
        imageUrl: offer.imageUrl || '',
        redirectPage: offer.redirectPage || '',
        allowedPincodes: Array.isArray(offer.allowedPincodes)
          ? offer.allowedPincodes.join(', ')
          : '',
        loginOnly: offer.loginOnly !== false,
        isActive: offer.isActive !== false,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const onUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be 10MB or less');
      return;
    }
    setUploading(true);
    try {
      const { data } = await adminService.uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: data.imageUrl }));
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        imageUrl: form.imageUrl,
        redirectPage: form.redirectPage.trim(),
        allowedPincodes: form.allowedPincodes
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
        loginOnly: Boolean(form.loginOnly),
        isActive: Boolean(form.isActive),
      };
      if (editingId) {
        await adminService.updateOffer(editingId, payload);
      } else {
        await adminService.createOffer(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await adminService.deleteOffer(id);
      load();
    } catch {
      alert('Failed to delete offer');
    }
  };

  return (
    <div className="admin-page space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Tag size={22} className="text-blue-600" />
            Offers
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Manage promo offers with image, redirect page, pincode allow-list, and login-only flag.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => openModal()}>
          <Plus size={16} /> Add offer
        </button>
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-8 text-slate-400">Loading…</div>
        ) : offers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No offers yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Redirect</th>
                <th>Pincodes</th>
                <th>Login only</th>
                <th>Active</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer._id}>
                  <td>
                    {offer.imageUrl ? (
                      <img
                        src={offer.imageUrl}
                        alt=""
                        className="w-14 h-10 object-cover rounded-lg border border-slate-200"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td>
                    <div className="font-bold text-slate-900">{offer.title}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[220px]">
                      {offer.description}
                    </div>
                  </td>
                  <td className="text-xs font-mono">{offer.redirectPage || '—'}</td>
                  <td className="text-xs">
                    {(offer.allowedPincodes || []).length
                      ? offer.allowedPincodes.join(', ')
                      : 'All'}
                  </td>
                  <td>{offer.loginOnly !== false ? 'Yes' : 'No'}</td>
                  <td>
                    <span
                      className={
                        offer.isActive
                          ? 'admin-badge admin-badge-green'
                          : 'admin-badge admin-badge-gray'
                      }
                    >
                      {offer.isActive ? 'Active' : 'Off'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost text-xs"
                        onClick={() => openModal(offer)}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost text-xs text-red-500"
                        onClick={() => onDelete(offer._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal ? (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit offer' : 'New offer'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={onSubmit} className="admin-modal-body space-y-3">
              <div className="admin-field">
                <label>Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label>Image</label>
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="w-full h-32 object-contain rounded-lg border border-slate-200 bg-slate-50 mb-2"
                  />
                ) : null}
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="admin-btn admin-btn-ghost text-sm cursor-pointer inline-flex">
                    {uploading ? (
                      'Uploading…'
                    ) : (
                      <>
                        <Upload size={14} /> Upload image
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        onUpload(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {form.imageUrl ? (
                    <button
                      type="button"
                      className="text-xs text-red-500 font-bold"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="admin-field">
                <label>Redirect page</label>
                <input
                  value={form.redirectPage}
                  onChange={(e) => setForm((f) => ({ ...f, redirectPage: e.target.value }))}
                  placeholder="/sell"
                />
              </div>
              <div className="admin-field">
                <label>Allowed pincodes (comma-separated, blank = all)</label>
                <input
                  value={form.allowedPincodes}
                  onChange={(e) => setForm((f) => ({ ...f, allowedPincodes: e.target.value }))}
                  placeholder="110001, 400001"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.loginOnly}
                    onChange={(e) => setForm((f) => ({ ...f, loginOnly: e.target.checked }))}
                  />
                  <span className="text-sm font-bold">Login only</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <span className="text-sm font-bold">Active</span>
                </label>
              </div>
              <div className="admin-modal-footer px-0 pb-0">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
