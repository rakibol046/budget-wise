import { useState } from 'react';
import useAccountStore from '../store/accountStore.js';
import useAuthStore from '../store/authStore.js';
import AccountCard from '../components/AccountCard.jsx';
import { formatCurrency } from '../utils/formatters.js';

const ACCOUNT_TYPES = [
  { value: 'savings',  label: 'Savings' },
  { value: 'debit', label: 'Debit Card' },
  { value: 'credit',   label: 'Credit Card' },
  { value: 'cash',     label: 'Cash' },
];

const COLOR_PRESETS = ['#4fd1c5','#f59e0b','#818cf8','#34d399','#f87171','#60a5fa','#e879f9','#fb923c'];
const ICON_PRESETS  = ['🏦','🏧','💳','💵','💰','🪙','🏪','🏢'];

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

const AccountFormModal = ({ account, onClose }) => {
  const [form, setForm] = useState({
    name: account?.name || '',
    bankName: account?.bankName || '',
    accountType: account?.accountType || 'savings',
    balance: account?.balance ?? '',
    icon: account?.icon || '🏦',
    color: account?.color || '#4fd1c5',
    isDefault: account?.isDefault || false,
  });
  const [loading, setLoading] = useState(false);
  const { addAccount, editAccount } = useAccountStore();
  const isEdit = !!account;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, balance: parseFloat(form.balance) || 0 };
    const ok = isEdit ? await editAccount(account._id, payload) : await addAccount(payload);
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px', overflowY: 'auto' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', margin: 'auto' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
          {isEdit ? 'Edit Account' : 'Add Account'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Account Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Main Savings" required maxLength={60}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          </div>
          <div>
            <label style={labelStyle}>Bank Name</label>
            <input type="text" value={form.bankName} onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))} placeholder="e.g. SBI, HDFC" maxLength={60}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Account Type</label>
              <select value={form.accountType} onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}>
                {ACCOUNT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Opening Balance</label>
              <input type="number" value={form.balance} onChange={(e) => setForm((p) => ({ ...p, balance: e.target.value }))} placeholder="0.00" step="0.01"
                readOnly={isEdit}
                style={{ ...inputStyle, ...(isEdit ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                onFocus={(e) => { if (!isEdit) e.target.style.borderColor = 'var(--color-accent)'; }}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')} />
            </div>
          </div>

          {/* Icon */}
          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ICON_PRESETS.map((icon) => (
                <button key={icon} type="button" onClick={() => setForm((p) => ({ ...p, icon }))}
                  style={{ width: '38px', height: '38px', borderRadius: '8px', border: `2px solid ${form.icon === icon ? 'var(--color-accent)' : 'var(--color-border)'}`, background: 'var(--color-surface-2)', cursor: 'pointer', fontSize: '18px' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label style={labelStyle}>Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map((color) => (
                <button key={color} type="button" onClick={() => setForm((p) => ({ ...p, color }))}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', border: `3px solid ${form.color === color ? 'var(--color-text)' : 'transparent'}`, background: color, cursor: 'pointer', outline: 'none' }} />
              ))}
            </div>
          </div>

          {/* Default */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
              style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }} />
            <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>Set as default account</span>
          </label>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: '#0f1117', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : isEdit ? 'Update Account' : 'Add Account'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '11px 18px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Accounts = () => {
  const { accounts, netWorth, loading } = useAccountStore();
  const { user } = useAuthStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const currency = user?.currency || 'BDT';
  const isNegativeNet = netWorth < 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Accounts</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>Track your balances across all accounts</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', background: 'var(--color-accent)', border: 'none', borderRadius: '10px', color: '#0f1117', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
          + Add Account
        </button>
      </div>

      {/* Net Worth Banner */}
      <div style={{ background: 'var(--color-surface)', border: `1px solid ${isNegativeNet ? '#f87171' : 'var(--color-border)'}`, borderRadius: '16px', padding: '24px 32px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '6px' }}>Total Net Worth</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 700, color: isNegativeNet ? '#f87171' : '#34d399' }}>
            {formatCurrency(netWorth, currency)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Accounts</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px', color: 'var(--color-text)' }}>{accounts.length}</div>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      {loading && !accounts.length ? (
        <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '60px' }}>Loading accounts…</div>
      ) : accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏦</div>
          <p style={{ fontSize: '15px', margin: 0 }}>No accounts yet. Add one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {accounts.map((account) => (
            <AccountCard key={account._id} account={account} onEdit={setEditingAccount} />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAdd && <AccountFormModal onClose={() => setShowAdd(false)} />}
      {editingAccount && <AccountFormModal account={editingAccount} onClose={() => setEditingAccount(null)} />}
    </div>
  );
};

export default Accounts;
