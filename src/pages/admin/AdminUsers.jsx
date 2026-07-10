import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { Search, ChevronLeft, ChevronRight, X, ClipboardList, Calendar, Phone, Mail, User, Smartphone } from 'lucide-react';
import './admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    adminService.getUsers({ search: debouncedSearch, page, limit: 10 })
      .then((res) => {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users', err);
        setLoading(false);
      });
  }, [debouncedSearch, page]);

  const handleViewUser = async (userId) => {
    setUserDetailLoading(true);
    try {
      const res = await adminService.getUserById(userId);
      setSelectedUser(res.data.user);
      setUserOrders(res.data.orders);
    } catch (err) {
      console.error('Failed to load user details', err);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserOrders([]);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'admin-badge admin-badge-green';
      case 'cancelled': return 'admin-badge admin-badge-red';
      case 'placed': return 'admin-badge admin-badge-blue';
      default: return 'admin-badge admin-badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative">
          <input
            type="text"
            className="admin-search pl-10"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        </div>
        <div className="text-sm font-semibold text-slate-500">
          Total Users: <span className="text-slate-900 font-bold">{total}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="p-12 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 admin-skeleton w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No registered users found matching the search.
          </div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Contact Info</th>
                  <th>Referral Code</th>
                  <th>Last Quiz Device</th>
                  <th>Joined Date</th>
                  <th>Orders Count</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[10px] text-slate-400">ID: {user._id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-slate-800 font-medium">{user.email}</div>
                      <div className="text-xs text-slate-400 font-mono">{user.phone}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs bg-blue-50 border border-blue-200 text-blue-600 py-0.5 px-1.5 rounded">
                        {user.referralCode || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {user.lastQuizDevice?.modelName ? (
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {user.lastQuizDevice.brand} {user.lastQuizDevice.modelName}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {user.lastQuizDevice.storage || '—'}
                            {user.lastQuizDevice.loggedInAt && (
                              <> · {new Date(user.lastQuizDevice.loggedInAt).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}</>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">—</span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge-blue">
                        {user.orderCount} {user.orderCount === 1 ? 'order' : 'orders'}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        disabled={userDetailLoading}
                        className="admin-btn admin-btn-ghost text-xs py-1.5 px-3"
                      >
                        <span>View Details</span>
                      </button>
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={closeUserModal}>
          <div className="admin-modal max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Detailed Profile: {selectedUser.name}</h3>
              <button onClick={closeUserModal} className="admin-modal-close">
                <X size={16} />
              </button>
            </div>
            
            <div className="admin-modal-body space-y-6">
              
              {/* Profile card metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Details card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-3">
                    <User className="text-blue-500 w-5 h-5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Full Name</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedUser.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="text-blue-500 w-5 h-5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                      <div className="text-sm font-semibold text-slate-900">{selectedUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="text-blue-500 w-5 h-5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Phone Number</div>
                      <div className="text-sm font-mono text-slate-900">{selectedUser.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Account card */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
                  <div className="flex items-center gap-3">
                    <Calendar className="text-purple-500 w-5 h-5" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Register Date</div>
                      <div className="text-sm font-semibold text-slate-900">
                        {new Date(selectedUser.createdAt).toLocaleString('en-IN', {
                          day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Referral Code</div>
                      <div className="text-sm font-bold text-blue-600 font-mono mt-1">
                        {selectedUser.referralCode || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Used Referral</div>
                      <div className="text-sm font-semibold text-slate-700 mt-1">
                        {selectedUser.usedReferralCode || 'None'}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedUser.lastQuizDevice?.modelName && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="text-amber-600 w-5 h-5" />
                      <span className="text-[12px] font-800 text-amber-800 uppercase tracking-wider">
                        Last Quiz Device (login context)
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedUser.lastQuizDevice.brand} {selectedUser.lastQuizDevice.modelName}
                      {selectedUser.lastQuizDevice.storage ? ` · ${selectedUser.lastQuizDevice.storage}` : ''}
                    </div>
                    <div className="text-xs text-slate-600">
                      Category: <span className="capitalize">{selectedUser.lastQuizDevice.category || 'mobile'}</span>
                      {selectedUser.lastQuizDevice.loggedInAt && (
                        <> · Logged in during quiz: {new Date(selectedUser.lastQuizDevice.loggedInAt).toLocaleString('en-IN')}</>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Order History */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <ClipboardList className="text-emerald-500 w-5 h-5" />
                  <h4 className="font-extrabold text-slate-800">Order History ({userOrders.length})</h4>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                    This user has not placed any buyback orders yet.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Device</th>
                          <th>Price Offered</th>
                          <th>Placed At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userOrders.map((order) => (
                          <tr key={order._id}>
                            <td className="font-mono text-xs text-blue-600 font-semibold">{order.orderId}</td>
                            <td>
                              <div className="font-semibold text-slate-800">{order.device.brand} {order.device.modelName}</div>
                              <div className="text-[10px] text-slate-400">{order.device.storage}</div>
                            </td>
                            <td className="font-bold text-slate-900">₹{order.priceBreakdown?.finalPrice || 0}</td>
                            <td className="text-xs">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(order.status)}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            <div className="admin-modal-footer">
              <button onClick={closeUserModal} className="admin-btn admin-btn-ghost">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
