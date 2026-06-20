import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, resendOtp } from '../services/auth.js';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      const { token, user, recurringAdded } = res.data;
      setAuth(user, token);
      if (recurringAdded > 0) toast.success(`✓ ${recurringAdded} recurring expense(s) added`);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || 'Login failed';

      // Unverified account — resend OTP and redirect to verify page
      if (status === 403) {
        toast.loading('Sending verification code…', { id: 'otp-resend' });
        try {
          await resendOtp({ email: form.email });
          toast.success('A verification code has been sent to your email.', { id: 'otp-resend' });
        } catch {
          toast.dismiss('otp-resend');
          toast('Redirecting to verification page…', { icon: '📬' });
        }
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ground)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>BudgetWise</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Sign in to manage your finances
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AuthInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          <AuthInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '13px', background: 'var(--color-accent)', border: 'none', borderRadius: '10px', color: '#0f1117', fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{ marginTop: '20px', padding: '12px', background: 'var(--color-surface-2)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Demo: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>rakib.fullstack.dev@gmail.com</span> / <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>123456</span>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

const AuthInput = ({ label, name, type, value, onChange, placeholder }) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
      {label}
    </label>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      style={{ width: '100%', padding: '11px 14px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
      onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
    />
  </div>
);

export default Login;
