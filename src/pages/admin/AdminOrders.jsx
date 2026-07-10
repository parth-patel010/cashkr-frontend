import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, ChevronLeft, ChevronRight, X, MapPin, Smartphone, User, Calendar, CreditCard, Download } from 'lucide-react';
import './admin.css';

const ORDER_STATUSES = [
  'placed', 
  'scheduled', 
  'assigned', 
  'picked', 
  'verified', 
  'payment_initiated', 
  'completed', 
  'cancelled'
];

/* ── Order Detail Modal ──────────────────────────────────────────────── */
function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const d = order.device || {};
  const p = order.pickup || {};
  const pb = order.priceBreakdown || {};

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
      <div className="bg-slate-50 rounded-xl px-4 py-1">
        {children}
      </div>
    </div>
  );

  const formatList = (arr) => Array.isArray(arr) && arr.length > 0 ? arr.map(s => s.replace(/_/g, ' ')).join(', ') : null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <h3>Order Details</h3>
            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: 600, fontFamily: 'monospace' }}>
              {order.orderId}
            </p>
          </div>
          <button className="admin-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">

          {/* Customer Info */}
          <Section icon={User} title="Customer Information">
            <InfoRow label="Name" value={order.userId?.name || p.name || 'N/A'} />
            <InfoRow label="Phone" value={order.userId?.phone || p.phone || 'N/A'} />
            <InfoRow label="Email" value={order.userId?.email || p.email || 'N/A'} />
          </Section>

          {/* Pickup Address */}
          <Section icon={MapPin} title="Pickup Address">
            <InfoRow label="Address" value={p.address} />
            <InfoRow label="Landmark" value={p.landmark} />
            <InfoRow label="City" value={p.city} />
            <InfoRow label="State" value={p.state} />
            <InfoRow label="Pincode" value={p.pincode} />
            <InfoRow label="Pickup Date" value={p.date} />
            <InfoRow label="Time Slot" value={p.timeSlot} />
            <InfoRow label="Payment Mode" value={p.paymentMethod} />
          </Section>

          {/* Device / Product Details */}
          <Section icon={Smartphone} title="Product Details">
            <InfoRow label="Category" value={d.category} />
            <InfoRow label="Brand" value={d.brand} />
            <InfoRow label="Model" value={d.modelName} />
            <InfoRow label="Storage" value={d.storage} />
            {d.ram && <InfoRow label="RAM" value={d.ram} />}
            {d.processor && <InfoRow label="Processor" value={d.processor} />}
            {d.generation && <InfoRow label="Generation" value={d.generation} />}
            {d.graphicsCard && <InfoRow label="GPU" value={d.graphicsCard} />}
            {d.screenSize && <InfoRow label="Screen Size" value={d.screenSize} />}
            {d.storageType && <InfoRow label="Storage Type" value={d.storageType} />}
            {d.yearOfPurchase && <InfoRow label="Year of Purchase" value={d.yearOfPurchase} />}
            {d.deviceAge && <InfoRow label="Device Age" value={d.deviceAge} />}
            {d.batteryHealth && <InfoRow label="Battery Health" value={d.batteryHealth} />}
            {d.screenCondition && <InfoRow label="Screen Condition" value={d.screenCondition} />}
            {d.bodyCondition && <InfoRow label="Body Condition" value={d.bodyCondition} />}
            <InfoRow label="Touchscreen Working" value={d.isTouchScreenWorking === true ? 'Yes' : d.isTouchScreenWorking === false ? 'No' : null} />
            <InfoRow label="Screen Original" value={d.isScreenOriginal === true ? 'Yes' : d.isScreenOriginal === false ? 'No' : null} />
            <InfoRow label="Under Warranty" value={d.underWarranty === true ? 'Yes' : d.underWarranty === false ? 'No' : null} />
            <InfoRow label="Has GST Bill" value={d.hasGSTBill === true ? 'Yes' : d.hasGSTBill === false ? 'No' : null} />
            <InfoRow label="Able to Make Calls" value={d.ableToMakeCalls === true ? 'Yes' : d.ableToMakeCalls === false ? 'No' : null} />
            <InfoRow label="Physical Issues" value={formatList(d.physicalIssues)} />
            <InfoRow label="Technical Issues" value={formatList(d.technicalIssues)} />
            <InfoRow label="Functional Issues" value={formatList(d.functionalIssues)} />
            <InfoRow label="Accessories" value={Array.isArray(d.accessories) ? formatList(d.accessories) : d.accessories} />
          </Section>

          {/* Pricing */}
          <Section icon={CreditCard} title="Pricing Breakdown">
            <InfoRow label="Base Price" value={pb.basePrice ? `₹${pb.basePrice}` : null} />
            {pb.ageAdjustment !== 0 && <InfoRow label="Age Adjustment" value={`₹${pb.ageAdjustment}`} />}
            {pb.conditionAdjustment !== 0 && <InfoRow label="Condition Adjustment" value={`₹${pb.conditionAdjustment}`} />}
            {pb.screenAdjustment !== 0 && <InfoRow label="Screen Adjustment" value={`₹${pb.screenAdjustment}`} />}
            {pb.functionalDeduction !== 0 && <InfoRow label="Functional Deduction" value={`-₹${Math.abs(pb.functionalDeduction)}`} />}
            {pb.batteryDeduction !== 0 && <InfoRow label="Battery Deduction" value={`-₹${Math.abs(pb.batteryDeduction)}`} />}
            {pb.accessoriesBonus !== 0 && <InfoRow label="Accessories Bonus" value={`+₹${pb.accessoriesBonus}`} />}
            <div className="flex justify-between items-center py-3 mt-1 border-t-2 border-blue-100">
              <span className="text-[12px] font-800 text-blue-700 uppercase tracking-wider">Final Price Offered</span>
              <span className="text-[18px] font-900 text-blue-700">₹{pb.finalPrice || 0}</span>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────── */
export default function AdminOrders() {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const buildFilterParams = () => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return params;
  };

  const fetchOrders = () => {
    setLoading(true);
    const params = { page, limit: 10, ...buildFilterParams() };

    adminService.getOrders(params)
      .then((res) => {
        setOrders(res.data.orders);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load orders', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, status, fromDate, toDate, page]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminService.exportOrders(buildFilterParams());
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
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'admin-badge admin-badge-green';
      case 'cancelled': return 'admin-badge admin-badge-red';
      case 'placed': return 'admin-badge admin-badge-blue';
      case 'scheduled': return 'admin-badge admin-badge-purple';
      case 'verified': return 'admin-badge admin-badge-blue';
      case 'payment_initiated': return 'admin-badge admin-badge-yellow';
      default: return 'admin-badge admin-badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Status Filters */}
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
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="date"
            className="admin-select"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            title="From date"
          />

          <input
            type="date"
            className="admin-select"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            title="To date"
          />

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="admin-btn admin-btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : 'Download Excel'}
          </button>
        </div>

        <div className="text-sm font-semibold text-slate-500">
          Total Orders: <span className="text-slate-900 font-bold">{total}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-12 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 admin-skeleton w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No system orders found.
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User Contact</th>
                  <th>Device Specifications</th>
                  <th>Pricing Offered</th>
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
                          <div className="text-[10px] text-slate-400">{order.userId.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Guest / Deleted User</span>
                      )}
                    </td>
                    <td>
                      <div>
                        <div className="font-bold text-slate-900">{order.device.brand} {order.device.modelName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold capitalize">
                          {order.device.storage} {order.device.ram && `/ ${order.device.ram}`} {order.device.generation && `(${order.device.generation})`}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">₹{order.priceBreakdown?.finalPrice || 0}</div>
                      <div className="text-[9px] text-slate-400">Base: ₹{order.priceBreakdown?.basePrice || 0}</div>
                    </td>
                    <td className="text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '5px 12px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#EFF6FF',
                          color: '#2563EB',
                          border: '1px solid #BFDBFE',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#2563EB';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#EFF6FF';
                          e.currentTarget.style.color = '#2563EB';
                        }}
                      >
                        <MapPin size={12} /> View Details
                      </button>
                    </td>
                    <td className="text-right">
                      <select
                        className="admin-select text-xs py-1 px-2.5"
                        disabled={updatingId === order._id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        {ORDER_STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Page {page} of {totalPages}
              </div>
              <div className="admin-pagination-btns">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="admin-pagination-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="admin-pagination-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

    </div>
  );
}
