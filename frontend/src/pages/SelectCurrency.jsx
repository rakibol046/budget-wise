import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import useCurrencyStore from '../store/currencyStore.js';
import { updateSettings } from '../services/auth.js';
import toast from 'react-hot-toast';

const SelectCurrency = () => {
  const { user, updateUser } = useAuthStore();
  const { currencies, fetchCurrencies } = useCurrencyStore();
  const [selected, setSelected] = useState(user?.currency || '');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleSave = async () => {
    if (!selected) {
      toast.error('Please select a currency to continue.');
      return;
    }
    setSaving(true);
    try {
      const res = await updateSettings({ currency: selected });
      updateUser({ currency: res.data.user.currency });
      toast.success('Currency set!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save currency');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-ground)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💱</div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: 'var(--color-text)' }}>Select Your Currency</h1>
          <p style={{ margin: '10px 0 0', color: 'var(--color-text-muted)', fontSize: '15px' }}>
            This sets your default currency across the app. You can change it later in Settings.
          </p>
        </div>

        {/* Currency grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {currencies.map((cur) => {
            const isSelected = selected === cur.code;
            return (
              <button
                key={cur.code}
                onClick={() => setSelected(cur.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 18px',
                  background: isSelected ? `var(--color-accent)15` : 'var(--color-surface)',
                  border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: isSelected ? 'var(--color-accent)' : 'var(--color-text)', minWidth: '32px' }}>
                  {cur.symbol}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--color-accent)' : 'var(--color-text)' }}>
                    {cur.code}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {cur.name}
                  </div>
                </div>
                {isSelected && (
                  <span style={{ marginLeft: 'auto', color: 'var(--color-accent)', fontSize: '18px' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={!selected || saving}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: '12px',
            color: '#0f1117',
            fontWeight: 700,
            fontSize: '16px',
            cursor: (!selected || saving) ? 'not-allowed' : 'pointer',
            opacity: (!selected || saving) ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : `Continue with ${selected || '—'}`}
        </button>
      </div>
    </div>
  );
};

export default SelectCurrency;
