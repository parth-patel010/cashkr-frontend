import { useEffect, useState } from 'react';
import { Bell, Send } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

export default function AdminNotifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    imageUrl: '',
    target: 'all',
    pincode: '',
    userId: '',
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminService.getNotifications({ limit: 50 });
      setList(Array.isArray(data) ? data : data.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await adminService.uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: data.imageUrl || '' }));
    } catch (e) {
      alert(e.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setMessage('');
    try {
      await adminService.sendNotification({
        title: form.title,
        body: form.body,
        imageUrl: form.imageUrl || undefined,
        target: form.target,
        pincode: form.target === 'pincode' ? form.pincode : undefined,
        userId: form.target === 'user' ? form.userId : undefined,
      });
      setMessage('Notification sent');
      setForm({ title: '', body: '', imageUrl: '', target: 'all', pincode: '', userId: '' });
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-page space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Bell size={22} className="text-blue-600" />
          Send Notification
        </h2>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Push to app users. Order status and OTP alerts are sent automatically.
        </p>
      </div>

      {message ? (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm font-bold text-blue-700">
          {message}
        </div>
      ) : null}

      <form className="admin-card space-y-4" onSubmit={onSend}>
        <div className="admin-field">
          <label>Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div className="admin-field">
          <label>Body</label>
          <textarea
            required
            rows={3}
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          />
        </div>
        <div className="admin-field">
          <label>Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => onUpload(e.target.files?.[0])} />
          {uploading ? <p className="text-xs text-slate-400">Uploading…</p> : null}
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="" className="mt-2 h-24 rounded-lg object-cover" />
          ) : null}
        </div>
        <div className="admin-field">
          <label>Target</label>
          <select
            value={form.target}
            onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}>
            <option value="all">All users with push tokens</option>
            <option value="pincode">By pincode</option>
            <option value="user">Single user ID</option>
          </select>
        </div>
        {form.target === 'pincode' ? (
          <div className="admin-field">
            <label>Pincode</label>
            <input
              value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
              required
            />
          </div>
        ) : null}
        {form.target === 'user' ? (
          <div className="admin-field">
            <label>User ID</label>
            <input
              value={form.userId}
              onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              required
            />
          </div>
        ) : null}
        <button type="submit" className="admin-btn admin-btn-primary" disabled={sending}>
          <Send size={16} />
          {sending ? 'Sending…' : 'Send notification'}
        </button>
      </form>

      <div className="admin-card">
        <h3 className="font-bold text-slate-800 mb-3">Recent sends</h3>
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-slate-400">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map((n) => (
              <div key={n._id} className="border border-slate-100 rounded-xl p-3">
                <div className="font-bold text-slate-900">{n.title}</div>
                <div className="text-sm text-slate-500">{n.body}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {n.target || 'all'} · {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
