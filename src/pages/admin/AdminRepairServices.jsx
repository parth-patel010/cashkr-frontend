import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Edit, Copy, CheckSquare, Layers } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

const DEFAULT_ISSUES = [
  { key: 'screen', label: 'Screen Damage', price: 2499, description: 'Cracked, dead pixels, or touch issues', isActive: true },
  { key: 'battery', label: 'Battery Replacement', price: 1499, description: 'Low health, swelling, or fast drain', isActive: true },
  { key: 'camera', label: 'Camera Repair', price: 1999, description: 'Blurry lens, focus fail, or dead camera', isActive: true },
  { key: 'mic', label: 'Mic / Speaker', price: 999, description: 'No sound, muffled audio, or mic fail', isActive: true },
  { key: 'charging', label: 'Charging Port', price: 1299, description: 'Loose port or not charging', isActive: true },
  { key: 'soft_damage', label: 'Software Issues', price: 799, description: 'Boot loop, update fail, lag', isActive: true },
  { key: 'back_panel', label: 'Back Panel', price: 1799, description: 'Cracked or scratched rear glass', isActive: true },
  { key: 'other', label: 'Other', price: 499, description: 'Describe the issue while booking', isActive: true },
];

const EMPTY_FORM = {
  category: 'mobile',
  brand: '',
  deviceId: '',
  modelName: '',
  deviceSlug: '',
  title: '',
  description: 'Doorstep repair by trained technicians with quality check.',
  imageUrl: '',
  turnaroundHours: 24,
  warrantyDays: 90,
  isActive: true,
  issues: DEFAULT_ISSUES.map((i) => ({ ...i })),
};

const EMPTY_TEMPLATE = {
  name: '',
  category: 'mobile',
  description: '',
  issues: DEFAULT_ISSUES.map((i) => ({ ...i })),
};

function IssuePriceEditor({ issues, onChange, onAdd, onRemove }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="admin-section-title mb-0">Issue prices (model-wise)</h4>
        <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={onAdd}>
          + Add issue
        </button>
      </div>
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {issues.map((issue, index) => (
          <div key={`${issue.key}-${index}`} className="grid grid-cols-12 gap-2 items-center bg-slate-50 rounded-xl p-2">
            <input
              className="admin-input col-span-4"
              value={issue.label}
              placeholder="Issue name"
              onChange={(e) => onChange(index, 'label', e.target.value)}
            />
            <input
              className="admin-input col-span-3"
              type="number"
              min="0"
              value={issue.price}
              placeholder="Price"
              onChange={(e) => onChange(index, 'price', Number(e.target.value))}
            />
            <input
              className="admin-input col-span-4"
              value={issue.description || ''}
              placeholder="Short description"
              onChange={(e) => onChange(index, 'description', e.target.value)}
            />
            <button type="button" className="admin-btn admin-btn-danger col-span-1" onClick={() => onRemove(index)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminRepairServices() {
  const [tab, setTab] = useState('models'); // models | templates
  const [services, setServices] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [deviceOptions, setDeviceOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Template editor
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateForm, setTemplateForm] = useState(EMPTY_TEMPLATE);

  // Apply template
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyTemplate, setApplyTemplate] = useState(null);
  const [applyBrand, setApplyBrand] = useState('');
  const [applyCategory, setApplyCategory] = useState('mobile');
  const [applyDevices, setApplyDevices] = useState([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [applyBusy, setApplyBusy] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getRepairServices({ search, modelOnly: 'true' });
      setServices(data.services || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await adminService.getRepairTemplates({});
      setTemplates(data.templates || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadBrands = (category) => {
    adminService
      .getBrands({ category, active: 'true' })
      .then((res) => setBrandOptions(res.data.brands || []))
      .catch(() => setBrandOptions([]));
  };

  const loadDevices = (category, brand) => {
    if (!brand) {
      setDeviceOptions([]);
      return;
    }
    adminService
      .getDevices({ category, brand, limit: 500, page: 1 })
      .then((res) => setDeviceOptions(res.data.devices || []))
      .catch(() => setDeviceOptions([]));
  };

  useEffect(() => {
    fetchServices();
    fetchTemplates();
  }, [search]);

  useEffect(() => {
    if (showModal) {
      loadBrands(form.category);
      if (form.brand) loadDevices(form.category, form.brand);
    }
  }, [showModal, form.category, form.brand]);

  useEffect(() => {
    if (applyOpen) {
      loadBrands(applyCategory);
      if (applyBrand) {
        adminService
          .getDevices({ category: applyCategory, brand: applyBrand, limit: 500, page: 1 })
          .then((res) => setApplyDevices(res.data.devices || []))
          .catch(() => setApplyDevices([]));
      } else {
        setApplyDevices([]);
      }
      setSelectedDeviceIds([]);
    }
  }, [applyOpen, applyBrand, applyCategory]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, issues: DEFAULT_ISSUES.map((i) => ({ ...i })) });
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditingId(service._id);
    setForm({
      category: service.category || 'mobile',
      brand: service.brand || '',
      deviceId: service.deviceId || '',
      modelName: service.modelName || '',
      deviceSlug: service.deviceSlug || '',
      title: service.title || '',
      description: service.description || '',
      imageUrl: service.imageUrl || '',
      turnaroundHours: service.turnaroundHours ?? 24,
      warrantyDays: service.warrantyDays ?? 90,
      isActive: service.isActive !== false,
      issues: (service.issues || []).map((i) => ({
        key: i.key,
        label: i.label,
        price: i.price,
        description: i.description || '',
        isActive: i.isActive !== false,
      })),
    });
    setShowModal(true);
  };

  const updateIssue = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      issues: prev.issues.map((issue, i) => (i === index ? { ...issue, [field]: value } : issue)),
    }));
  };

  const updateTemplateIssue = (index, field, value) => {
    setTemplateForm((prev) => ({
      ...prev,
      issues: prev.issues.map((issue, i) => (i === index ? { ...issue, [field]: value } : issue)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const issues = form.issues.filter((i) => i.label && Number(i.price) >= 0);
    if (!issues.length) {
      alert('Add at least one repair issue with price');
      return;
    }
    if (!form.deviceId && !form.modelName) {
      alert('Select a phone model');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, issues };
      if (editingId) await adminService.updateRepairService(editingId, payload);
      else await adminService.createRepairService(payload);
      setShowModal(false);
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save repair pricing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete repair pricing for this model?')) return;
    try {
      await adminService.deleteRepairService(id);
      fetchServices();
    } catch {
      alert('Delete failed');
    }
  };

  const saveAsTemplate = async () => {
    const name = window.prompt('Template name (e.g. Mid-range Android common prices)');
    if (!name) return;
    try {
      await adminService.createRepairTemplate({
        name,
        category: form.category,
        issues: form.issues,
        description: `Saved from ${form.brand} ${form.modelName || 'model'}`,
      });
      alert('Common price template saved. Use Templates tab to apply to many phones.');
      fetchTemplates();
      setTab('templates');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save template');
    }
  };

  const openCreateTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm({ ...EMPTY_TEMPLATE, issues: DEFAULT_ISSUES.map((i) => ({ ...i })) });
    setShowTemplateModal(true);
  };

  const openEditTemplate = (tpl) => {
    setEditingTemplateId(tpl._id);
    setTemplateForm({
      name: tpl.name,
      category: tpl.category || 'mobile',
      description: tpl.description || '',
      issues: (tpl.issues || []).map((i) => ({ ...i, isActive: i.isActive !== false })),
    });
    setShowTemplateModal(true);
  };

  const submitTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.name.trim()) {
      alert('Template name required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingTemplateId) await adminService.updateRepairTemplate(editingTemplateId, templateForm);
      else await adminService.createRepairTemplate(templateForm);
      setShowTemplateModal(false);
      fetchTemplates();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm('Delete this common price template?')) return;
    try {
      await adminService.deleteRepairTemplate(id);
      fetchTemplates();
    } catch {
      alert('Delete failed');
    }
  };

  const openApply = (tpl) => {
    setApplyTemplate(tpl);
    setApplyCategory(tpl.category || 'mobile');
    setApplyBrand('');
    setApplyOpen(true);
  };

  const toggleDevice = (id) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAllDevices = () => {
    setSelectedDeviceIds(applyDevices.map((d) => d._id));
  };

  const runApply = async () => {
    if (!applyTemplate) return;
    if (!selectedDeviceIds.length && !applyBrand) {
      alert('Select models, or pick a brand and Select all');
      return;
    }
    setApplyBusy(true);
    try {
      const payload = selectedDeviceIds.length
        ? { deviceIds: selectedDeviceIds }
        : { brand: applyBrand, category: applyCategory };
      const { data } = await adminService.applyRepairTemplate(applyTemplate._id, payload);
      alert(data.message || `Applied to ${data.total} models`);
      setApplyOpen(false);
      fetchServices();
      setTab('models');
    } catch (error) {
      alert(error.response?.data?.message || 'Apply failed');
    } finally {
      setApplyBusy(false);
    }
  };

  const pricedDeviceIds = useMemo(
    () => new Set(services.map((s) => String(s.deviceId || ''))),
    [services],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            className={`admin-btn ${tab === 'models' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            onClick={() => setTab('models')}
          >
            Model prices
          </button>
          <button
            type="button"
            className={`admin-btn ${tab === 'templates' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            onClick={() => setTab('templates')}
          >
            <Layers size={14} />
            Common price templates
          </button>
        </div>
        {tab === 'models' ? (
          <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Add model pricing
          </button>
        ) : (
          <button type="button" className="admin-btn admin-btn-primary" onClick={openCreateTemplate}>
            <Plus size={16} />
            New common price
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Set repair prices <strong>per phone model</strong>. Create a common price once, then apply it to many models in one click.
      </p>

      {tab === 'models' ? (
        <>
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              className="admin-search pl-10 w-full"
              placeholder="Search model / brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-table-wrapper">
            <div className="admin-table-header">
              <h3>Model-wise repair catalog</h3>
              <span className="text-sm text-slate-400">{services.length} models</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Brand</th>
                  <th>Issue prices</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 28 }}>Loading...</td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 28 }}>
                      No model pricing yet. Create a common template and apply it to many phones, or add one model.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service._id}>
                      <td>
                        <div className="font-semibold">{service.modelName || service.title}</div>
                        <div className="text-xs text-slate-400">{service.deviceSlug || service.slug}</div>
                      </td>
                      <td>{service.brand}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {(service.issues || []).slice(0, 4).map((issue) => (
                            <span key={issue.key} className="admin-badge admin-badge-blue">
                              {issue.label}: ₹{issue.price}
                            </span>
                          ))}
                          {(service.issues || []).length > 4 ? (
                            <span className="admin-badge">+{service.issues.length - 4}</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-badge ${service.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => openEdit(service)}>
                            <Edit size={14} />
                          </button>
                          <button type="button" className="admin-btn admin-btn-danger" onClick={() => handleDelete(service._id)}>
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
        </>
      ) : (
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3>Common price templates</h3>
            <span className="text-sm text-slate-400">{templates.length} templates</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Prices</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 28 }}>
                    Create a common price set (e.g. “Budget Android”), then apply it to 50 phones at once.
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl._id}>
                    <td>
                      <div className="font-semibold">{tpl.name}</div>
                      <div className="text-xs text-slate-400">{tpl.description}</div>
                    </td>
                    <td className="capitalize">{tpl.category}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(tpl.issues || []).slice(0, 4).map((issue) => (
                          <span key={issue.key} className="admin-badge admin-badge-blue">
                            {issue.label}: ₹{issue.price}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        <button type="button" className="admin-btn admin-btn-primary text-xs" onClick={() => openApply(tpl)}>
                          <CheckSquare size={14} /> Apply to models
                        </button>
                        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => openEditTemplate(tpl)}>
                          <Edit size={14} />
                        </button>
                        <button type="button" className="admin-btn admin-btn-danger" onClick={() => deleteTemplate(tpl._id)}>
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
      )}

      {/* Model pricing modal */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit model repair prices' : 'Add model repair prices'}</h3>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-body space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Category</label>
                  <select
                    className="admin-input"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value, brand: '', deviceId: '', modelName: '' }))}
                  >
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Brand</label>
                  <select
                    className="admin-input"
                    value={form.brand}
                    onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value, deviceId: '', modelName: '' }))}
                    required
                  >
                    <option value="">Select brand</option>
                    {brandOptions.map((b) => (
                      <option key={b._id || b.name || b.brand} value={b.name || b.brand}>
                        {b.name || b.brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="admin-label">Phone model</label>
                <select
                  className="admin-input"
                  value={form.deviceId}
                  onChange={(e) => {
                    const device = deviceOptions.find((d) => d._id === e.target.value);
                    setForm((p) => ({
                      ...p,
                      deviceId: e.target.value,
                      modelName: device?.modelName || '',
                      deviceSlug: device?.slug || '',
                      imageUrl: device?.imageUrl || p.imageUrl,
                      title: device ? `${device.brand} ${device.modelName} Repair` : p.title,
                    }));
                  }}
                  required={!editingId}
                >
                  <option value="">{form.brand ? 'Select model' : 'Select brand first'}</option>
                  {deviceOptions.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.modelName}{pricedDeviceIds.has(String(d._id)) && form.deviceId !== d._id ? ' (has pricing)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <IssuePriceEditor
                issues={form.issues}
                onChange={updateIssue}
                onAdd={() =>
                  setForm((prev) => ({
                    ...prev,
                    issues: [...prev.issues, { key: `issue_${prev.issues.length + 1}`, label: '', price: 0, description: '', isActive: true }],
                  }))
                }
                onRemove={(index) => setForm((prev) => ({ ...prev, issues: prev.issues.filter((_, i) => i !== index) }))}
              />

              <div className="flex flex-wrap gap-2 justify-between pt-2">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={saveAsTemplate}>
                  <Copy size={14} /> Save prices as common template
                </button>
                <div className="flex gap-2">
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
                    {submitting ? 'Saving…' : 'Save model prices'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template modal */}
      {showTemplateModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowTemplateModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingTemplateId ? 'Edit common price' : 'New common price template'}</h3>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowTemplateModal(false)}>×</button>
            </div>
            <form onSubmit={submitTemplate} className="admin-modal-body space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Template name</label>
                  <input
                    className="admin-input"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Mid-range Android"
                    required
                  />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <select
                    className="admin-input"
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="admin-label">Note (optional)</label>
                <input
                  className="admin-input"
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="When to use this price set"
                />
              </div>
              <IssuePriceEditor
                issues={templateForm.issues}
                onChange={updateTemplateIssue}
                onAdd={() =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    issues: [...prev.issues, { key: `issue_${prev.issues.length + 1}`, label: '', price: 0, description: '', isActive: true }],
                  }))
                }
                onRemove={(index) =>
                  setTemplateForm((prev) => ({ ...prev, issues: prev.issues.filter((_, i) => i !== index) }))
                }
              />
              <div className="flex justify-end gap-2">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowTemplateModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply template modal */}
      {applyOpen && applyTemplate && (
        <div className="admin-modal-backdrop" onClick={() => setApplyOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Apply “{applyTemplate.name}” to models</h3>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setApplyOpen(false)}>×</button>
            </div>
            <div className="admin-modal-body space-y-4">
              <p className="text-sm text-slate-500">
                Pick a brand, select models (or Select all), then apply. Existing model prices are overwritten with this template.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Category</label>
                  <select
                    className="admin-input"
                    value={applyCategory}
                    onChange={(e) => {
                      setApplyCategory(e.target.value);
                      setApplyBrand('');
                    }}
                  >
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">Brand</label>
                  <select
                    className="admin-input"
                    value={applyBrand}
                    onChange={(e) => setApplyBrand(e.target.value)}
                  >
                    <option value="">Select brand</option>
                    {brandOptions.map((b) => (
                      <option key={b._id || b.name || b.brand} value={b.name || b.brand}>
                        {b.name || b.brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">
                  {selectedDeviceIds.length} selected / {applyDevices.length} models
                </span>
                <button type="button" className="admin-btn admin-btn-ghost text-xs" onClick={selectAllDevices} disabled={!applyDevices.length}>
                  Select all
                </button>
              </div>

              <div className="max-h-[280px] overflow-y-auto border border-slate-100 rounded-xl divide-y">
                {applyDevices.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">Select a brand to load models</div>
                ) : (
                  applyDevices.map((d) => (
                    <label key={d._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDeviceIds.includes(d._id)}
                        onChange={() => toggleDevice(d._id)}
                      />
                      <span className="text-sm font-medium text-slate-800">{d.modelName}</span>
                      {pricedDeviceIds.has(String(d._id)) ? (
                        <span className="text-[10px] font-bold text-amber-600 ml-auto">already priced</span>
                      ) : null}
                    </label>
                  ))
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setApplyOpen(false)}>Cancel</button>
                <button type="button" className="admin-btn admin-btn-primary" disabled={applyBusy || !selectedDeviceIds.length} onClick={runApply}>
                  {applyBusy ? 'Applying…' : `Apply to ${selectedDeviceIds.length || 0} models`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
