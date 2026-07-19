import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Smartphone, 
  Tags,
  ShoppingBag,
  Wrench,
  Handshake, 
  ClipboardList, 
  LogOut,
  MapPin,
  BarChart3,
  MessageCircle,
  IndianRupee
} from 'lucide-react';
import './admin.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Helper to determine title based on route path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/users')) return 'User Directory';
    if (path.includes('/devices')) return 'Device Catalog Management';
    if (path.includes('/brands')) return 'Brand Management';
    if (path.includes('/buy-devices')) return 'Buy Device Inventory';
    if (path.includes('/vendors')) return 'Vendor Management';
    if (path.includes('/custom-pricing')) return 'Custom Pricing';
    if (path.includes('/repair-services')) return 'Repair Services';
    if (path.includes('/chat')) return 'Live Chat';
    if (path.includes('/partners')) return 'Partner Applications';
    if (path.includes('/orders')) return 'System Orders';
    if (path.includes('/pincodes')) return 'Serviceable Pincodes';
    return 'Admin Panel';
  };

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <h1>DeviceKart Admin</h1>
          <span>Control Console</span>
        </div>
        
        <nav className="admin-nav">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/analytics" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 />
            <span>Analytics</span>
          </NavLink>

          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users />
            <span>Users</span>
          </NavLink>

          <NavLink 
            to="/admin/devices" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Smartphone />
            <span>Devices</span>
          </NavLink>

          <NavLink 
            to="/admin/brands" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Tags />
            <span>Brands</span>
          </NavLink>

          <NavLink 
            to="/admin/buy-devices" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ShoppingBag />
            <span>Buy Devices</span>
          </NavLink>

          <NavLink 
            to="/admin/repair-services" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Wrench />
            <span>Repair</span>
          </NavLink>

          <NavLink 
            to="/admin/chat" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <MessageCircle />
            <span>Live Chat</span>
          </NavLink>

          <NavLink 
            to="/admin/partners" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Handshake />
            <span>Partners</span>
          </NavLink>

          <NavLink 
            to="/admin/vendors" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Users />
            <span>Vendors</span>
          </NavLink>

          <NavLink 
            to="/admin/custom-pricing" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <IndianRupee />
            <span>Custom Pricing</span>
          </NavLink>

          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ClipboardList />
            <span>Orders</span>
          </NavLink>

          <NavLink 
            to="/admin/pincodes" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <MapPin />
            <span>Pincodes</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h2>{getPageTitle()}</h2>
          <div className="admin-topbar-actions">
            <span className="admin-badge admin-badge-blue">System Active</span>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
