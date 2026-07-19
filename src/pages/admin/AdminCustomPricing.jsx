import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Save } from 'lucide-react';
import './admin.css';

export default function AdminCustomPricing() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService
      .getCustomPricing()
      .then((res) => setItems(res.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    for (const item of items) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [items]);

  const updateItem = (key, patch) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await adminService.saveCustomPricing({
        items: items.map((it) => ({
          key: it.key,
          priceAdjustment: Number(it.priceAdjustment) || 0,
          isActive: it.isActive !== false,
          label: it.label,
        })),
      });
      setItems(res.data.items || items);
      alert('Custom pricing saved');
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
          <h3 className="text-lg font-bold m-0">Custom Pricing</h3>
          <p className="text-sm text-slate-500 m-0">
            Device Report checklist adjustments (default ₹0). Enable a row and set ₹ add/deduct.
          </p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" disabled={saving} onClick={onSave}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        Object.entries(grouped).map(([category, rows]) => (
          <div key={category} className="admin-table-wrap mb-6">
            <h4 className="text-sm font-bold px-4 pt-4 m-0 text-slate-700">{category}</h4>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>Use</th>
                  <th>Item</th>
                  <th style={{ width: 160 }}>Price ₹</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.isActive !== false}
                        onChange={(e) => updateItem(row.key, { isActive: e.target.checked })}
                        className="w-4 h-4 accent-blue-500"
                      />
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{row.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{row.key}</div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="admin-select text-sm"
                        style={{ width: '100%' }}
                        value={row.priceAdjustment ?? 0}
                        onChange={(e) => updateItem(row.key, { priceAdjustment: e.target.value })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
