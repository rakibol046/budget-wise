import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import useCurrencyStore from '../store/currencyStore.js';
import { updateProfile, updatePassword, updateSettings } from '../services/auth.js';
import toast from 'react-hot-toast';

const inputStyle = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--color-text-muted)',
  marginBottom: '6px',
};

const Section = ({ title, children }) => (
  <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
    <h2 style={{ margin: '0 0 24px', fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>{title}</h2>
    {children}
  </div>
);

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const { currencies, fetchCurrencies } = useCurrencyStore();

  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [currency, setCurrency] = useState(user?.currency || 'BDT');
  const [currencyLoading, setCurrencyLoading] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileLoading(true);
    try {
      const res = await updateProfile({ name: name.trim() });
      updateUser({ name: res.data.user.name });
      toast.success('Name updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await updatePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleCurrencySave = async () => {
    setCurrencyLoading(true);
    try {
      const res = await updateSettings({ currency });
      updateUser({ currency: res.data.user.currency });
      toast.success('Currency updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update currency');
    } finally {
      setCurrencyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ margin: '0 0 28px', fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Settings</h1>

      {/* Profile */}
      <Section title="Profile">
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required maxLength={60}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={user?.email || ''} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>Email cannot be changed after registration.</p>
          </div>
          <div>
            <button type="submit" disabled={profileLoading} style={{ padding: '10px 24px', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: '#0f1117', fontWeight: 700, fontSize: '14px', cursor: profileLoading ? 'not-allowed' : 'pointer', opacity: profileLoading ? 0.7 : 1 }}>
              {profileLoading ? 'Saving…' : 'Save Name'}
            </button>
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change Password">
        <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          </div>
          <div>
            <button type="submit" disabled={pwLoading} style={{ padding: '10px 24px', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: '#0f1117', fontWeight: 700, fontSize: '14px', cursor: pwLoading ? 'not-allowed' : 'pointer', opacity: pwLoading ? 0.7 : 1 }}>
              {pwLoading ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Currency */}
      <Section title="Preferences">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={labelStyle}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}>
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={handleCurrencySave} disabled={currencyLoading} style={{ padding: '10px 24px', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: '#0f1117', fontWeight: 700, fontSize: '14px', cursor: currencyLoading ? 'not-allowed' : 'pointer', opacity: currencyLoading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
            {currencyLoading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Section>

      {/* Quick links */}
      <Section title="Quick Links">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/categories" style={{ padding: '10px 20px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏷️ Manage Categories
          </Link>
          <Link to="/accounts" style={{ padding: '10px 20px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏦 Manage Accounts
          </Link>
        </div>
      </Section>
    </div>
  );
};

export default Settings;
