import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Globe, Save, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import './admin.css';

const newBannerId = () => `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function AdminWebsiteSettings() {
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAppSettings();
      setCategories(data.categories || []);
      setBanners(data.banners || []);
    } catch (e) {
      console.error(e);
      setMessage('Failed to load website settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateCategory = (key, patch) => {
    setCategories((list) => list.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };

  const updateBanner = (id, patch) => {
    setBanners((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const addBanner = () => {
    setBanners((list) => [
      ...list,
      {
        id: newBannerId(),
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '/',
        imageUrl: '',
        enabled: true,
        sortOrder: list.length + 1,
      },
    ]);
  };

  const removeBanner = (id) => {
    setBanners((list) => list.filter((b) => b.id !== id));
  };

  const onUploadCategoryImage = async (key, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be 10MB or less');
      return;
    }
    setUploadingKey(`cat-${key}`);
    try {
      const { data } = await adminService.uploadImage(file);
      updateCategory(key, { imageUrl: data.imageUrl });
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingKey('');
    }
  };

  const onUploadBannerImage = async (id, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be 10MB or less');
      return;
    }
    setUploadingKey(`banner-${id}`);
    try {
      const { data } = await adminService.uploadImage(file);
      updateBanner(id, { imageUrl: data.imageUrl });
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploadingKey('');
    }
  };

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { data } = await adminService.saveAppSettings({ categories, banners });
      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setMessage('Website settings saved');
    } catch (e) {
      setMessage(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="text-slate-500 font-semibold">Loading website settings…</p>
      </div>
    );
  }

  return (
    <div className="admin-page space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Globe size={22} className="text-blue-600" />
            Website Settings
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-1 max-w-2xl">
            Manage homepage banners (image only) and sell/buy categories. Upload banner images for
            the home carousel, and toggle category visibility.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" disabled={saving} onClick={onSave}>
          <Save size={16} />
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {message ? (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </div>
      ) : null}

      {/* ── Homepage Banners ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ImageIcon size={18} className="text-blue-600" />
            Homepage Banners
          </h3>
          <button type="button" className="admin-btn admin-btn-ghost text-sm" onClick={addBanner}>
            <Plus size={14} />
            Add banner
          </button>
        </div>
        <p className="text-xs text-slate-500 font-semibold">
          Image-only banners. Upload a wide image (recommended ~1400×400). Optional link opens when
          the banner is clicked. Toggle Off to hide a slide. If no admin images are set, the site
          uses the default app banners.
        </p>

        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-1 lg:grid-cols-[180px_1fr_auto] gap-4 items-center"
            >
              <div className="space-y-2">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="w-full h-24 object-contain rounded-lg border border-slate-200 bg-slate-50"
                  />
                ) : (
                  <div className="w-full h-24 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold">
                    No image
                  </div>
                )}
                <label className="admin-btn admin-btn-ghost text-xs cursor-pointer w-full justify-center">
                  {uploadingKey === `banner-${banner.id}` ? 'Uploading…' : (
                    <>
                      <Upload size={14} /> Upload image
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingKey === `banner-${banner.id}`}
                    onChange={(e) => {
                      onUploadBannerImage(banner.id, e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
                {banner.imageUrl ? (
                  <button
                    type="button"
                    className="text-xs text-red-500 font-bold"
                    onClick={() => updateBanner(banner.id, { imageUrl: '' })}
                  >
                    Clear image
                  </button>
                ) : null}
              </div>

              <div className="admin-field mb-0">
                <label>Click link (optional)</label>
                <input
                  type="text"
                  value={banner.ctaLink || ''}
                  onChange={(e) => updateBanner(banner.id, { ctaLink: e.target.value })}
                  placeholder="/sell-old-mobile-phones/brand"
                />
              </div>

              <div className="flex flex-col items-end gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={banner.enabled !== false}
                    onChange={(e) => updateBanner(banner.id, { enabled: e.target.checked })}
                  />
                  <span className="text-xs font-bold text-slate-600">
                    {banner.enabled !== false ? 'On' : 'Off'}
                  </span>
                </label>
                <div className="admin-field mb-0 w-20">
                  <label>Order</label>
                  <input
                    type="number"
                    value={banner.sortOrder ?? 0}
                    onChange={(e) =>
                      updateBanner(banner.id, { sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => removeBanner(banner.id)}
                  title="Remove banner"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="space-y-4">
        <h3 className="text-base font-black text-slate-900">Categories</h3>
        <div className="admin-table-wrapper overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Image</th>
                <th>Sell</th>
                <th>Buy</th>
                <th>Sell path</th>
                <th>Buy path</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.key}>
                  <td>
                    <div className="font-bold text-slate-900">{cat.label}</div>
                    <div className="text-xs text-slate-400 font-mono">{cat.key}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt={cat.label}
                          className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-slate-50" />
                      )}
                      <label className="admin-btn admin-btn-ghost text-xs cursor-pointer">
                        {uploadingKey === `cat-${cat.key}` ? '…' : <Upload size={14} />}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingKey === `cat-${cat.key}`}
                          onChange={(e) => {
                            onUploadCategoryImage(cat.key, e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {cat.imageUrl ? (
                        <button
                          type="button"
                          className="text-xs text-red-500 font-bold"
                          onClick={() => updateCategory(cat.key, { imageUrl: '' })}
                        >
                          Clear
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cat.enabledSell !== false}
                        onChange={(e) => updateCategory(cat.key, { enabledSell: e.target.checked })}
                      />
                      <span className="text-xs font-bold text-slate-600">
                        {cat.enabledSell !== false ? 'On' : 'Off'}
                      </span>
                    </label>
                  </td>
                  <td>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cat.enabledBuy !== false}
                        onChange={(e) => updateCategory(cat.key, { enabledBuy: e.target.checked })}
                      />
                      <span className="text-xs font-bold text-slate-600">
                        {cat.enabledBuy !== false ? 'On' : 'Off'}
                      </span>
                    </label>
                  </td>
                  <td className="text-xs font-mono text-slate-500 max-w-[140px] truncate">
                    {cat.sellPath}
                  </td>
                  <td className="text-xs font-mono text-slate-500 max-w-[140px] truncate">
                    {cat.buyPath}
                  </td>
                  <td>
                    <input
                      type="number"
                      className="admin-select w-20"
                      value={cat.sortOrder ?? 0}
                      onChange={(e) =>
                        updateCategory(cat.key, { sortOrder: Number(e.target.value) || 0 })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
