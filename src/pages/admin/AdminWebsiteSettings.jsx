import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Globe, Save, Upload } from 'lucide-react';
import './admin.css';

export default function AdminWebsiteSettings() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAppSettings();
      setCategories(data.categories || []);
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

  const onUploadImage = async (key, file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image must be 10MB or less');
      return;
    }
    setUploadingKey(key);
    try {
      const { data } = await adminService.uploadImage(file);
      updateCategory(key, { imageUrl: data.imageUrl });
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
      const { data } = await adminService.saveAppSettings({ categories });
      setCategories(data.categories || []);
      setMessage('Website category settings saved');
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
    <div className="admin-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Globe size={22} className="text-blue-600" />
            Website Settings
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-1 max-w-2xl">
            Turn sell/buy categories on or off for the website home and buy hub. Upload a card image
            for each category. Devices you add in Admin must use the matching category.
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
                      {uploadingKey === cat.key ? '…' : <Upload size={14} />}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingKey === cat.key}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          onUploadImage(cat.key, file);
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
                <td className="text-xs font-mono text-slate-500 max-w-[140px] truncate">{cat.sellPath}</td>
                <td className="text-xs font-mono text-slate-500 max-w-[140px] truncate">{cat.buyPath}</td>
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
    </div>
  );
}
