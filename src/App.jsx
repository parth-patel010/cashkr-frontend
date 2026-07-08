import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/navbar.jsx';
import Footer from './components/footer.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminProtectedRoute from './components/layout/AdminProtectedRoute';
import './index.css';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import BrandSelectionPage from './pages/BrandSelectionPage.jsx';
import ModelSelectionPage from './pages/ModelSelectionPage.jsx';
import VariantSelectionPage from './pages/VariantSelectionPage.jsx';
import ConditionQuizPage from './pages/ConditionQuizPage.jsx';
import SchedulePickupPage from './pages/SchedulePickupPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Partner from './pages/Partner.jsx';
import Corporate from './pages/Corporate.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsAndConditions from './pages/TermsAndConditions.jsx';
import FAQPage from './pages/FAQPage.jsx';
import CompareDeviceKartVsCashify from './pages/CompareDeviceKartVsCashify.jsx';
import CashifyAlternatives from './pages/CashifyAlternatives.jsx';
import BestPlaceToSellPhone from './pages/BestPlaceToSellPhone.jsx';
import CityLandingPage from './pages/CityLandingPage.jsx';
import CategoryHubPage from './pages/CategoryHubPage.jsx';
import { CATEGORY_HUBS } from './data/categoryHubs.js';
import WhatsAppButton from './components/WhatsAppButton.jsx';

// Laptop Pages
import LaptopBrandSelectionPage from './pages/LaptopBrandSelectionPage.jsx';
import LaptopModelSelectionPage from './pages/LaptopModelSelectionPage.jsx';
import LaptopModelDetailsPage from './pages/LaptopModelDetailsPage.jsx';
import LaptopConditionQuizPage from './pages/LaptopConditionQuizPage.jsx';

// Mac Pages
import MacBrandSelectionPage from './pages/MacBrandSelectionPage.jsx';
import MacModelSelectionPage from './pages/MacModelSelectionPage.jsx';
import MacModelDetailsPage from './pages/MacModelDetailsPage.jsx';
import MacConditionQuizPage from './pages/MacConditionQuizPage.jsx';

// Tablet Pages
import TabletBrandSelectionPage from './pages/TabletBrandSelectionPage.jsx';
import TabletModelSelectionPage from './pages/TabletModelSelectionPage.jsx';
import TabletVariantSelectionPage from './pages/TabletVariantSelectionPage.jsx';
import TabletConditionQuizPage from './pages/TabletConditionQuizPage.jsx';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminDevices from './pages/admin/AdminDevices.jsx';
import AdminPartners from './pages/admin/AdminPartners.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminPincodes from './pages/admin/AdminPincodes.jsx';

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          {/* Mobile flow */}
          <Route path="/sell-old-mobile-phones/brand" element={<BrandSelectionPage />} />
          <Route path="/sell-old-mobile-phones/:brand" element={<ModelSelectionPage />} />
          <Route path="/sell-old-mobile-phones/:brand/:slug" element={<VariantSelectionPage />} />
          <Route path="/sell-old-mobile-phones/:brand/:slug/quiz" element={<ConditionQuizPage />} />
          {/* Laptop flow */}
          <Route path="/sell-old-laptops/brand" element={<LaptopBrandSelectionPage />} />
          <Route path="/sell-old-laptops/:brand" element={<LaptopModelSelectionPage />} />
          <Route path="/sell-old-laptops/:brand/:slug" element={<LaptopModelDetailsPage />} />
          <Route path="/sell-old-laptops/:brand/:slug/quiz" element={<LaptopConditionQuizPage />} />
          {/* Mac flow */}
          <Route path="/sell-imac/brand" element={<MacBrandSelectionPage />} />
          <Route path="/sell-imac/:brand" element={<MacModelSelectionPage />} />
          <Route path="/sell-imac/:brand/:slug" element={<MacModelDetailsPage />} />
          <Route path="/sell-imac/:brand/:slug/quiz" element={<MacConditionQuizPage />} />
          {/* Tablet flow */}
          <Route path="/sell-tablet/brand" element={<TabletBrandSelectionPage />} />
          <Route path="/sell-tablet/:brand" element={<TabletModelSelectionPage />} />
          <Route path="/sell-tablet/:brand/:slug" element={<TabletVariantSelectionPage />} />
          <Route path="/sell-tablet/:brand/:slug/quiz" element={<TabletConditionQuizPage />} />
          {/* Shared */}

          <Route path="/schedule-pickup" element={<ProtectedRoute><SchedulePickupPage /></ProtectedRoute>} />
          <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="/orders/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/corporate" element={<Corporate />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/compare/devicekart-vs-cashify" element={<CompareDeviceKartVsCashify />} />
          <Route path="/alternatives/cashify-alternatives" element={<CashifyAlternatives />} />
          <Route path="/best-place-to-sell-old-phone-india" element={<BestPlaceToSellPhone />} />
          <Route path="/sell-old-phone-in/:city" element={<CityLandingPage />} />
          {CATEGORY_HUBS.map((hub) => (
            <Route key={hub.slug} path={`/${hub.slug}`} element={<CategoryHubPage />} />
          ))}

          {/* Admin Flow */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="devices" element={<AdminDevices />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="pincodes" element={<AdminPincodes />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      <WhatsAppButton />
    </>
  );
}

export default App;