import { useState } from 'react';
import { formatCurrency } from '../utils/formatters.js';
import useAccountStore from '../store/accountStore.js';
import useAuthStore from '../store/authStore.js';
import ConfirmDialog from './ConfirmDialog.jsx';

const TYPE_LABELS = { savings: 'Savings', checking: 'Checking', credit: 'Credit', cash: 'Cash' };
const TYPE_ICONS = { savings: '🏦', checking: '🏧', credit: '💳', cash: '💵' };

const AdjustModal = ({ account, onClose }) => {
  const [type, setType] = useState('add');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { adjustBalance } = useAccountStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    const ok = await adjustBalance(account._id, { type, amount: parseFloat(amount), note });
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>Adjust Balance</h3>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>{account.name}</p>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['add', 'subtract'].map((t) => (
            <button key={t} onClick={() => setType(t)} style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
              background: type === t ? (t === 'add' ? '#34d399' : '#f87171') : 'var(--color-surface-2)',
              color: type === t ? '#0f1117' : 'var(--color-text-muted)',
            }}>{t === 'add' ? '+ Add Funds' : '- Withdraw'}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" min="0.01" step="0.01" required
            style={{ padding: '10px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '15px', fontFamily: 'var(--font-mono)', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'} />
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" maxLength={100}
            style={{ padding: '10px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '14px', outline: 'none' }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: '#0f1117', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Confirm'}
            </button>
            <button type="button" onClick={onClose} style={{ padding: '11px 18px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AccountCard = ({ account, onEdit }) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { removeAccount } = useAccountStore();
  const { user } = useAuthStore();
  const currency = user?.currency || 'BDT';
  const isNegative = account.balance < 0;

  return (
    <>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '24px',
        borderTopWidth: '3px',
        borderTopColor: account.color || 'var(--color-accent)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>{account.icon || TYPE_ICONS[account.accountType]}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text)' }}>{account.name}</div>
              {account.bankName && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{account.bankName}</div>
              )}
            </div>
          </div>
          <span style={{
            padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
            background: `${account.color || '#4fd1c5'}20`, color: account.color || '#4fd1c5',
          }}>
            {TYPE_LABELS[account.accountType]}
          </span>
        </div>

        {/* Balance */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Balance</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: isNegative ? '#f87171' : '#34d399' }}>
            {formatCurrency(account.balance, currency)}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowAdjust(true)} style={{ flex: 1, padding: '8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
            Adjust
          </button>
          <button onClick={() => onEdit(account)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', cursor: 'pointer' }} title="Edit">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={() => setShowConfirm(true)} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', color: '#f87171', cursor: 'pointer' }} title="Delete">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
          </button>
        </div>

        {account.isDefault && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-accent)', color: '#0f1117', fontWeight: 700 }}>DEFAULT</div>
        )}
      </div>

      {showAdjust && <AdjustModal account={account} onClose={() => setShowAdjust(false)} />}
      {showConfirm && (
        <ConfirmDialog
          message={`Delete "${account.name}"?`}
          subMessage="This cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => { setShowConfirm(false); removeAccount(account._id); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default AccountCard;
