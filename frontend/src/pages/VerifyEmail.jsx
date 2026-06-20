import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendOtp } from '../services/auth.js';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (value && index === 5) {
      const otp = next.join('');
      if (otp.length === 6) submitOtp(otp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setDigits(next);
      inputRefs.current[5]?.focus();
      submitOtp(pasted);
    }
    e.preventDefault();
  };

  const submitOtp = async (otp) => {
    if (!email) {
      toast.error('Email address is missing. Please register again.');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyEmail({ email, otp });
      // Backend now returns JWT — auto-login the user
      const { token, user } = res.data;
      setAuth(user, token);
      toast.success('Email verified! Please choose your currency.');
      navigate('/select-currency');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;
    setResendLoading(true);
    try {
      await resendOtp({ email });
      toast.success('A new OTP has been sent to your email.');
      setCountdown(RESEND_COOLDOWN);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length === 6) submitOtp(otp);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ground)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📬</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Verify Your Email</h1>
          <p style={{ margin: '12px 0 0', color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            We sent a 6-digit code to<br />
            <strong style={{ color: 'var(--color-text)' }}>{email || 'your email address'}</strong>
          </p>
        </div>

        <form onSubmit={handleManualSubmit}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }} onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                style={{
                  width: '48px', height: '56px', textAlign: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700,
                  color: 'var(--color-accent)',
                  background: 'var(--color-surface-2)',
                  border: `2px solid ${digit ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '10px', outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={(e) => (e.target.style.borderColor = digit ? 'var(--color-accent)' : 'var(--color-border)')}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.join('').length < 6}
            style={{ width: '100%', padding: '13px', background: 'var(--color-accent)', border: 'none', borderRadius: '10px', color: '#0f1117', fontWeight: 700, fontSize: '15px', cursor: (loading || digits.join('').length < 6) ? 'not-allowed' : 'pointer', opacity: (loading || digits.join('').length < 6) ? 0.7 : 1 }}
          >
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resendLoading}
            style={{ background: 'none', border: 'none', cursor: (countdown > 0 || resendLoading) ? 'not-allowed' : 'pointer', color: (countdown > 0 || resendLoading) ? 'var(--color-text-muted)' : 'var(--color-accent)', fontSize: '14px', fontWeight: 600, padding: 0 }}
          >
            {resendLoading ? 'Sending…' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Wrong account?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>Register again</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
