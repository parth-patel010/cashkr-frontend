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
  Globe,
  Settings,
  Tag,
  Bell,
  Shield,
  ListChecks,
  Inbox,
  FlaskConical,
  Bot,
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
    if (path.match(/\/vendors\/[^/]+/)) return 'Vendor Details';
    if (path.includes('/vendors')) return 'Vendor Management';
    if (path.includes('/website-settings')) return 'Website Settings';
    if (path.includes('/app-settings')) return 'App Settings';
    if (path.includes('/offers')) return 'Offers';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/category-quizzes')) return 'Category Quizzes';
    if (path.includes('/valuation-test')) return 'Valuation Test';
    if (path.includes('/pricing-agent')) return 'Pricing Agent';
    if (path.includes('/security-audit')) return 'Security Audit';
    if (path.includes('/repair-services')) return 'Repair Prices (Model-wise)';
    if (path.includes('/leads')) return 'Leads (TV / Fridge / Repair)';
    if (path.includes('/chat')) return 'Live Chat';
    if (path.includes('/partners')) return 'Partners';
    if (path.includes('/orders')) return 'Orders';
    if (path.includes('/pincodes')) return 'Pincodes';
    return 'Admin';
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
            to="/admin/offers" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Tag />
            <span>Offers</span>
          </NavLink>

          <NavLink 
            to="/admin/notifications" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Bell />
            <span>Notifications</span>
          </NavLink>

          <NavLink 
            to="/admin/category-quizzes" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ListChecks />
            <span>Category Quizzes</span>
          </NavLink>

          <NavLink 
            to="/admin/valuation-test" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <FlaskConical />
            <span>Valuation Test</span>
          </NavLink>

          <NavLink 
            to="/admin/pricing-agent" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Bot />
            <span>Pricing Agent</span>
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
            to="/admin/website-settings" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Globe />
            <span>Website Settings</span>
          </NavLink>

          <NavLink 
            to="/admin/app-settings" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings />
            <span>App Settings</span>
          </NavLink>

          <NavLink 
            to="/admin/security-audit" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Shield />
            <span>Security Audit</span>
          </NavLink>

          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <ClipboardList />
            <span>Orders</span>
          </NavLink>

          <NavLink 
            to="/admin/leads" 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <Inbox />
            <span>Leads</span>
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
