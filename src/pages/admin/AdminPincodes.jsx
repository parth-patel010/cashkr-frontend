import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { adminService } from '../../services/admin.service';

export default function AdminPincodes() {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: '', city: '', state: '', isActive: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPincodes();
  }, [search]);

  const fetchPincodes = async () => {
    try {
      const { data } = await adminService.getPincodes({ search });
      setPincodes(data.pincodes || []);
    } catch (error) {
      console.error('Failed to fetch pincodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pincode = null) => {
    if (pincode) {
      setEditingId(pincode._id);
      setForm({
        code: pincode.code,
        city: pincode.city,
        state: pincode.state,
        isActive: pincode.isActive
      });
    } else {
      setEditingId(null);
      setForm({ code: '', city: '', state: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await adminService.updatePincode(editingId, form);
      } else {
        await adminService.createPincode(form);
      }
      setShowModal(false);
      fetchPincodes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save pincode');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pincode?')) return;
    try {
      await adminService.deletePincode(id);
      fetchPincodes();
    } catch (error) {
      alert('Failed to delete pincode');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search pincode or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search pl-10"
          />
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add Pincode
        </button>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h3>Serviceable Pincodes ({pincodes.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pincode</th>
              <th>City</th>
              <th>State</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
            ) : pincodes.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No pincodes found</td></tr>
            ) : (
              pincodes.map(pin => (
                <tr key={pin._id}>
                  <td className="font-bold text-[#0F172A]">{pin.code}</td>
                  <td>{pin.city}</td>
                  <td>{pin.state}</td>
                  <td>
                    <span className={`admin-badge ${pin.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                      {pin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(pin)} className="p-2 hover:bg-white/5 rounded-lg text-blue-400 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(pin._id)} className="p-2 hover:bg-white/5 rounded-lg text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Pincode' : 'Add New Pincode'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              <form id="pincodeForm" onSubmit={handleSubmit}>
                <div className="admin-field">
                  <label>Pincode</label>
                  <input 
                    type="text" 
                    required 
                    value={form.code} 
                    onChange={e => setForm({...form, code: e.target.value})} 
                    placeholder="e.g. 400001"
                  />
                </div>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>City</label>
                    <input 
                      type="text" 
                      required 
                      value={form.city} 
                      onChange={e => setForm({...form, city: e.target.value})} 
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                  <div className="admin-field">
                    <label>State</label>
                    <input 
                      type="text" 
                      required 
                      value={form.state} 
                      onChange={e => setForm({...form, state: e.target.value})} 
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                </div>
                <div className="admin-field">
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input 
                      type="checkbox" 
                      checked={form.isActive} 
                      onChange={e => setForm({...form, isActive: e.target.checked})}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-sm text-gray-300">Is Active</span>
                  </label>
                </div>
              </form>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="pincodeForm" disabled={submitting} className="admin-btn admin-btn-primary">
                {submitting ? 'Saving...' : 'Save Pincode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
