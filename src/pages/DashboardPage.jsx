import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/order.service';
import { userService } from '../services/user.service';
import NoIndexSEO from '../components/seo/NoIndexSEO';
import { deviceService } from '../services/device.service';
import { isSpecialModel } from '../utils/specialModels';
import { formatCurrency } from '../utils/formatCurrency';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import PageCanvas from '../components/layout/PageCanvas';

// --- Icons (SVGs matching DeviceKart style) ---
const IconOrders = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
);
const IconAddress = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const IconPayment = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
);
const IconEarnings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="m17 5-5-3-5 3" /><path d="m17 19-5 3-5-3" /><path d="M2 12h20" /><path d="m5 7-3 5 3 5" /><path d="m19 7 3 5-3 5" /></svg>
);
const IconReferral = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect width="20" height="5" x="2" y="7" /><line x1="12" x2="12" y1="22" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" /></svg>
);
const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
);
const IconChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
);

const cardShell =
  'rounded-2xl sm:rounded-[28px] bg-white border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)]';
const fieldClass =
  'w-full py-2.5 px-4 border-[1.5px] border-border rounded-xl text-sm font-[DM_Sans] text-text-primary outline-none bg-[#fafbff] transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(5,101,230,0.10)] focus:bg-white disabled:opacity-80';

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [referral, setReferral] = useState({ referralCode: '', totalReferrals: 0, totalEarnings: 0, referrals: [] });
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [copied, setCopied] = useState(false);
  const [selectedReportOrder, setSelectedReportOrder] = useState(null);

  const fetchData = async () => {
    try {
      const [userRes, ordersRes, refRes] = await Promise.all([
        userService.getMe(),
        orderService.getOrders(),
        userService.getReferrals().catch(() => ({ data: { referralCode: 'GENERATE123', totalReferrals: 0, totalEarnings: 0, referrals: [] } })),
      ]);

      setUser(userRes.data.user);
      setOrders(ordersRes.data || []);
      setReferral(refRes.data);
      setAddresses(userRes.data.user.addresses || []);
      setPaymentMethods(userRes.data.user.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAddress = async (addressData) => {
    try {
      const res = await userService.addAddress(addressData);
      setAddresses(res.data);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await userService.deleteAddress(id);
      setAddresses(res.data);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      const res = await userService.addPaymentMethod(paymentData);
      setPaymentMethods(res.data);
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      const res = await userService.deletePaymentMethod(id);
      setPaymentMethods(res.data);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderId);
        fetchData();
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdateProfile = async (updates) => {
    try {
      const res = await userService.updateMe(updates);
      setUser(res.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const copyCode = () => {
    if (referral.referralCode) {
      navigator.clipboard.writeText(referral.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <Loader />;

  const menuItems = [
    { name: 'Orders', icon: <IconOrders /> },
    { name: 'Address', icon: <IconAddress /> },
    { name: 'Payment', icon: <IconPayment /> },
    { name: 'Earnings', icon: <IconEarnings /> },
    { name: 'Referral', icon: <IconReferral /> },
  ];

  return (
    <PageCanvas>
      <NoIndexSEO title="My Dashboard" path="/dashboard" />

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-[300px] flex flex-col gap-4 sm:gap-5">
          {/* User Profile Card */}
          <div
            onClick={() => setActiveTab('Profile')}
            className={`${cardShell} p-5 sm:p-6 flex items-center gap-4 cursor-pointer transition-all ${
              activeTab === 'Profile'
                ? 'bg-primary-light border-primary'
                : 'hover:border-primary/40'
            }`}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary-light flex items-center justify-center border-4 border-white shadow-sm overflow-hidden shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <div className="overflow-hidden">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{user?.name || 'User Name'}</h3>
              <p className="text-sm text-gray-500 font-medium truncate">{user?.phone || 'Phone number'}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className={`${cardShell} p-2.5 sm:p-3 flex flex-col gap-1`}>
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group border
                  ${activeTab === item.name
                    ? 'bg-primary-light text-primary border-border-light'
                    : 'text-gray-500 border-transparent hover:bg-[#F4F7FB] hover:text-gray-900'}`}
              >
                <div className={`p-2 rounded-lg transition-colors
                  ${activeTab === item.name ? 'bg-white shadow-sm text-primary' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </div>
                <span className="font-bold text-[15px]">{item.name}</span>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] text-[#EF4444] font-bold text-[15px] hover:bg-[#FEE2E2] transition-colors mt-auto"
          >
            <div className="p-1 rounded bg-white shadow-sm">
              <IconLogout />
            </div>
            Log Out
          </button>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 ${cardShell} min-h-[500px] overflow-hidden`}>
          <div className="p-5 sm:p-8">
            {activeTab === 'Profile' && (
              <ProfileTab
                user={user}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
            {activeTab === 'Orders' && (
              <OrdersTab
                orders={orders}
                setSelectedReportOrder={setSelectedReportOrder}
                onCancel={handleCancelOrder}
              />
            )}
            {activeTab === 'Address' && (
              <AddressTab
                addresses={addresses}
                onAdd={handleAddAddress}
                onDelete={handleDeleteAddress}
              />
            )}
            {activeTab === 'Payment' && (
              <PaymentTab
                paymentMethods={paymentMethods}
                onAdd={handleAddPayment}
                onDelete={handleDeletePayment}
              />
            )}
            {activeTab === 'Earnings' && <EarningsTab />}
            {activeTab === 'Referral' && (
              <ReferralTab
                referral={referral}
                copyCode={copyCode}
                copied={copied}
              />
            )}
          </div>
        </div>
      </div>

      {selectedReportOrder && (
        <DeviceEvaluationReportModal
          order={selectedReportOrder}
          onClose={() => setSelectedReportOrder(null)}
        />
      )}
    </PageCanvas>
  );
}

// --- Sub-components for Tabs ---

function ProfileTab({ user, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFormData({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        phone: user.phone || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
    await onUpdateProfile({
      name: updatedName,
      phone: formData.phone
      // email is typically not updated directly or needs a different flow, but we can send it if backend supports
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Update your personal details</p>
        </div>
        {!isEditing && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5 1 1-11 11-4 1 1-4Z" /><path d="m15 8 1 1" /></svg>
            Edit Profile
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled={true} // Email usually requires verification to change
              className={`${fieldClass} cursor-not-allowed opacity-80`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3">
            <Button type="submit">Save Changes</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                const parts = (user.name || '').split(' ');
                setFormData({
                  firstName: parts[0] || '',
                  lastName: parts.slice(1).join(' ') || '',
                  phone: user.phone || '',
                  email: user.email || ''
                });
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>

      <div className="border border-gray-100 rounded-2xl p-5 sm:p-6 flex items-start gap-4 bg-[#F4F7FB]/60">
        <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[15px] font-bold text-gray-900">WhatsApp Updates</h4>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-primary" style={{ right: 0, borderColor: '#0565E6' }} />
              <label className="toggle-label block overflow-hidden h-6 rounded-full bg-primary cursor-pointer"></label>
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">
            Order updates, pickup reminders, and exclusive offers on WhatsApp ({user?.phone || ''}).
          </p>
          <p className="text-xs text-gray-400 font-medium mt-3">
            Reply STOP to any WhatsApp message to opt out instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ orders, setSelectedReportOrder, onCancel }) {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredOrders = orders.filter(order => {
    if (categoryFilter === 'All') return true;
    const isLaptop = order.device?.category === 'laptop';
    return categoryFilter === 'Laptop' ? isLaptop : !isLaptop;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track your device sales</p>
        </div>

        {/* Category Filter */}
        <div className="flex bg-[#F4F7FB] p-1 rounded-xl border border-[#E8EEF5] shrink-0">
          {['All', 'Mobile', 'Laptop'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-white text-primary shadow-sm border border-gray-100'
                  : 'text-gray-400 hover:text-gray-600 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-[#F4F7FB]/50 rounded-2xl border border-dashed border-[#E8EEF5]">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-primary">
            <IconOrders />
          </div>
          <p className="text-gray-500 font-bold">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all relative overflow-hidden group">
                {/* Category Tag */}
                <div className="absolute top-0 right-8">
                  <div className={`px-3 py-1 rounded-b-lg text-[9px] font-bold uppercase tracking-widest ${
                    order.device?.category === 'laptop'
                      ? 'bg-blue-50 text-blue-500'
                      : 'bg-primary-light text-primary'
                  }`}>
                    {order.device?.category || 'Mobile'}
                  </div>
                </div>
                {/* Top Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E8EEF5]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-primary-light rounded-full flex items-center justify-center text-primary shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Order Confirmed</h4>
                      <p className="text-sm font-medium text-gray-400">Your order has been created.</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/orders/${order.orderId}`)}
                  >
                    View Details
                  </Button>
                </div>

                {/* Device Info Row */}
                <div className="flex flex-col md:flex-row items-center gap-5 sm:gap-6">
                  <div className="w-20 h-20 bg-[#F4F7FB] rounded-2xl flex items-center justify-center p-3 shrink-0">
                    <img
                      src={order.device?.imageUrl || "https://img.freepik.com/free-photo/mobile-phone-with-blank-screen_23-2148151433.jpg"}
                      alt={order.device?.modelName}
                      className="max-h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{order.device?.modelName}</h3>
                    <p className="text-sm font-medium text-gray-400">
                      {order.device?.category === 'laptop'
                        ? `${order.device?.processor} / ${order.device?.ram} / ${order.device?.storage}`
                        : `${order.device?.storage} / ${order.device?.ram || '8 GB'}`
                      }
                    </p>
                  </div>

                  <div className="flex items-center gap-8 sm:gap-10">
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="font-bold text-gray-900 uppercase text-sm">{order.orderId}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quote</p>
                      <p className="text-xl font-extrabold text-gray-900">{formatCurrency(order.priceBreakdown?.finalPrice)}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setSelectedReportOrder(order)}
                    className="flex-1 bg-[#F4F7FB] text-gray-600 font-bold py-3 rounded-xl hover:bg-[#E8EEF5] transition-all text-sm border border-[#E8EEF5]"
                  >
                    Evaluation Report
                  </button>
                  {['placed', 'scheduled'].includes(order.status) && (
                    <button
                      onClick={() => onCancel(order.orderId)}
                      className="flex-1 bg-red-50 text-red-500 font-bold py-3 rounded-xl hover:bg-red-100 transition-all text-sm border border-red-100"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all">
              <IconChevronLeft />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-primary-light text-primary border border-border-light flex items-center justify-center font-bold">1</span>
            </div>
            <button className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all">
              <IconChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AddressTab({ addresses, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Home',
    name: '',
    phone: '',
    alternatePhone: '',
    pincode: '',
    address: '',
    landmark: '',
    city: '',
    state: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setShowForm(false);
    setFormData({ label: 'Home', name: '', phone: '', alternatePhone: '', pincode: '', address: '', landmark: '', city: '', state: '' });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Addresses</h2>
          <p className="text-sm text-gray-500 mt-1">Add, edit, or remove your saved locations</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <span className="text-lg leading-none">{showForm ? '×' : '+'}</span>
          {showForm ? 'Cancel' : 'Add New Address'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#F4F7FB] rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#E8EEF5]">
          <input
            placeholder="Label (e.g. Home, Office)"
            className={fieldClass}
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />
          <input
            placeholder="Full Name"
            className={fieldClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            placeholder="Phone Number"
            className={fieldClass}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <input
            placeholder="Alternative Number (optional)"
            className={fieldClass}
            value={formData.alternatePhone}
            onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            maxLength={10}
            inputMode="numeric"
          />
          <input
            placeholder="Pincode"
            className={fieldClass}
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            required
          />
          <div className="md:col-span-2">
            <textarea
              placeholder="Full Address"
              className={`${fieldClass} min-h-[88px] resize-y`}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <input
            placeholder="Landmark"
            className={fieldClass}
            value={formData.landmark}
            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
          />
          <input
            placeholder="City"
            className={fieldClass}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <input
            placeholder="State"
            className={fieldClass}
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
          <Button type="submit" className="md:col-span-2 mt-1">
            Save Address
          </Button>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[#E8EEF5] bg-[#F4F7FB]/40">
          <p className="text-gray-400 font-medium">(0 addresses out of 3)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="border border-gray-100 rounded-2xl p-5 relative group hover:border-primary/30 transition-all bg-white shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-primary-light text-primary text-xs font-bold rounded-full uppercase border border-border-light">{addr.label}</span>
                <button
                  onClick={() => onDelete(addr._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                </button>
              </div>
              <h4 className="font-bold text-gray-900">{addr.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{addr.address}</p>
              <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-sm text-gray-500 mt-2 font-medium">📞 {addr.phone}</p>
              {addr.alternatePhone && (
                <p className="text-sm text-gray-500 mt-1 font-medium">📱 Alt: {addr.alternatePhone}</p>
              )}
              {addr.isDefault && <p className="text-[10px] text-primary font-bold mt-3 uppercase tracking-wider">Default Address</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentTab({ paymentMethods, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('bank');
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, type });
    setShowForm(false);
    setFormData({ accountName: '', accountNumber: '', ifscCode: '', bankName: '', upiId: '' });
  };

  const bankAccounts = paymentMethods.filter(pm => pm.type === 'bank');
  const upiIds = paymentMethods.filter(pm => pm.type === 'upi');

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Payment Methods</p>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payments</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your saved bank accounts and UPI IDs</p>
      </div>

      <div className="space-y-4">
        {/* Forms for adding */}
        {showForm && (
          <div className="bg-[#F4F7FB] rounded-2xl p-5 sm:p-6 border border-[#E8EEF5]">
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setType('bank')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                  type === 'bank'
                    ? 'bg-primary text-white border-primary shadow-[0_4px_14px_rgba(5,101,230,0.25)]'
                    : 'bg-white text-gray-500 border-gray-100'
                }`}
              >
                Bank Account
              </button>
              <button
                onClick={() => setType('upi')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                  type === 'upi'
                    ? 'bg-primary text-white border-primary shadow-[0_4px_14px_rgba(5,101,230,0.25)]'
                    : 'bg-white text-gray-500 border-gray-100'
                }`}
              >
                UPI ID
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === 'bank' ? (
                <>
                  <input
                    placeholder="Account Holder Name"
                    className={fieldClass}
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Bank Name"
                    className={fieldClass}
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Account Number"
                    className={fieldClass}
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    required
                  />
                  <input
                    placeholder="IFSC Code"
                    className={fieldClass}
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    required
                  />
                </>
              ) : (
                <div className="md:col-span-2">
                  <input
                    placeholder="UPI ID (e.g. name@bank)"
                    className={fieldClass}
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="md:col-span-2 flex gap-3 mt-1">
                <Button type="submit" className="flex-1">
                  Save Payment Method
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Bank Account List */}
        <div className="border border-gray-100 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-primary/20 transition-colors bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 min-w-0">
              <div className="w-11 h-11 bg-[#F4F7FB] rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-colors shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900">Bank Accounts</h4>
                {bankAccounts.length === 0 ? (
                  <p className="text-sm text-gray-400 font-medium">Not added</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {bankAccounts.map(bank => (
                      <div key={bank._id} className="flex items-center justify-between bg-[#F4F7FB] p-4 rounded-xl border border-[#E8EEF5]">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{bank.bankName}</p>
                          <p className="text-xs text-gray-500">A/c: ****{bank.accountNumber.slice(-4)} • {bank.accountName}</p>
                        </div>
                        <button
                          onClick={() => onDelete(bank._id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Bank transfers are sent directly to your account.</p>
              </div>
            </div>
            {!showForm && (
              <button
                onClick={() => { setShowForm(true); setType('bank'); }}
                className="text-primary font-bold text-sm hover:underline shrink-0"
              >
                Add New Bank Account
              </button>
            )}
          </div>
        </div>

        {/* UPI List */}
        <div className="border border-gray-100 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-primary/20 transition-colors bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 min-w-0">
              <div className="w-11 h-11 bg-[#F4F7FB] rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-colors shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900">UPI Transfer</h4>
                {upiIds.length === 0 ? (
                  <p className="text-sm text-gray-400 font-medium">Not added</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {upiIds.map(upi => (
                      <div key={upi._id} className="flex items-center justify-between bg-[#F4F7FB] p-4 rounded-xl border border-[#E8EEF5]">
                        <div>
                          <p className="font-bold text-sm text-gray-900">{upi.upiId}</p>
                        </div>
                        <button
                          onClick={() => onDelete(upi._id)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">Instant transfer to your UPI linked account.</p>
              </div>
            </div>
            {!showForm && (
              <button
                onClick={() => { setShowForm(true); setType('upi'); }}
                className="text-primary font-bold text-sm hover:underline shrink-0"
              >
                Add New UPI ID
              </button>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-[#F4F7FB]/60 rounded-2xl p-4 text-center border border-[#E8EEF5]">
          <p className="text-xs text-gray-500 font-medium flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Secured by SSL Encryption. 100% Safe and Confidential Payment Info
          </p>
        </div>
      </div>
    </div>
  );
}

function EarningsTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-primary rounded-2xl sm:rounded-[28px] p-8 sm:p-10 text-white text-center relative overflow-hidden mb-8">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Earnings Dashboard</h2>
          <span className="inline-block bg-white text-primary px-5 py-2 rounded-full font-bold text-sm">Coming Soon</span>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <p className="text-center text-gray-600 font-medium max-w-lg mx-auto mb-10">
        We're building powerful tools to help you track and maximize your earnings on DeviceKart.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {[
          { title: 'Earnings Analytics', desc: 'Visualize your earnings trends and identify your best performing activities.', icon: <IconEarnings /> },
          { title: 'Refer & Earn', desc: 'Invite friends to join DeviceKart and earn bonuses for each successful referral.', icon: <IconReferral /> },
          { title: 'Earnings History', desc: 'Track your complete earnings history with detailed transaction records.', icon: <IconOrders /> },
        ].map((card) => (
          <div key={card.title} className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_4px_16px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all">
            <div className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center text-primary mb-5 border border-border-light">
              {card.icon}
            </div>
            <h4 className="font-bold text-gray-900 mb-2">{card.title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">{card.desc}</p>
            <button className="text-primary font-bold text-sm flex items-center gap-1 group">
              Learn more <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralTab({ referral, copyCode, copied }) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Refer & Earn</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 max-w-md leading-tight tracking-tight">
          Share your referral link, earn instant rewards
        </h2>
        <p className="text-sm text-gray-500 mt-3 max-w-lg">
          Generate your referral link, invite your friends, and their bonus applies automatically when they complete their first sale.
        </p>
      </div>

      <div className="border border-border-light bg-white rounded-2xl p-6 sm:p-8 relative shadow-[0_4px_16px_rgba(15,23,42,0.03)]">
        <div className="absolute top-4 right-6 text-primary/20">
          <IconReferral />
        </div>

        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">Your Referral Link</p>

        <div className="mb-6">
          <div className="bg-[#F4F7FB] border border-[#E8EEF5] rounded-xl p-4 text-gray-500 font-medium">
            {referral.referralCode || 'Referral code not generated yet'}
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            Generate link to activate
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="button" className="flex-1">
            Generate Link
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={copyCode}
            className="flex-1 border border-gray-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
        </div>
      </div>

      {referral.referrals?.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-gray-900 mb-4">Your Referrals ({referral.totalReferrals})</h3>
          <div className="space-y-3">
            {referral.referrals.map((ref, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#F4F7FB] rounded-xl border border-[#E8EEF5]">
                <div>
                  <p className="font-bold text-sm text-gray-900">{ref.name}</p>
                  <p className="text-xs text-gray-500">Joined on {new Date(ref.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge status="completed" text="+ ₹500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const supportsESIM = (modelName) => {
  if (!modelName) return false;
  const name = modelName.toLowerCase();
  const allowed = [
    'iphone 13 pro', 'iphone 13 pro max',
    'iphone 14 pro', 'iphone 14 pro max',
    'iphone 15 pro', 'iphone 15 pro max',
    'iphone 16 pro', 'iphone 16 pro max',
    'iphone 17', 'iphone 17 air', 'iphone 17 pro', 'iphone 17 pro max'
  ];
  return allowed.some(pattern => name.includes(pattern));
};

function DeviceEvaluationReportModal({ order, onClose }) {
  const isLaptop = order.device?.category === 'laptop';

  const issueLabels = {
    // Physical issues
    'glass_crack': 'Glass Crack',
    'back_panel': 'Back Panel Damage/Scratches',
    'camera_glass_broken': 'Camera Glass Broken',

    // Technical issues
    'battery_service': 'Battery Warning / Service Required',
    'front_camera': 'Front Camera faulty',
    'back_camera': 'Back Camera faulty',
    'volume_button': 'Volume button issue',
    'wifi_issue': 'Wifi/Wireless issue',
    'finger_touch': 'Finger touch/Touch ID issue',
    'face_unlock': 'Face unlock/Face ID issue',
    'speaker_faulty': 'Speaker faulty',
    'power_button': 'Power button issue',
    'charging_port': 'Charging port issue',
    'audio_receiver': 'Audio receiver issue',
    'bluetooth': 'Bluetooth issue',
    'vibrator': 'Vibrator issue',
    'microphone': 'Microphone issue',
    'proximity_sensor': 'Proximity sensor issue',
  };

  const physicalIssues = order.device?.physicalIssues || [];
  const technicalIssues = order.device?.technicalIssues || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl sm:rounded-[28px] shadow-[0_8px_40px_rgba(15,23,42,0.15)] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 sm:p-8 text-center relative border-b border-[#E8EEF5] bg-[#F4F7FB]">
          <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-900 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1.5 tracking-tight">Device Evaluation Report</h2>
          <p className="text-sm font-medium text-gray-400">This is the report that you filled while selling this device.</p>
        </div>

        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto no-scrollbar space-y-8">
          {/* Device Evaluation Section */}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-primary mb-1">Device Evaluation</h3>
              <p className="text-sm font-bold text-gray-900">Summary</p>
            </div>

            <div className="space-y-3">
              <ReportRow label="Device Category" value={isLaptop ? 'Laptop' : 'Mobile'} />
              {!isSpecialModel(order.device?.brand, order.device?.modelName) && (
                <ReportRow label="Device Age" value={order.device?.deviceAge || '3 - 6 Months'} />
              )}
              {isLaptop ? (
                <>
                  <ReportRow label="Processor" value={order.device?.processor || 'N/A'} />
                  <ReportRow label="Generation" value={order.device?.generation || 'N/A'} />
                  <ReportRow label="RAM" value={order.device?.ram || 'N/A'} />
                  <ReportRow label="Storage" value={order.device?.storage || 'N/A'} />
                  <ReportRow label="Graphics" value={order.device?.hasDedicatedGpu ? order.device?.graphicsCard : 'Integrated'} />
                  <ReportRow label="Screen Size" value={order.device?.screenSize || 'N/A'} />
                  <ReportRow label="Touch Screen" value={order.device?.hasTouchscreen ? 'Yes' : 'No'} />
                  <ReportRow label="Accessories" value={Array.isArray(order.device?.accessories) ? order.device.accessories.join(', ') : order.device?.accessories || 'None'} />
                </>
              ) : (
                <>
                  {!isSpecialModel(order.device?.brand, order.device?.modelName) && (
                    <ReportRow label="Under Warranty" value={order.device?.underWarranty ? 'Yes' : 'No'} isAlert={!order.device?.underWarranty} />
                  )}
                  {supportsESIM(order.device?.modelName) && order.device?.eSIMSupport && (
                    <ReportRow label="eSIM Support" value={order.device.eSIMSupport === 'esim_only_global' ? 'Dual eSIM Only' : 'Physical + eSIM'} />
                  )}
                  <ReportRow label="Calls Functional" value={order.device?.ableToMakeCalls ? 'Yes' : 'No'} isAlert={!order.device?.ableToMakeCalls} />
                  <ReportRow label="Touch screen working" value={order.device?.isTouchScreenWorking ? 'Yes' : 'No'} isAlert={!order.device?.isTouchScreenWorking} />
                  <ReportRow label="Screen Original" value={order.device?.isScreenOriginal ? 'Yes' : 'No'} isAlert={!order.device?.isScreenOriginal} />
                  <ReportRow label="Accessories" value={Array.isArray(order.device?.accessories) ? order.device.accessories.join(', ') : 'None'} />
                </>
              )}
            </div>
          </div>

          {/* Physical Condition Section (Mobile Only) */}
          {!isLaptop && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Physical Condition</h3>
              <div className="space-y-3">
                {physicalIssues.length === 0 ? (
                  <p className="text-sm font-medium text-gray-400 italic">No physical issues reported</p>
                ) : (
                  physicalIssues.map(id => (
                    <div key={id} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                      <p className="text-sm font-bold text-[#EF4444]">{issueLabels[id] || id}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Technical Condition Section (Mobile Only) */}
          {!isLaptop && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Technical Condition</h3>
              <div className="space-y-3">
                {technicalIssues.length === 0 ? (
                  <div className="p-8 bg-[#F4F7FB] rounded-2xl border border-dashed border-[#E8EEF5] text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No technical issues reported</p>
                  </div>
                ) : (
                  technicalIssues.map(id => (
                    <div key={id} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                      <p className="text-sm font-bold text-[#EF4444]">{issueLabels[id] || id}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 bg-[#F4F7FB] border-t border-[#E8EEF5] flex gap-4">
          <button onClick={onClose} className="flex-1 bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all">Close Report</button>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ label, value, isAlert }) {
  return (
    <div className="flex justify-between items-center gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <span className={`text-sm font-bold ${isAlert ? 'text-[#EF4444]' : 'text-gray-500'}`}>{value}</span>
    </div>
  );
}
