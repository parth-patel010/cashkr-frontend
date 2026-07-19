import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Plus, Search, Edit } from 'lucide-react';
import './admin.css';

const emptyForm = {
  name: '',
  phone: '',
  city: '',
  servicePincodes: [],
  managerPhone: '',
  photoUrl: '',
  orderCreditCost: 0,
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
  const [pinInput, setPinInput] = useState('');
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
    setPinInput('');
    setAdjust({ walletDelta: 0, creditsDelta: 0, note: '' });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditingId(v._id);
    setForm({
      name: v.name || '',
      phone: v.phone || '',
      city: v.city || '',
      servicePincodes: [...(v.servicePincodes || [])],
      managerPhone: v.managerPhone || '',
      photoUrl: v.photoUrl || '',
      orderCreditCost: v.orderCreditCost || 0,
      isActive: v.isActive !== false,
      walletBalance: v.walletBalance || 0,
      credits: v.credits || 0,
      virtualAccount: {
        number: v.virtualAccount?.number || '',
        ifsc: v.virtualAccount?.ifsc || '',
        bankName: v.virtualAccount?.bankName || 'ICICI',
        type: v.virtualAccount?.type || 'Commission Account',
      },
    });
    setPinInput('');
    setAdjust({ walletDelta: 0, creditsDelta: 0, note: '' });
    setShowModal(true);
  };

  const addPincode = () => {
    const code = String(pinInput).replace(/\D/g, '').slice(0, 6);
    if (code.length !== 6) return;
    setForm((p) => {
      if (p.servicePincodes.includes(code)) return p;
      return { ...p, servicePincodes: [...p.servicePincodes, code] };
    });
    setPinInput('');
  };

  const removePincode = (code) => {
    setForm((p) => ({
      ...p,
      servicePincodes: p.servicePincodes.filter((x) => x !== code),
    }));
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
                  <td>
                    {(v.servicePincodes || []).length ? (
                      <div className="flex flex-wrap gap-1">
                        {(v.servicePincodes || []).slice(0, 4).map((pin) => (
                          <span key={pin} className="admin-badge admin-badge-blue">
                            {pin}
                          </span>
                        ))}
                        {(v.servicePincodes || []).length > 4 ? (
                          <span className="text-xs text-slate-500">
                            +{(v.servicePincodes || []).length - 4}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
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
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div className="admin-modal-body">
              <form id="vendorForm" onSubmit={onSave}>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Partner full name"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Phone</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="10-digit mobile"
                    />
                  </div>
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>City</label>
                    <input
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="e.g. Ahmedabad"
                    />
                  </div>
                  <div className="admin-field">
                    <label>Manager phone</label>
                    <input
                      value={form.managerPhone}
                      onChange={(e) => setForm((p) => ({ ...p, managerPhone: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="admin-field">
                  <label>Photo URL</label>
                  <input
                    value={form.photoUrl}
                    onChange={(e) => setForm((p) => ({ ...p, photoUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="admin-field">
                  <label>Service pincodes (multiple)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addPincode();
                        }
                      }}
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                    />
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={addPincode}>
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.servicePincodes.map((pin) => (
                      <span
                        key={pin}
                        className="admin-badge admin-badge-blue"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {pin}
                        <button
                          type="button"
                          onClick={() => removePincode(pin)}
                          style={{
                            border: 0,
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontSize: 14,
                            lineHeight: 1,
                            padding: 0,
                          }}
                          aria-label={`Remove ${pin}`}>
                          ×
                        </button>
                      </span>
                    ))}
                    {!form.servicePincodes.length ? (
                      <span className="text-xs text-slate-500">No pincodes assigned yet</span>
                    ) : null}
                  </div>
                </div>

                <div className="admin-field">
                  <label>Order credit cost (deducted on accept)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.orderCreditCost}
                    onChange={(e) => setForm((p) => ({ ...p, orderCreditCost: e.target.value }))}
                    placeholder="e.g. 1"
                  />
                </div>

                <div className="admin-field">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span>Active (can login to Partner app)</span>
                  </label>
                </div>

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>VA Number</label>
                    <input
                      value={form.virtualAccount?.number || ''}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          virtualAccount: { ...p.virtualAccount, number: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>IFSC</label>
                    <input
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

                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Bank name</label>
                    <input
                      value={form.virtualAccount?.bankName || ''}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          virtualAccount: { ...p.virtualAccount, bankName: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="admin-field">
                    <label>Account type</label>
                    <input
                      value={form.virtualAccount?.type || ''}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          virtualAccount: { ...p.virtualAccount, type: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                {editingId ? (
                  <div className="admin-field" style={{ marginTop: 8 }}>
                    <label>
                      Adjust wallet / credits (current ₹{form.walletBalance} / {form.credits} credits)
                    </label>
                    <div className="admin-field-row">
                      <div className="admin-field">
                        <input
                          type="number"
                          placeholder="Wallet Δ"
                          value={adjust.walletDelta}
                          onChange={(e) => setAdjust((p) => ({ ...p, walletDelta: e.target.value }))}
                        />
                      </div>
                      <div className="admin-field">
                        <input
                          type="number"
                          placeholder="Credits Δ"
                          value={adjust.creditsDelta}
                          onChange={(e) => setAdjust((p) => ({ ...p, creditsDelta: e.target.value }))}
                        />
                      </div>
                    </div>
                    <input
                      placeholder="Note"
                      value={adjust.note}
                      onChange={(e) => setAdjust((p) => ({ ...p, note: e.target.value }))}
                    />
                  </div>
                ) : null}
              </form>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" form="vendorForm" disabled={saving} className="admin-btn admin-btn-primary">
                {saving ? 'Saving...' : 'Save Vendor'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
