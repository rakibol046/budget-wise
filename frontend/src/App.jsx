import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore.js';
import useCategoryStore from './store/categoryStore.js';
import useAccountStore from './store/accountStore.js';
import useCurrencyStore from './store/currencyStore.js';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import SelectCurrency from './pages/SelectCurrency.jsx';
import Budget from './pages/Budget.jsx';
import Expenses from './pages/Expenses.jsx';
import Settings from './pages/Settings.jsx';
import Accounts from './pages/Accounts.jsx';
import Categories from './pages/Categories.jsx';

// Restore theme preference on app load
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const Layout = ({ children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--color-ground)' }}>
    <Navbar />
    <main>{children}</main>
  </div>
);

const App = () => {
  const { isAuthenticated } = useAuthStore();
  const { fetchCurrencies } = useCurrencyStore();

  // Fetch currencies on mount — public endpoint, no auth needed
  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Initialise per-user stores when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      useCategoryStore.getState().init();
      useAccountStore.getState().init();
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"        element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register"     element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Post-registration currency selection — protected (auto-login after OTP) */}
      <Route path="/select-currency" element={<ProtectedRoute><SelectCurrency /></ProtectedRoute>} />

      {/* Protected app routes */}
      <Route path="/dashboard"  element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/expenses"   element={<ProtectedRoute><Layout><Expenses /></Layout></ProtectedRoute>} />
      <Route path="/budget"     element={<ProtectedRoute><Layout><Budget /></Layout></ProtectedRoute>} />
      <Route path="/accounts"   element={<ProtectedRoute><Layout><Accounts /></Layout></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><Layout><Categories /></Layout></ProtectedRoute>} />
      <Route path="/settings"   element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
