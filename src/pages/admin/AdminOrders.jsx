import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, ChevronLeft, ChevronRight, X, MapPin, Smartphone, User, CreditCard, Download } from 'lucide-react';
import './admin.css';

const ORDER_TYPES = [
  { key: 'sell', label: 'Sell' },
  { key: 'buy', label: 'Buy' },
  { key: 'repair', label: 'Repair' },
];

const STATUS_BY_TYPE = {
  sell: ['placed', 'scheduled', 'assigned', 'picked', 'verified', 'payment_initiated', 'completed', 'cancelled'],
  buy: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
  repair: ['booked', 'assigned', 'picked', 'repairing', 'quality_check', 'delivered', 'cancelled'],
};

function OrderDetailModal({ order, orderType, onClose }) {
  if (!order) return null;

  const InfoRow = ({ label, value }) =>
    value ? (
      <div className="flex justify-between items-start gap-4 py-2 border-b border-slate-50 last:border-0">
        <span className="text-[11px] font-700 text-slate-400 uppercase tracking-wide shrink-0">{label}</span>
        <span className="text-[13px] font-semibold text-slate-800 text-right">{value}</span>
      </div>
    ) : null;

  const Section = ({ icon: Icon, title, children }) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon size={14} className="text-blue-600" />
        </div>
        <span className="text-[12px] font-800 text-slate-500 uppercase tracking-wider">{title}</span>
      </div>
      <div className="bg-slate-50 rounded-xl px-4 py-1">{children}</div>
    </div>
  );

  const p = order.pickup || order.shipping || {};
  const d = order.device || order.productSnapshot || order.snapshot || {};
  const pb = order.priceBreakdown || {};

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3>{orderType.toUpperCase()} Order Details</h3>
            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: 600, fontFamily: 'monospace' }}>
              {order.orderId}
            </p>
          </div>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="admin-modal-body">
          <Section icon={User} title="Customer">
            <InfoRow label="Name" value={order.userId?.name || p.name || 'N/A'} />
            <InfoRow label="Phone" value={order.userId?.phone || p.phone || 'N/A'} />
            <InfoRow label="Email" value={order.userId?.email || p.email || 'N/A'} />
          </Section>
          <Section icon={MapPin} title={orderType === 'buy' ? 'Shipping' : 'Pickup'}>
            <InfoRow label="Address" value={p.address} />
            <InfoRow label="City" value={p.city} />
            <InfoRow label="State" value={p.state} />
            <InfoRow label="Pincode" value={p.pincode} />
            <InfoRow label="Date" value={p.date || p.preferredDate} />
            <InfoRow label="Slot" value={p.timeSlot || p.preferredSlot} />
          </Section>
          <Section icon={Smartphone} title="Item">
            <InfoRow label="Brand" value={d.brand} />
            <InfoRow label="Model / Title" value={d.modelName || d.title} />
            <InfoRow label="Condition / Issue" value={d.conditionLabel || d.issueLabel} />
            <InfoRow label="Storage" value={d.storage} />
          </Section>
          <Section icon={CreditCard} title="Amount">
            <InfoRow
              label="Amount"
              value={`₹${d.price ?? pb.finalPrice ?? order.snapshot?.price ?? 0}`}
            />
            {order.customerNote ? <InfoRow label="Note" value={order.customerNote} /> : null}
          </Section>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const [orderType, setOrderType] = useState('sell');
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = STATUS_BY_TYPE[orderType];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setStatus('');
    setPage(1);
  }, [orderType]);

  const fetchOrders = () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (debouncedSearch) params.search = debouncedSearch;
    if (status) params.status = status;
    if (orderType === 'sell') {
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
    }

    const request =
      orderType === 'buy'
        ? adminService.getBuyOrders(params)
        : orderType === 'repair'
          ? adminService.getRepairOrders(params)
          : adminService.getOrders(params);

    request
      .then((res) => {
        setOrders(res.data.orders || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, status, fromDate, toDate, page, orderType]);

  const handleExport = async () => {
    if (orderType !== 'sell') {
      alert('Excel export is available for Sell orders only right now.');
      return;
    }
    setExporting(true);
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const res = await adminService.exportOrders(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export orders');
    } finally {
      setExporting(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      if (orderType === 'buy') await adminService.updateBuyOrderStatus(orderId, newStatus);
      else if (orderType === 'repair') await adminService.updateRepairOrderStatus(orderId, newStatus);
      else await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (s) => {
    if (s === 'completed' || s === 'delivered') return 'admin-badge admin-badge-green';
    if (s === 'cancelled') return 'admin-badge admin-badge-red';
    if (s === 'placed' || s === 'booked' || s === 'confirmed') return 'admin-badge admin-badge-blue';
    if (s === 'shipped' || s === 'repairing' || s === 'picked') return 'admin-badge admin-badge-yellow';
    return 'admin-badge admin-badge-gray';
  };

  const rowTitle = (order) => {
    if (orderType === 'buy') {
      return (
        order.productSnapshot?.title ||
        `${order.productSnapshot?.brand || ''} ${order.productSnapshot?.modelName || ''}`.trim()
      );
    }
    if (orderType === 'repair') {
      return order.snapshot?.title || `${order.snapshot?.brand || ''} Repair`;
    }
    return `${order.device?.brand || ''} ${order.device?.modelName || ''}`.trim();
  };

  const rowMeta = (order) => {
    if (orderType === 'buy') {
      return `${order.productSnapshot?.conditionLabel || 'Refurbished'} · ₹${order.productSnapshot?.price || 0}`;
    }
    if (orderType === 'repair') {
      return `${order.snapshot?.issueLabel || 'Repair'} · ₹${order.snapshot?.price || 0}`;
    }
    return `₹${order.priceBreakdown?.finalPrice || 0}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {ORDER_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`admin-btn ${orderType === t.key ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
            onClick={() => setOrderType(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              className="admin-search pl-10"
              placeholder="Search ID, brand or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>

          <select
            className="admin-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}>
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {orderType === 'sell' ? (
            <>
              <input
                type="date"
                className="admin-select"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                title="From date"
              />
              <input
                type="date"
                className="admin-select"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                title="To date"
              />
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="admin-btn admin-btn-primary text-xs py-2 px-4 flex items-center gap-2">
                <Download size={14} />
                {exporting ? 'Exporting...' : 'Download Excel'}
              </button>
            </>
          ) : null}
        </div>

        <div className="text-sm font-semibold text-slate-500">
          Total Orders: <span className="text-slate-900 font-bold">{total}</span>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-12 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 admin-skeleton w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No {orderType} orders found.</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User Contact</th>
                  <th>Item</th>
                  <th>Details</th>
                  <th>Ordered At</th>
                  <th>Current Status</th>
                  <th>View Details</th>
                  <th className="text-right">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className="font-mono text-xs text-blue-600 font-bold">{order.orderId}</span>
                    </td>
                    <td>
                      {order.userId ? (
                        <div>
                          <div className="font-bold text-slate-900">{order.userId.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{order.userId.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Guest / Deleted User</span>
                      )}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{rowTitle(order)}</div>
                    </td>
                    <td>
                      <div className="text-xs text-slate-500">{rowMeta(order)}</div>
                    </td>
                    <td className="text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>{order.status}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost text-xs"
                        onClick={() => setSelectedOrder(order)}>
                        <MapPin size={12} /> View
                      </button>
                    </td>
                    <td className="text-right">
                      <select
                        className="admin-select text-xs py-1 px-2.5"
                        disabled={updatingId === order._id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Page {page} of {totalPages}
              </div>
              <div className="admin-pagination-btns">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="admin-pagination-btn">
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="admin-pagination-btn">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedOrder ? (
        <OrderDetailModal order={selectedOrder} orderType={orderType} onClose={() => setSelectedOrder(null)} />
      ) : null}
    </div>
  );
}
