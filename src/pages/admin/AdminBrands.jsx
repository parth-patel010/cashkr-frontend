import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Edit, Upload, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

const CATEGORY_LABELS = {
  mobile: 'Phone',
  laptop: 'Laptop',
  tablet: 'Tablet',
  earbuds: 'Earbuds',
  tv: 'TV',
  smartwatch: 'Smartwatch',
  speakers: 'Speakers',
  mac: 'Mac / iMac',
  camera: 'Camera',
  gaming: 'Gaming',
  other: 'Other',
};

const EMPTY_FORM = {
  name: '',
  logoUrl: '',
  color: '#2F6BFF',
  categories: ['mobile'],
  offers: ['sell'],
  sortOrder: 0,
  isActive: true,
};

const OFFER_LABELS = {
  sell: 'Sell',
  buy: 'Buy',
  repair: 'Repair',
};

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState(Object.keys(CATEGORY_LABELS));
  const [offers, setOffers] = useState(['sell', 'buy', 'repair']);
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      const { data } = await adminService.getBrands(params);
      setBrands(data.brands || []);
      if (Array.isArray(data.categories) && data.categories.length) {
        setCategories(data.categories);
      }
      if (Array.isArray(data.offers) && data.offers.length) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Failed to load brands', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogos = async () => {
    try {
      const { data } = await adminService.getBrandLogos();
      setLogos(data.logos || []);
    } catch (error) {
      console.error('Failed to load logos', error);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [search, filterCategory]);

  useEffect(() => {
    fetchLogos();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowLogoPicker(false);
    setShowModal(true);
  };

  const openEdit = (brand) => {
    setEditingId(brand._id);
    setForm({
      name: brand.name || '',
      logoUrl: brand.logoUrl || '',
      color: brand.color || '#2F6BFF',
      categories: brand.categories?.length ? brand.categories : ['mobile'],
      offers: brand.offers?.length ? brand.offers : ['sell'],
      sortOrder: brand.sortOrder ?? 0,
      isActive: brand.isActive !== false,
    });
    setShowLogoPicker(false);
    setShowModal(true);
  };

  const toggleCategory = (cat) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      const next = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: next.length ? next : prev.categories };
    });
  };

  const toggleOffer = (offer) => {
    setForm((prev) => {
      const exists = prev.offers.includes(offer);
      const next = exists ? prev.offers.filter((o) => o !== offer) : [...prev.offers, offer];
      return { ...prev, offers: next.length ? next : prev.offers };
    });
  };

  const selectAllOffers = () => {
    setForm((prev) => ({ ...prev, offers: [...offers] }));
  };

  const onUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await adminService.uploadBrandLogo(file);
      setForm((prev) => ({ ...prev, logoUrl: data.logoUrl }));
      await fetchLogos();
    } catch (error) {
      alert(error.response?.data?.message || 'Logo upload failed. Check Cloudinary env vars.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Brand name is required');
      return;
    }
    if (!form.categories.length) {
      alert('Select at least one category');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await adminService.updateBrand(editingId, form);
      } else {
        await adminService.createBrand(form);
      }
      setShowModal(false);
      fetchBrands();
      fetchLogos();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save brand');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await adminService.deleteBrand(id);
      fetchBrands();
      fetchLogos();
    } catch {
      alert('Failed to delete brand');
    }
  };

  const logoHint = useMemo(
    () => (logos.length ? `${logos.length} reusable logos` : 'No saved logos yet — upload one'),
    [logos],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="admin-search pl-10"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="admin-search"
            style={{ paddingLeft: 12 }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Add Brand
        </button>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>Brand Catalog</h3>
          <span className="text-sm text-slate-400">{brands.length} brands</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Categories</th>
              <th>Offers</th>
              <th>Sort</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                  Loading brands...
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                  No brands yet. Click Add Brand or run <code>npm run seed:brands</code> for Phone / Laptop / Tablet.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <strong>{brand.name?.[0]}</strong>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{brand.name}</div>
                        <div className="text-xs text-slate-400">{brand.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(brand.categories || []).map((cat) => (
                        <span key={cat} className="admin-badge admin-badge-blue">
                          {CATEGORY_LABELS[cat] || cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(brand.offers || ['sell']).map((offer) => (
                        <span key={offer} className="admin-badge admin-badge-green">
                          {OFFER_LABELS[offer] || offer}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{brand.sortOrder ?? 0}</td>
                  <td>
                    <span className={`admin-badge ${brand.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => openEdit(brand)}>
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDelete(brand._id)}>
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
          <div className="admin-modal" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Brand' : 'Add Brand'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <form id="brandForm" onSubmit={handleSubmit}>
                <div className="admin-field">
                  <label>Brand name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Apple, Sony, Boat"
                  />
                </div>

                <div className="admin-field">
                  <label>Categories</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {categories.map((cat) => {
                      const active = form.categories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}>
                          {CATEGORY_LABELS[cat] || cat}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Phone, Laptop & Tablet can be prefilled via <code>npm run seed:brands</code>. Add Earbuds, TV, etc. here.
                  </p>
                </div>

                <div className="admin-field">
                  <label>Offers (where this brand appears)</label>
                  <div className="flex flex-wrap gap-2 mt-1 items-center">
                    {offers.map((offer) => {
                      const active = form.offers.includes(offer);
                      return (
                        <button
                          key={offer}
                          type="button"
                          onClick={() => toggleOffer(offer)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}>
                          {OFFER_LABELS[offer] || offer}
                        </button>
                      );
                    })}
                    <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={selectAllOffers}>
                      Select all
                    </button>
                  </div>
                </div>

                <div className="admin-field">
                  <label>Brand image</label>
                  <div className="flex items-start gap-3 mt-1">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      {form.logoUrl ? (
                        <img src={form.logoUrl} alt="Preview" className="w-12 h-12 object-contain" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={22} />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost"
                        onClick={() => setShowLogoPicker((v) => !v)}>
                        <ImageIcon size={14} />
                        Select existing image
                      </button>
                      <label className="admin-btn admin-btn-ghost cursor-pointer inline-flex items-center gap-2">
                        <Upload size={14} />
                        {uploading ? 'Uploading...' : 'Upload new image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onUpload}
                          disabled={uploading}
                        />
                      </label>
                      <span className="text-xs text-slate-400">{logoHint}</span>
                    </div>
                  </div>

                  {showLogoPicker ? (
                    <div
                      className="mt-3 max-h-44 overflow-y-auto rounded-xl p-2 grid grid-cols-4 gap-2"
                      style={{ border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      {logos.length === 0 ? (
                        <p className="col-span-4 text-xs text-slate-500 p-2">No existing logos yet.</p>
                      ) : (
                        logos.map((logo) => (
                          <button
                            key={logo.logoUrl}
                            type="button"
                            title={logo.name}
                            className="p-2 rounded-lg bg-white border hover:border-blue-500"
                            style={{
                              borderColor: form.logoUrl === logo.logoUrl ? '#2563EB' : '#E2E8F0',
                            }}
                            onClick={() => {
                              setForm((prev) => ({ ...prev, logoUrl: logo.logoUrl }));
                              setShowLogoPicker(false);
                            }}>
                            <img src={logo.logoUrl} alt={logo.name} className="w-full h-10 object-contain" />
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}

                  <input
                    className="mt-3"
                    type="url"
                    value={form.logoUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="Or paste image URL"
                  />
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Accent color</label>
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Sort order</label>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm">Active brand</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" form="brandForm" disabled={submitting} className="admin-btn admin-btn-primary">
                {submitting ? 'Saving...' : 'Save Brand'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
