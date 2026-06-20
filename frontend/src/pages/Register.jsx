import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/auth.js';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      const { email } = res.data;
      toast.success('Account created! Please verify your email.');
      navigate(`/verify-email?email=${encodeURIComponent(email || form.email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ground)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>💰</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Create Account</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Start managing your budget today
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AuthInput label="Full Name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="John Doe" />
          <AuthInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          <AuthInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" />

          <button
            type="submit"
            disabled={loading}
            style={{ padding: '13px', background: 'var(--color-accent)', border: 'none', borderRadius: '10px', color: '#0f1117', fontWeight: 700, fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
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

export default Register;
