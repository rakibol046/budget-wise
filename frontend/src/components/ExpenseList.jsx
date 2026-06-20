import { useState } from 'react';
import useExpenseStore from '../store/expenseStore.js';
import useCategoryStore from '../store/categoryStore.js';
import useAccountStore from '../store/accountStore.js';
import useAuthStore from '../store/authStore.js';
import { DEFAULT_CATEGORIES, getCategoryBySlug } from '../utils/calculations.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { SkeletonList } from './SkeletonCard.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import { exportExpensesCSV } from '../services/expense.js';
import ConfirmDialog from './ConfirmDialog.jsx';

const CategoryBadge = ({ category, categories }) => {
  const cat = getCategoryBySlug(categories, category);
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '99px',
      fontSize: '11px',
      fontWeight: 600,
      background: `${cat.color}20`,
      color: cat.color,
    }}>
      {cat.icon} {cat.name}
    </span>
  );
};

const Modal = ({ children, onClose }) => (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' }}>
      {children}
    </div>
  </div>
);

const ExpenseList = () => {
  const { expenses, loading, filters, setFilter, fetchExpenses, removeExpense } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { accounts } = useAccountStore();
  const { user } = useAuthStore();
  const currency = user?.currency || 'BDT';
  const [editingExpense, setEditingExpense] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const categoryList = categories.length ? categories : DEFAULT_CATEGORIES;

  const handleFilterChange = (key, value) => {
    setFilter(key, value);
    fetchExpenses({ ...filters, [key]: value });
  };

  const handleDelete = (id) => setConfirmId(id);

  const getAccountName = (accountId) => {
    if (!accountId) return null;
    const acc = accounts.find((a) => a._id === accountId);
    return acc ? `${acc.icon || '🏦'} ${acc.name}` : null;
  };

  return (
    <div>
      {/* Filters + Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="month"
          value={filters.month}
          onChange={(e) => handleFilterChange('month', e.target.value)}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
        />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
        >
          <option value="">All Categories</option>
          {categoryList.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => exportExpensesCSV(expenses, filters.month)}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '8px 16px', background: 'var(--color-accent)', border: 'none', borderRadius: '8px', color: '#0f1117', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Expense Items */}
      {loading ? (
        <SkeletonList rows={6} />
      ) : expenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '15px', margin: 0 }}>No expenses found for this period.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const cat = getCategoryBySlug(categoryList, expense.category);
            const accountName = getAccountName(expense.accountId);
            return (
              <div
                key={expense._id}
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                {/* Category icon circle */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>
                      {expense.note || cat.name}
                    </span>
                    <CategoryBadge category={expense.category} categories={categoryList} />
                    {accountName && (
                      <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                        {accountName}
                      </span>
                    )}
                    {expense.isRecurring && (
                      <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 700 }}>↻ RECURRING</span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{formatDate(expense.date)}</span>
                </div>

                {/* Amount */}
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '15px', color: 'var(--color-text)', flexShrink: 0 }}>
                  {formatCurrency(expense.amount, currency)}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button onClick={() => setEditingExpense(expense)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }} title="Edit">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(expense._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '4px' }} title="Delete">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Expense Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>Add Expense</h2>
          <ExpenseForm onClose={() => setShowForm(false)} onSuccess={() => fetchExpenses()} />
        </Modal>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <Modal onClose={() => setEditingExpense(null)}>
          <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>Edit Expense</h2>
          <ExpenseForm expense={editingExpense} onClose={() => setEditingExpense(null)} onSuccess={() => fetchExpenses()} />
        </Modal>
      )}

      {confirmId && (
        <ConfirmDialog
          message="Delete this expense?"
          confirmLabel="Delete"
          onConfirm={() => { removeExpense(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default ExpenseList;
