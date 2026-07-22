import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

const DEFAULT_ISSUES = [
  { key: 'screen', label: 'Screen Damage', price: 2499, description: 'Cracked, dead pixels, or touch issues', isActive: true },
  { key: 'battery', label: 'Battery Replacement', price: 1499, description: 'Low health, swelling, or fast drain', isActive: true },
  { key: 'camera', label: 'Camera Repair', price: 1999, description: 'Blurry lens, focus fail, or dead camera', isActive: true },
  { key: 'mic', label: 'Mic / Speaker', price: 999, description: 'No sound, muffled audio, or mic fail', isActive: true },
  { key: 'charging', label: 'Charging Port', price: 1299, description: 'Loose port or not charging', isActive: true },
  { key: 'soft_damage', label: 'Software Issues', price: 799, description: 'Boot loop, update fail, lag', isActive: true },
  { key: 'back_panel', label: 'Back Panel', price: 1799, description: 'Cracked or scratched rear glass', isActive: true },
  { key: 'other', label: 'Other', price: 499, description: 'Describe the issue while booking', isActive: true },
];

const EMPTY_FORM = {
  category: 'mobile',
  brand: '',
  title: '',
  slug: '',
  description: 'Doorstep repair by trained technicians with quality check.',
  imageUrl: '',
  turnaroundHours: 24,
  warrantyDays: 90,
  isActive: true,
  issues: DEFAULT_ISSUES.map((i) => ({ ...i })),
};

export default function AdminRepairServices() {
  const [services, setServices] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getRepairServices({ search });
      setServices(data.services || []);
      if (Array.isArray(data.defaultIssues) && data.defaultIssues.length && !editingId) {
        // keep defaults as template only when creating next time
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = (category) => {
    adminService
      .getBrands({ category, offer: 'repair', active: 'true' })
      .then((res) => setBrandOptions(res.data.brands || []))
      .catch(() => setBrandOptions([]));
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  useEffect(() => {
    if (showModal) loadBrands(form.category);
  }, [showModal, form.category]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      issues: DEFAULT_ISSUES.map((i) => ({ ...i })),
    });
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditingId(service._id);
    setForm({
      category: service.category || 'mobile',
      brand: service.brand || '',
      title: service.title || '',
      slug: service.slug || '',
      description: service.description || '',
      imageUrl: service.imageUrl || '',
      turnaroundHours: service.turnaroundHours ?? 24,
      warrantyDays: service.warrantyDays ?? 90,
      isActive: service.isActive !== false,
      issues: (service.issues || []).map((i) => ({
        key: i.key,
        label: i.label,
        price: i.price,
        description: i.description || '',
        isActive: i.isActive !== false,
      })),
    });
    setShowModal(true);
  };

  const updateIssue = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      issues: prev.issues.map((issue, i) => (i === index ? { ...issue, [field]: value } : issue)),
    }));
  };

  const addIssueRow = () => {
    setForm((prev) => ({
      ...prev,
      issues: [
        ...prev.issues,
        { key: `issue_${prev.issues.length + 1}`, label: '', price: 0, description: '', isActive: true },
      ],
    }));
  };

  const removeIssueRow = (index) => {
    setForm((prev) => ({
      ...prev,
      issues: prev.issues.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const issues = form.issues.filter((i) => i.label && Number(i.price) >= 0);
    if (!issues.length) {
      alert('Add at least one repair issue with price');
      return;
    }
    if (!form.brand) {
      alert('Select a brand (mark brand with Repair offer first)');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, issues };
      if (editingId) await adminService.updateRepairService(editingId, payload);
      else await adminService.createRepairService(payload);
      setShowModal(false);
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save repair service');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this repair service?')) return;
    try {
      await adminService.deleteRepairService(id);
      fetchServices();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="admin-search pl-10"
            placeholder="Search repair brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Add Repair Service
        </button>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>Repair Catalog</h3>
          <span className="text-sm text-slate-400">{services.length} services</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Brand</th>
              <th>Issues</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28 }}>
                  Loading...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28 }}>
                  No repair services yet. Enable Repair on Brands, then add issue pricing here.
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service._id}>
                  <td>
                    <div className="font-semibold">{service.title || `${service.brand} Repair`}</div>
                    <div className="text-xs text-slate-400">{service.slug}</div>
                  </td>
                  <td>{service.brand}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(service.issues || []).slice(0, 4).map((issue) => (
                        <span key={issue.key} className="admin-badge admin-badge-blue">
                          {issue.label}: ₹{issue.price}
                        </span>
                      ))}
                      {(service.issues || []).length > 4 ? (
                        <span className="admin-badge">+{service.issues.length - 4}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${service.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => openEdit(service)}>
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDelete(service._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal ? (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 820 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Repair Service' : 'Add Repair Service'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <form id="repairServiceForm" onSubmit={handleSubmit}>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value, brand: '' }))}>
                      <option value="mobile">Phone</option>
                      <option value="tablet">Tablet</option>
                      <option value="laptop">Laptop</option>
                      <option value="smartwatch">Smartwatch</option>
                      <option value="earbuds">Earbuds</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Brand</label>
                    <select
                      required
                      value={form.brand}
                      onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}>
                      <option value="">Select repair brand</option>
                      {brandOptions.map((b) => (
                        <option key={b._id || b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {!brandOptions.length ? (
                      <p className="text-xs text-amber-500 mt-1">
                        No brands with Repair offer for this category.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Title</label>
                    <input
                      value={form.title}
                      placeholder="Auto: Brand Repair"
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Image (max 3MB)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      {form.imageUrl ? (
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-white"
                        />
                      ) : null}
                      <label className="admin-btn admin-btn-ghost cursor-pointer">
                        {uploadingImage ? 'Uploading...' : form.imageUrl ? 'Change image' : 'Upload image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 3 * 1024 * 1024) {
                              alert('Image must be 3MB or less');
                              e.target.value = '';
                              return;
                            }
                            setUploadingImage(true);
                            try {
                              const { data } = await adminService.uploadImage(file);
                              setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
                            } catch (err) {
                              alert(err.response?.data?.message || 'Image upload failed');
                            } finally {
                              setUploadingImage(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      {form.imageUrl ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost text-xs text-red-500"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="admin-field">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Turnaround (hours)</label>
                    <input
                      type="number"
                      value={form.turnaroundHours}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, turnaroundHours: Number(e.target.value) || 24 }))
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Warranty (days)</label>
                    <input
                      type="number"
                      value={form.warrantyDays}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, warrantyDays: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <div className="flex items-center justify-between mb-2">
                    <label>Repair issues & prices</label>
                    <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={addIssueRow}>
                      + Add issue
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.issues.map((issue, index) => (
                      <div key={`${issue.key}-${index}`} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <div className="admin-field-row">
                          <div className="admin-field">
                            <label>Label</label>
                            <input
                              value={issue.label}
                              onChange={(e) => updateIssue(index, 'label', e.target.value)}
                              required
                            />
                          </div>
                          <div className="admin-field">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              value={issue.price}
                              onChange={(e) => updateIssue(index, 'price', Number(e.target.value) || 0)}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Active</label>
                            <select
                              value={issue.isActive ? '1' : '0'}
                              onChange={(e) => updateIssue(index, 'isActive', e.target.value === '1')}>
                              <option value="1">Yes</option>
                              <option value="0">No</option>
                            </select>
                          </div>
                        </div>
                        <div className="admin-field">
                          <label>Description</label>
                          <textarea
                            rows={2}
                            value={issue.description}
                            onChange={(e) => updateIssue(index, 'description', e.target.value)}
                          />
                        </div>
                        {form.issues.length > 1 ? (
                          <button
                            type="button"
                            className="text-xs text-red-500 font-semibold"
                            onClick={() => removeIssueRow(index)}>
                            Remove
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-field">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                type="submit"
                form="repairServiceForm"
                className="admin-btn admin-btn-primary"
                disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
