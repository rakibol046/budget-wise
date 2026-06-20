import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { to: '/dashboard',  label: 'Dashboard' },
  { to: '/expenses',   label: 'Expenses' },
  { to: '/budget',     label: 'Budget' },
  { to: '/accounts',   label: 'Accounts' },
  { to: '/categories', label: 'Categories' },
  { to: '/settings',   label: 'Settings' },
];

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') !== 'light'
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '0 20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '20px' }}>💰</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px', color: 'var(--color-accent)', letterSpacing: '-0.5px' }}>
            BudgetWise
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} active={isActive(to)}>{label}</NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Dark mode */}
          <button
            onClick={() => setIsDark((d) => !d)}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* User menu (desktop) */}
          <div className="hidden md:block" style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--color-text)', fontSize: '13px' }}
            >
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-accent)', color: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</span>
            </button>

            {userMenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px', minWidth: '170px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 50 }}
                onMouseLeave={() => setUserMenuOpen(false)}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{user?.email}</div>
                </div>
                <MenuLink to="/settings" onClick={() => setUserMenuOpen(false)}>Settings</MenuLink>
                <button onClick={handleLogout} style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#f87171', fontSize: '13px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="flex md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, background: 'var(--color-surface)', zIndex: 39, overflowY: 'auto', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ padding: '16px' }}>
            {/* User info */}
            <div style={{ padding: '14px 16px', background: 'var(--color-surface-2)', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-accent)', color: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, flexShrink: 0 }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              {NAV_LINKS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    padding: '13px 16px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontWeight: isActive(to) ? 700 : 500,
                    color: isActive(to) ? 'var(--color-accent)' : 'var(--color-text)',
                    background: isActive(to) ? `var(--color-accent)15` : 'transparent',
                    borderLeft: isActive(to) ? '3px solid var(--color-accent)' : '3px solid transparent',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <button onClick={handleLogout} style={{ width: '100%', padding: '13px', background: 'transparent', border: '1px solid #f87171', borderRadius: '10px', color: '#f87171', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    style={{
      padding: '6px 11px',
      borderRadius: '8px',
      textDecoration: 'none',
      fontSize: '13px',
      fontWeight: active ? 700 : 500,
      color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
      background: active ? `var(--color-accent)15` : 'transparent',
      borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
      transition: 'all 0.15s',
    }}
    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'var(--color-surface-2)'; } }}
    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
  >
    {children}
  </Link>
);

const MenuLink = ({ to, onClick, children }) => (
  <Link to={to} onClick={onClick} style={{ display: 'block', padding: '10px 14px', textDecoration: 'none', color: 'var(--color-text)', fontSize: '13px' }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
    {children}
  </Link>
);

export default Navbar;
