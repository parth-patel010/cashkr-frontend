import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Settings, Save } from 'lucide-react';
import './admin.css';

const DEFAULT_ANDROID_DOWNLOAD =
  'https://play.google.com/store/apps/details?id=com.devicekart.app';
const DEFAULT_MAINTENANCE_MESSAGE =
  "We're working to improve your experience. Please try again later.";

export default function AdminAppSettings() {
  const [pages, setPages] = useState([]);
  const [requireAddressFor, setRequireAddressFor] = useState(['sell', 'buy', 'repair']);
  const [referralBonusAmount, setReferralBonusAmount] = useState(100);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(DEFAULT_MAINTENANCE_MESSAGE);
  const [maintenanceContact, setMaintenanceContact] = useState('');
  const [androidMinVersion, setAndroidMinVersion] = useState('');
  const [androidDownloadUrl, setAndroidDownloadUrl] = useState(DEFAULT_ANDROID_DOWNLOAD);
  const [iosMinVersion, setIosMinVersion] = useState('');
  const [iosDownloadUrl, setIosDownloadUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const applyData = (data) => {
    setPages(data.pages || []);
    setRequireAddressFor(data.requireAddressFor || ['sell', 'buy', 'repair']);
    setReferralBonusAmount(
      data.referralBonusAmount != null ? Number(data.referralBonusAmount) : 100,
    );
    setMaintenanceMode(data.maintenanceMode === true);
    setMaintenanceMessage(data.maintenanceMessage || DEFAULT_MAINTENANCE_MESSAGE);
    setMaintenanceContact(data.maintenanceContact || '');
    setAndroidMinVersion(data.versionControl?.android?.minVersion || data.androidMinVersion || '');
    setAndroidDownloadUrl(
      data.versionControl?.android?.downloadUrl ||
        data.androidDownloadUrl ||
        DEFAULT_ANDROID_DOWNLOAD,
    );
    setIosMinVersion(data.versionControl?.ios?.minVersion || data.iosMinVersion || '');
    setIosDownloadUrl(data.versionControl?.ios?.downloadUrl || data.iosDownloadUrl || '');
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getAppSettings();
      applyData(data);
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
      const { data } = await adminService.saveAppSettings({
        pages,
        requireAddressFor,
        referralBonusAmount: Number(referralBonusAmount) || 0,
        maintenanceMode,
        maintenanceMessage,
        maintenanceContact,
        androidMinVersion,
        androidDownloadUrl,
        iosMinVersion,
        iosDownloadUrl,
      });
      applyData(data);
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
            Turn pages on/off (Coming Soon). Maintenance locks the app. Force update triggers when
            the installed app version is below the platform minimum.
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
          Maintenance mode
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          When on, the mobile app shows a blocking maintenance screen (EatnSay-style).
        </p>
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
          />
          <span className="text-sm font-bold text-slate-800">
            {maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
          </span>
        </label>
        <div className="admin-field mb-3">
          <label>Message</label>
          <textarea
            rows={2}
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
          />
        </div>
        <div className="admin-field max-w-sm mb-0">
          <label>Support contact (phone)</label>
          <input
            type="text"
            value={maintenanceContact}
            onChange={(e) => setMaintenanceContact(e.target.value)}
            placeholder="e.g. 9876543210"
          />
        </div>
      </div>

      <div className="admin-card mb-6">
        <h3 className="text-sm font-800 text-slate-500 uppercase tracking-wider mb-3">
          Force update (version control)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          If the app&apos;s current version is lower than the min version for that platform, users
          see a non-dismissible Update Required modal. Leave min version empty to disable.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Android</h4>
            <div className="admin-field">
              <label>Min version</label>
              <input
                type="text"
                value={androidMinVersion}
                onChange={(e) => setAndroidMinVersion(e.target.value)}
                placeholder="e.g. 1.0.1"
              />
            </div>
            <div className="admin-field mb-0">
              <label>Download URL</label>
              <input
                type="text"
                value={androidDownloadUrl}
                onChange={(e) => setAndroidDownloadUrl(e.target.value)}
                placeholder={DEFAULT_ANDROID_DOWNLOAD}
              />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">iOS</h4>
            <div className="admin-field">
              <label>Min version</label>
              <input
                type="text"
                value={iosMinVersion}
                onChange={(e) => setIosMinVersion(e.target.value)}
                placeholder="e.g. 1.0.1"
              />
            </div>
            <div className="admin-field mb-0">
              <label>Download URL</label>
              <input
                type="text"
                value={iosDownloadUrl}
                onChange={(e) => setIosDownloadUrl(e.target.value)}
                placeholder="App Store URL"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card mb-6">
        <h3 className="text-sm font-800 text-slate-500 uppercase tracking-wider mb-3">
          Refer &amp; Earn bonus
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Amount credited when a referred user completes a sell/buy. Default 100 if unset.
        </p>
        <div className="admin-field max-w-xs mb-0">
          <label>Referral bonus amount (₹)</label>
          <input
            type="number"
            min="0"
            step="1"
            value={referralBonusAmount}
            onChange={(e) => setReferralBonusAmount(Number(e.target.value))}
          />
        </div>
      </div>

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
