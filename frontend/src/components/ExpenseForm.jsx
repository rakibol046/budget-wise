import { useState, useEffect } from 'react';
import useExpenseStore from '../store/expenseStore.js';
import useCategoryStore from '../store/categoryStore.js';
import useAccountStore from '../store/accountStore.js';
import { DEFAULT_CATEGORIES } from '../utils/calculations.js';
import { toInputDate } from '../utils/formatters.js';

const inputStyle = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text)',
  padding: '10px 12px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
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

const EMPTY = {
  amount: '',
  category: '',
  accountId: '',
  date: toInputDate(),
  note: '',
  isRecurring: false,
};

const ExpenseForm = ({ expense, onClose, onSuccess }) => {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const { addExpense, editExpense } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const isEdit = !!expense;

  const categoryList = categories.length ? categories : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (expense) {
      setForm({
        amount: expense.amount,
        category: expense.category,
        accountId: expense.accountId || '',
        date: toInputDate(expense.date),
        note: expense.note || '',
        isRecurring: expense.isRecurring || false,
      });
    } else {
      setForm((prev) => ({
        ...EMPTY,
        category: categoryList[0]?.slug || '',
      }));
    }
  }, [expense, categoryList.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setSubmitting(true);

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      accountId: form.accountId || null,
    };

    let ok;
    if (isEdit) {
      ok = await editExpense(expense._id, payload);
    } else {
      ok = await addExpense(payload);
    }

    setSubmitting(false);
    if (ok) {
      onSuccess?.();
      onClose?.();
      if (!isEdit) setForm({ ...EMPTY, category: categoryList[0]?.slug || '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <label style={labelStyle}>Amount</label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        >
          {categoryList.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Account (optional) */}
      {accounts.length > 0 && (
        <div>
          <label style={labelStyle}>Account (optional)</label>
          <select
            name="accountId"
            value={form.accountId}
            onChange={handleChange}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          >
            <option value="">No account</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.icon || '🏦'} {acc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div>
        <label style={labelStyle}>Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Note */}
      <div>
        <label style={labelStyle}>Note (optional)</label>
        <input
          type="text"
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="What was this for?"
          maxLength={200}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Recurring */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          name="isRecurring"
          checked={form.isRecurring}
          onChange={handleChange}
          style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
        />
        <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>Mark as recurring monthly expense</span>
      </label>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            background: 'var(--color-accent)',
            color: '#0f1117',
            border: 'none',
            borderRadius: '8px',
            padding: '11px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '11px 20px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
