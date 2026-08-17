import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  IndianRupee,
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Coins,
  Search,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  User,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import './admin.css';

const STATUS_LABELS = {
  placed: 'Placed',
  scheduled: 'Scheduled',
  assigned: 'Assigned',
  picked: 'Picked',
  verified: 'Verified',
  payment_initiated: 'Payment initiated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

function formatPickupDate(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime()) && String(value).match(/^\d{4}-/)) {
    return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return String(value);
}

function statusBadgeClass(status) {
  if (status === 'completed') return 'admin-badge admin-badge-green';
  if (status === 'cancelled' || status === 'failed') return 'admin-badge admin-badge-red';
  if (status === 'placed' || status === 'assigned') return 'admin-badge admin-badge-blue';
  if (status === 'picked' || status === 'verified' || status === 'payment_initiated') {
    return 'admin-badge admin-badge-yellow';
  }
  return 'admin-badge admin-badge-gray';
}

export default function AdminVendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState(Object.keys(STATUS_LABELS));
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError('');
    adminService
      .getVendor(id, {
        status: status || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: 20,
      })
      .then((res) => {
        setVendor(res.data.vendor);
        setStats(res.data.stats);
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        if (res.data.statuses?.length) setStatuses(res.data.statuses);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load vendor');
      })
      .finally(() => setLoading(false));
  }, [id, status, debouncedSearch, page]);

  if (loading && !vendor) {
    return (
      <div className="space-y-6">
        <div className="admin-stat-card admin-skeleton h-[88px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="admin-stat-card admin-skeleton h-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !vendor) {
    return (
      <div className="space-y-4">
        <button type="button" className="admin-btn admin-btn-ghost" onClick={() => navigate('/admin/vendors')}>
          <ArrowLeft size={16} /> Back to vendors
        </button>
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">{error}</div>
      </div>
    );
  }

  const statusCounts = stats?.statusCounts || {};
  const cards = [
    {
      label: 'Completed revenue',
      value: formatMoney(stats?.totalRevenue),
      icon: <IndianRupee size={20} className="text-rose-400" />,
      bg: 'rgba(244, 63, 94, 0.1)',
      accent: '#fb7185',
    },
    {
      label: 'Assigned order value',
      value: formatMoney(stats?.assignedValue),
      icon: <ClipboardList size={20} className="text-blue-400" />,
      bg: 'rgba(59, 130, 246, 0.1)',
      accent: '#60a5fa',
    },
    {
      label: 'Completed orders',
      value: stats?.completedCount || 0,
      icon: <CheckCircle2 size={20} className="text-emerald-400" />,
      bg: 'rgba(16, 185, 129, 0.1)',
      accent: '#34d399',
    },
    {
      label: 'In progress',
      value: stats?.inProgressCount || 0,
      icon: <Clock size={20} className="text-amber-400" />,
      bg: 'rgba(245, 158, 11, 0.1)',
      accent: '#fbbf24',
    },
    {
      label: 'Cancelled / failed',
      value: (stats?.cancelledCount || 0) + (stats?.failedCount || 0),
      icon: <XCircle size={20} className="text-red-400" />,
      bg: 'rgba(239, 68, 68, 0.1)',
      accent: '#f87171',
    },
    {
      label: 'Wallet',
      value: formatMoney(stats?.walletBalance),
      icon: <Wallet size={20} className="text-violet-400" />,
      bg: 'rgba(139, 92, 246, 0.1)',
      accent: '#a78bfa',
    },
    {
      label: 'Credits',
      value: stats?.credits || 0,
      icon: <Coins size={20} className="text-sky-400" />,
      bg: 'rgba(14, 165, 233, 0.1)',
      accent: '#38bdf8',
    },
    {
      label: 'Incentive earned',
      value: `${stats?.completedIncentive || 0} credits`,
      icon: <Coins size={20} className="text-lime-500" />,
      bg: 'rgba(132, 204, 22, 0.12)',
      accent: '#84cc16',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button type="button" className="admin-btn admin-btn-ghost mb-3" onClick={() => navigate('/admin/vendors')}>
            <ArrowLeft size={16} /> Back to vendors
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-black m-0">{vendor?.name}</h3>
            <span className={`admin-badge ${vendor?.isActive ? 'admin-badge-green' : 'admin-badge-red'}`}>
              {vendor?.isActive ? 'Active' : 'Inactive'}
            </span>
            {vendor?.vendorCode ? <span className="admin-badge admin-badge-gray">#{vendor.vendorCode}</span> : null}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
            {vendor?.phone ? (
              <span className="inline-flex items-center gap-1">
                <Phone size={14} /> {vendor.phone}
              </span>
            ) : null}
            {vendor?.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {vendor.city}
              </span>
            ) : null}
            {vendor?.managerPhone ? (
              <span className="inline-flex items-center gap-1">
                <User size={14} /> Manager {vendor.managerPhone}
              </span>
            ) : null}
            {(vendor?.servicePincodes || []).length ? (
              <span className="inline-flex items-center gap-1">
                {(vendor.servicePincodes || []).length} pincodes
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card" style={{ '--card-accent': card.accent }}>
            <div className="admin-stat-icon" style={{ backgroundColor: card.bg }}>
              {card.icon}
            </div>
            <div className="admin-stat-value">{card.value}</div>
            <div className="admin-stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Orders by status</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`admin-btn ${!status ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            onClick={() => {
              setStatus('');
              setPage(1);
            }}
          >
            All ({stats?.totalOrders || 0})
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              className={`admin-btn ${status === s ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {STATUS_LABELS[s] || s} ({statusCounts[s] || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="admin-search-bar">
        <Search size={16} />
        <input
          placeholder="Search order ID, device, customer, city, pincode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Device</th>
              <th>Customer</th>
              <th>Pickup slot</th>
              <th>Pickup</th>
              <th>Value</th>
              <th>Status</th>
              <th>Assigned</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>
                  <Link to="/admin/orders" className="font-mono text-xs text-blue-600 font-semibold">
                    {order.orderId}
                  </Link>
                </td>
                <td>
                  <div className="font-semibold text-slate-800">
                    {order.device?.brand} {order.device?.modelName}
                  </div>
                  <div className="text-[10px] text-slate-400">{order.device?.storage || order.device?.category}</div>
                </td>
                <td>
                  <div className="text-sm font-semibold">{order.pickup?.name || order.userId?.name || '—'}</div>
                  <div className="text-xs text-slate-500">{order.pickup?.phone || order.userId?.phone || ''}</div>
                </td>
                <td>
                  <div className="font-semibold text-slate-800">
                    {formatPickupDate(order.pickup?.date) || '—'}
                  </div>
                  <div className="text-xs text-slate-500">{order.pickup?.timeSlot || 'No slot'}</div>
                </td>
                <td className="text-xs">
                  {order.pickup?.city || '—'}
                  {order.pickup?.pincode ? ` · ${order.pickup.pincode}` : ''}
                </td>
                <td className="font-bold">{formatMoney(order.priceBreakdown?.finalPrice)}</td>
                <td>
                  <span className={statusBadgeClass(order.status)}>{STATUS_LABELS[order.status] || order.status}</span>
                </td>
                <td className="text-xs">
                  {order.assignedAt
                    ? new Date(order.assignedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                    : new Date(order.createdAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
            {!orders.length ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>
                  {loading ? 'Loading orders...' : 'No orders assigned to this vendor for the selected filter.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 m-0">
            {total} orders · page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
