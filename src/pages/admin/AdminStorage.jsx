import { useCallback, useEffect, useState } from 'react';
import { Download, Trash2, Upload, Search, FolderOpen, Building2, Users } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

function emptyForm(category = 'vendor') {
  return {
    category,
    title: '',
    description: '',
    vendorId: '',
    file: null,
  };
}

function UploadModal({ open, category, vendors, onClose, onUploaded }) {
  const [form, setForm] = useState(emptyForm(category));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(emptyForm(category));
      setError('');
    }
  }, [open, category]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      setError('Choose a file to upload');
      return;
    }
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    if (form.category === 'vendor' && !form.vendorId) {
      setError('Select a vendor');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await adminService.uploadStorageDocument({
        file: form.file,
        category: form.category,
        title: form.title.trim(),
        description: form.description.trim(),
        vendorId: form.category === 'vendor' ? form.vendorId : undefined,
      });
      onUploaded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Upload {category === 'vendor' ? 'vendor' : 'company'} document</h3>
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body space-y-4">
            <div className="admin-field">
              <label>Title</label>
              <input
                className="admin-select w-full"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. GST certificate"
                required
              />
            </div>

            {category === 'vendor' && (
              <div className="admin-field">
                <label>Vendor</label>
                <select
                  className="admin-select w-full"
                  value={form.vendorId}
                  onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
                  required
                >
                  <option value="">Select vendor…</option>
                  {vendors.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name}
                      {v.vendorCode ? ` (#${v.vendorCode})` : ''}
                      {v.phone ? ` · ${v.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="admin-field">
              <label>Description (optional)</label>
              <textarea
                className="admin-select w-full"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Notes about this file"
              />
            </div>

            <div className="admin-field">
              <label>File</label>
              <input
                type="file"
                className="admin-select w-full"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif,.zip"
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
                required
              />
              <p className="text-xs text-slate-400 mt-1">PDF, Office, images, CSV, TXT, or ZIP · max 25MB</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStorage() {
  const [category, setCategory] = useState('vendor');
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminService.getVendors({ limit: 500 });
        setVendors(Array.isArray(data) ? data : (data.vendors || data.items || []));
      } catch {
        setVendors([]);
      }
    })();
  }, []);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { category, limit: 100 };
      if (search.trim()) params.search = search.trim();
      if (category === 'vendor' && vendorFilter) params.vendorId = vendorFilter;
      const { data } = await adminService.getStorageDocuments(params);
      setItems(data.items || []);
    } catch {
      setError('Failed to load documents');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, vendorFilter]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleDownload = async (doc) => {
    try {
      const res = await adminService.downloadStorageDocument(doc._id);
      const blob = new Blob([res.data], { type: doc.mimeType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Download failed');
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete “${doc.title}”? This cannot be undone.`)) return;
    try {
      await adminService.deleteStorageDocument(doc._id);
      fetchDocs();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FolderOpen size={18} className="text-blue-500" />
            Document Storage
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Upload vendor and company documents, then download them anytime.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setUploadOpen(true)}
        >
          <Upload size={16} />
          Upload document
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`admin-btn ${category === 'vendor' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
          onClick={() => {
            setCategory('vendor');
            setVendorFilter('');
          }}
        >
          <Users size={14} />
          Vendor documents
        </button>
        <button
          type="button"
          className={`admin-btn ${category === 'company' ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
          onClick={() => {
            setCategory('company');
            setVendorFilter('');
          }}
        >
          <Building2 size={14} />
          Company documents
        </button>
      </div>

      <div className="admin-search-bar flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="admin-select w-full pl-9"
            placeholder="Search by title or filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {category === 'vendor' && (
          <select
            className="admin-select"
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
          >
            <option value="">All vendors</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">{error}</div>
      )}

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No {category} documents yet. Upload one to get started.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                {category === 'vendor' && <th>Vendor</th>}
                <th>File</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {items.map((doc) => (
                <tr key={doc._id}>
                  <td>
                    <div className="font-semibold text-slate-800">{doc.title}</div>
                    {doc.description ? (
                      <div className="text-xs text-slate-400 mt-0.5">{doc.description}</div>
                    ) : null}
                  </td>
                  {category === 'vendor' && (
                    <td>
                      {doc.vendor?.name || '—'}
                      {doc.vendor?.vendorCode ? (
                        <span className="text-xs text-slate-400 block">#{doc.vendor.vendorCode}</span>
                      ) : null}
                    </td>
                  )}
                  <td className="text-sm text-slate-600">{doc.originalName}</td>
                  <td className="text-sm text-slate-500">{doc.sizeLabel}</td>
                  <td className="text-sm text-slate-500">
                    {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-blue-600"
                        title="Download"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-red-500"
                        title="Delete"
                        onClick={() => handleDelete(doc)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UploadModal
        open={uploadOpen}
        category={category}
        vendors={vendors}
        onClose={() => setUploadOpen(false)}
        onUploaded={fetchDocs}
      />
    </div>
  );
}
