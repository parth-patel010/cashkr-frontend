import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

const CONDITION_DEFAULTS = [
  { key: 'best_value', label: 'Best Value', price: 0, mrp: 0, description: '', stock: 0 },
  { key: 'fair', label: 'Fair', price: 0, mrp: 0, description: '', stock: 0 },
  { key: 'good', label: 'Good', price: 0, mrp: 0, description: '', stock: 0 },
  { key: 'superb', label: 'Superb', price: 0, mrp: 0, description: '', stock: 0 },
];

const EMPTY_FORM = {
  category: 'mobile',
  brand: '',
  modelName: '',
  slug: '',
  title: '',
  description: '',
  imageUrl: '',
  videoUrl: '',
  warrantyMonths: 12,
  isActive: true,
  conditions: CONDITION_DEFAULTS.map((c) => ({ ...c })),
};

export default function AdminBuyDevices() {
  const [products, setProducts] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getBuyProducts({ search });
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = (category) => {
    adminService
      .getBrands({ category, offer: 'buy', active: 'true' })
      .then((res) => setBrandOptions(res.data.brands || []))
      .catch(() => setBrandOptions([]));
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  useEffect(() => {
    if (showModal) loadBrands(form.category);
  }, [showModal, form.category]);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      conditions: CONDITION_DEFAULTS.map((c) => ({ ...c })),
    });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    const mergedConditions = CONDITION_DEFAULTS.map((def) => {
      const existing = (product.conditions || []).find((c) => c.key === def.key);
      return existing ? { ...def, ...existing } : { ...def };
    });
    setForm({
      category: product.category || 'mobile',
      brand: product.brand || '',
      modelName: product.modelName || '',
      slug: product.slug || '',
      title: product.title || '',
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      videoUrl: product.videoUrl || '',
      warrantyMonths: product.warrantyMonths ?? 12,
      isActive: product.isActive !== false,
      conditions: mergedConditions,
    });
    setShowModal(true);
  };

  const updateCondition = (key, field, value) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.key === key ? { ...c, [field]: value } : c)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const conditions = form.conditions.filter((c) => Number(c.price) > 0 || c.description);
    if (!conditions.length) {
      alert('Set at least one condition price');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form, conditions };
      if (editingId) await adminService.updateBuyProduct(editingId, payload);
      else await adminService.createBuyProduct(payload);
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this buy product?')) return;
    try {
      await adminService.deleteBuyProduct(id);
      fetchProducts();
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
            placeholder="Search buy devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Add Buy Device
        </button>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>Buy Inventory</h3>
          <span className="text-sm text-slate-400">{products.length} products</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Conditions</th>
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
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 28 }}>
                  No buy products yet. Mark brands with Buy offer, then add devices here.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{p.modelName?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{p.title || p.modelName}</div>
                        <div className="text-xs text-slate-400">{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.brand}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(p.conditions || []).map((c) => (
                        <span key={c.key} className="admin-badge admin-badge-blue">
                          {c.label}: ₹{c.price}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${p.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => openEdit(p)}>
                        <Edit size={14} />
                      </button>
                      <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(p._id)}>
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
          <div className="admin-modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Buy Device' : 'Add Buy Device'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <form id="buyProductForm" onSubmit={handleSubmit}>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value, brand: '' }))}>
                      <option value="mobile">Phone</option>
                      <option value="laptop">Laptop</option>
                      <option value="tablet">Tablet</option>
                      <option value="smartwatch">Smartwatch</option>
                      <option value="earbuds">Earbuds</option>
                      <option value="tv">TV</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Brand</label>
                    <select
                      required
                      value={form.brand}
                      onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}>
                      <option value="">Select brand</option>
                      {brandOptions.map((b) => (
                        <option key={b._id || b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Model name</label>
                    <input
                      required
                      value={form.modelName}
                      onChange={(e) => setForm((prev) => ({ ...prev, modelName: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Title</label>
                    <input
                      value={form.title}
                      placeholder="Auto from brand + model if empty"
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Image URL</label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Warranty (months)</label>
                    <input
                      type="number"
                      value={form.warrantyMonths}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, warrantyMonths: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label>Video (max 10MB)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      value={form.videoUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="Video URL"
                    />
                    <label className="admin-btn admin-btn-ghost cursor-pointer">
                      {uploadingVideo ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={uploadingVideo}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            alert('Video must be 10MB or less');
                            return;
                          }
                          setUploadingVideo(true);
                          try {
                            const { data } = await adminService.uploadBuyVideo(file);
                            setForm((prev) => ({ ...prev, videoUrl: data.videoUrl }));
                          } catch (err) {
                            alert(err.response?.data?.message || 'Upload failed');
                          } finally {
                            setUploadingVideo(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-field">
                  <label>Condition prices & descriptions</label>
                  <div className="space-y-3 mt-2">
                    {form.conditions.map((c) => (
                      <div key={c.key} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <div className="font-semibold text-sm">{c.label}</div>
                        <div className="admin-field-row">
                          <div className="admin-field">
                            <label>Price (₹)</label>
                            <input
                              type="number"
                              value={c.price}
                              onChange={(e) => updateCondition(c.key, 'price', Number(e.target.value) || 0)}
                            />
                          </div>
                          <div className="admin-field">
                            <label>MRP (₹)</label>
                            <input
                              type="number"
                              value={c.mrp}
                              onChange={(e) => updateCondition(c.key, 'mrp', Number(e.target.value) || 0)}
                            />
                          </div>
                          <div className="admin-field">
                            <label>Stock</label>
                            <input
                              type="number"
                              value={c.stock}
                              onChange={(e) => updateCondition(c.key, 'stock', Number(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="admin-field">
                          <label>What this condition includes</label>
                          <textarea
                            rows={2}
                            value={c.description}
                            onChange={(e) => updateCondition(c.key, 'description', e.target.value)}
                            placeholder="Describe scratches, battery health, box, warranty, etc."
                          />
                        </div>
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
              <button type="submit" form="buyProductForm" className="admin-btn admin-btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
