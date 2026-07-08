import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { 
  Users, 
  Smartphone, 
  ClipboardList, 
  Handshake, 
  IndianRupee,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './admin.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getStats()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch dashboard metrics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="admin-stat-card admin-skeleton h-[120px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="admin-table-wrapper admin-skeleton h-[300px]" />
          <div className="admin-table-wrapper admin-skeleton h-[300px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
        {error}
      </div>
    );
  }

  const { stats, recentOrders, recentPartners } = data;

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: <Users size={20} className="text-blue-400" />,
      bg: 'rgba(59, 130, 246, 0.1)',
      accent: '#60a5fa',
    },
    {
      label: 'Devices Catalog',
      value: stats.totalDevices,
      icon: <Smartphone size={20} className="text-purple-400" />,
      bg: 'rgba(168, 85, 247, 0.1)',
      accent: '#c084fc',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: <ClipboardList size={20} className="text-emerald-400" />,
      bg: 'rgba(16, 185, 129, 0.1)',
      accent: '#34d399',
    },
    {
      label: 'Partners App',
      value: stats.totalPartners,
      icon: <Handshake size={20} className="text-amber-400" />,
      bg: 'rgba(245, 158, 11, 0.1)',
      accent: '#fbbf24',
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: <IndianRupee size={20} className="text-rose-400" />,
      bg: 'rgba(244, 63, 94, 0.1)',
      accent: '#fb7185',
    },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'admin-badge admin-badge-green';
      case 'cancelled': return 'admin-badge admin-badge-red';
      case 'placed': return 'admin-badge admin-badge-blue';
      case 'pending': return 'admin-badge admin-badge-yellow';
      default: return 'admin-badge admin-badge-gray';
    }
  };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className="admin-stat-card" 
            style={{ '--card-accent': card.accent }}
          >
            <div className="admin-stat-icon" style={{ backgroundColor: card.bg }}>
              {card.icon}
            </div>
            <div className="admin-stat-value">{card.value}</div>
            <div className="admin-stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Grid of tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders */}
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="admin-btn admin-btn-ghost text-xs py-1.5 px-3">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No orders placed yet.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Device</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-xs text-blue-600 font-semibold">{order.orderId}</td>
                    <td>
                      <div>
                        <div className="font-bold text-slate-800">{order.device.brand} {order.device.modelName}</div>
                        <div className="text-[10px] text-gray-500 font-medium">
                          {order.device.storage} {order.device.ram && `/ ${order.device.ram}`}
                        </div>
                      </div>
                    </td>
                    <td className="font-bold text-slate-800">₹{order.priceBreakdown?.finalPrice || 0}</td>
                    <td>
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Partners */}
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h3>Recent Partner Requests</h3>
            <Link to="/admin/partners" className="admin-btn admin-btn-ghost text-xs py-1.5 px-3">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
          {recentPartners.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No partner applications received yet.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Firm Name</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPartners.map((partner) => (
                  <tr key={partner._id}>
                    <td>
                      <div className="font-bold text-slate-800">{partner.businessName}</div>
                      <div className="text-[10px] text-gray-500 font-medium capitalize">{partner.shopType}</div>
                    </td>
                    <td>
                      <div className="text-xs">{partner.contactPerson}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{partner.mobile}</div>
                    </td>
                    <td>{partner.city}</td>
                    <td>
                      <span className={getStatusBadgeClass(partner.status)}>
                        {partner.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
