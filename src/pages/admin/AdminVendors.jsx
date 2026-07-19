import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Plus, Search, Edit, X } from 'lucide-react';
import './admin.css';

const emptyForm = {
  name: '',
  phone: '',
  city: '',
  servicePincodes: '',
  managerPhone: '',
  photoUrl: '',
  isActive: true,
  walletBalance: 0,
  credits: 0,
  virtualAccount: { number: '', ifsc: '', bankName: 'ICICI', type: 'Commission Account' },
};

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [adjust, setAdjust] = useState({ walletDelta: 0, creditsDelta: 0, note: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService
      .getVendors({ search: search || undefined })
      .then((res) => setVendors(res.data.vendors || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setAdjust({ walletDelta: 0, creditsDelta: 0, note: '' });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditingId(v._id);
    setForm({
      name: v.name || '',
      phone: v.phone || '',
      city: v.city || '',
      servicePincodes: (v.servicePincodes || []).join(', '),
      managerPhone: v.managerPhone || '',
      photoUrl: v.photoUrl || '',
      isActive: v.isActive !== false,
      walletBalance: v.walletBalance || 0,
      credits: v.credits || 0,
      virtualAccount: v.virtualAccount || emptyForm.virtualAccount,
    });
    setAdjust({ walletDelta: 0, creditsDelta: 0, note: '' });
    setShowModal(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        servicePincodes: form.servicePincodes,
      };
      if (editingId) {
        await adminService.updateVendor(editingId, payload);
        if (Number(adjust.walletDelta) || Number(adjust.creditsDelta)) {
          await adminService.adjustVendorWallet(editingId, adjust);
        }
      } else {
        await adminService.createVendor(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold m-0">Vendors</h3>
          <p className="text-sm text-slate-500 m-0">Field partners who claim sell pickup orders</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      <div className="admin-search-bar mb-4">
        <Search size={16} />
        <input
          placeholder="Search name, phone, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Pincodes</th>
                <th>Wallet</th>
                <th>Credits</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td>{v.vendorCode}</td>
                  <td>{v.name}</td>
                  <td>{v.phone}</td>
                  <td>{v.city || '—'}</td>
                  <td>{(v.servicePincodes || []).join(', ') || '—'}</td>
                  <td>₹{v.walletBalance || 0}</td>
                  <td>{v.credits || 0}</td>
                  <td>
                    <span className={`admin-badge ${v.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="admin-icon-btn" onClick={() => openEdit(v)}>
                      <Edit size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {!vendors.length ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center' }}>
                    No vendors yet. Add one to enable Partner app login.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {showModal ? (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 560 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="m-0">{editingId ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button type="button" className="admin-icon-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={onSave} className="space-y-3">
              <label className="block text-xs font-bold">Name</label>
              <input
                className="admin-input w-full"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <label className="block text-xs font-bold">Phone</label>
              <input
                className="admin-input w-full"
                required
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <label className="block text-xs font-bold">City</label>
              <input
                className="admin-input w-full"
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              />
              <label className="block text-xs font-bold">Service pincodes (comma separated)</label>
              <input
                className="admin-input w-full"
                value={form.servicePincodes}
                onChange={(e) => setForm((p) => ({ ...p, servicePincodes: e.target.value }))}
              />
              <label className="block text-xs font-bold">Manager phone</label>
              <input
                className="admin-input w-full"
                value={form.managerPhone}
                onChange={(e) => setForm((p) => ({ ...p, managerPhone: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                Active (can login)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold">VA Number</label>
                  <input
                    className="admin-input w-full"
                    value={form.virtualAccount?.number || ''}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        virtualAccount: { ...p.virtualAccount, number: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold">IFSC</label>
                  <input
                    className="admin-input w-full"
                    value={form.virtualAccount?.ifsc || ''}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        virtualAccount: { ...p.virtualAccount, ifsc: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              {editingId ? (
                <div className="border rounded-xl p-3 bg-slate-50">
                  <p className="text-xs font-bold mb-2">
                    Adjust wallet/credits (current ₹{form.walletBalance} / {form.credits} credits)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="admin-input"
                      type="number"
                      placeholder="Wallet Δ"
                      value={adjust.walletDelta}
                      onChange={(e) => setAdjust((p) => ({ ...p, walletDelta: e.target.value }))}
                    />
                    <input
                      className="admin-input"
                      type="number"
                      placeholder="Credits Δ"
                      value={adjust.creditsDelta}
                      onChange={(e) => setAdjust((p) => ({ ...p, creditsDelta: e.target.value }))}
                    />
                  </div>
                  <input
                    className="admin-input w-full mt-2"
                    placeholder="Note"
                    value={adjust.note}
                    onChange={(e) => setAdjust((p) => ({ ...p, note: e.target.value }))}
                  />
                </div>
              ) : null}

              <button type="submit" className="admin-btn admin-btn-primary w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save Vendor'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
