import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Settings, Save } from 'lucide-react';
import './admin.css';

export default function AdminAppSettings() {
  const [pages, setPages] = useState([]);
  const [requireAddressFor, setRequireAddressFor] = useState(['sell', 'buy', 'repair']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAppSettings();
      setPages(data.pages || []);
      setRequireAddressFor(data.requireAddressFor || ['sell', 'buy', 'repair']);
    } catch (e) {
      console.error(e);
      setMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updatePage = (key, patch) => {
    setPages((list) => list.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  };

  const toggleRequireAddress = (key) => {
    setRequireAddressFor((list) =>
      list.includes(key) ? list.filter((k) => k !== key) : [...list, key],
    );
  };

  const onSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { data } = await adminService.saveAppSettings({ pages, requireAddressFor });
      setPages(data.pages || []);
      setRequireAddressFor(data.requireAddressFor || []);
      setMessage('Settings saved');
    } catch (e) {
      setMessage(e.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="text-slate-500 font-semibold">Loading app settings…</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings size={22} className="text-blue-600" />
            App Settings
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-1 max-w-2xl">
            Turn pages on/off (Coming Soon). Mark pages that hide for users whose saved address
            pincode is not serviceable. Guests without an address can still browse. Sell / Buy /
            Repair always need a serviceable address before checkout.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" disabled={saving} onClick={onSave}>
          <Save size={16} />
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      {message ? (
        <div className="mb-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </div>
      ) : null}

      <div className="admin-card mb-6">
        <h3 className="text-sm font-800 text-slate-500 uppercase tracking-wider mb-3">
          Always require address (transactional)
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          These flows ask for a serviceable address even if the user can browse the tab.
        </p>
        <div className="flex flex-wrap gap-3">
          {['sell', 'buy', 'repair'].map((key) => (
            <label
              key={key}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer">
              <input
                type="checkbox"
                checked={requireAddressFor.includes(key)}
                onChange={() => toggleRequireAddress(key)}
              />
              <span className="text-sm font-bold capitalize text-slate-800">{key}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Enabled</th>
              <th>Restrict by pincode</th>
              <th>Behaviour</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.key}>
                <td>
                  <div className="font-bold text-slate-800">{page.label}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{page.key}</div>
                </td>
                <td>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={page.enabled !== false}
                      onChange={(e) => updatePage(page.key, { enabled: e.target.checked })}
                    />
                    <span className="text-xs font-bold text-slate-600">
                      {page.enabled !== false ? 'On' : 'Coming Soon'}
                    </span>
                  </label>
                </td>
                <td>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(page.restrictByPincode)}
                      onChange={(e) =>
                        updatePage(page.key, { restrictByPincode: e.target.checked })
                      }
                    />
                    <span className="text-xs font-bold text-slate-600">
                      {page.restrictByPincode ? 'Yes' : 'No'}
                    </span>
                  </label>
                </td>
                <td className="text-xs text-slate-500 font-semibold max-w-xs">
                  {page.enabled === false
                    ? 'Everyone sees Coming Soon'
                    : page.restrictByPincode
                      ? 'Hidden for users whose saved pincode is not serviceable; guests without address can browse'
                      : 'Visible to everyone (if enabled)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
