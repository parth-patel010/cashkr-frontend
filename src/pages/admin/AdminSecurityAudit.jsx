import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

export default function AdminSecurityAudit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await adminService.getSecurityAudit();
        if (active) setData(res.data);
      } catch (e) {
        if (active) setError(e.response?.data?.message || 'Failed to load security audit');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <p className="text-slate-500 font-semibold">Loading security audit…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  const checklist = [
    { label: 'Helmet', ok: data?.helmetEnabled !== false },
    { label: 'CORS allowlist', ok: (data?.corsOrigins || []).length > 0 },
    { label: 'Global rate limit', ok: Boolean(data?.rateLimits?.global) },
    { label: 'OTP rate limit', ok: Boolean(data?.rateLimits?.otp || data?.otpLimiters) },
    { label: 'Mobile app key configured', ok: Boolean(data?.mobileAppKeyConfigured) },
    { label: 'JWT configured', ok: Boolean(data?.jwtConfigured) },
    { label: 'Socket auth required', ok: data?.socketAuthRequired !== false },
  ];

  const events = data?.recentEvents || [];

  return (
    <div className="admin-page space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Shield size={22} className="text-blue-600" />
          Security Audit
        </h2>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Live checklist of production security controls. Secrets are never shown.
        </p>
      </div>

      <div className="admin-card">
        <h3 className="font-bold mb-3">Checklist</h3>
        <div className="space-y-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center justify-between border-b border-slate-50 py-2">
              <span className="font-semibold text-slate-700">{item.label}</span>
              <span className={`admin-badge ${item.ok ? 'admin-badge-green' : 'admin-badge-red'}`}>
                {item.ok ? 'OK' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
        {(data?.corsOrigins || []).length ? (
          <div className="mt-4">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">CORS origins</div>
            <ul className="text-xs text-slate-600 space-y-1">
              {data.corsOrigins.map((o) => (
                <li key={o} className="font-mono">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data?.rateLimits ? (
          <pre className="mt-4 text-[11px] bg-slate-50 rounded-xl p-3 overflow-auto">
            {JSON.stringify(data.rateLimits, null, 2)}
          </pre>
        ) : null}
      </div>

      <div className="admin-card">
        <h3 className="font-bold mb-3">Recent security events</h3>
        {events.length === 0 ? (
          <p className="text-slate-400">No events logged yet.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>IP</th>
                  <th>Path</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id || `${ev.type}-${ev.createdAt}`}>
                    <td className="font-mono text-xs">{ev.type}</td>
                    <td className="font-mono text-xs">{ev.ip || '—'}</td>
                    <td className="text-xs">{ev.path || '—'}</td>
                    <td className="text-xs">
                      {ev.createdAt ? new Date(ev.createdAt).toLocaleString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
