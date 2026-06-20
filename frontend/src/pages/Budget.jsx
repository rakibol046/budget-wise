import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import useBudgetStore from '../store/budgetStore.js';
import useCategoryStore from '../store/categoryStore.js';
import useAuthStore from '../store/authStore.js';
import { DEFAULT_CATEGORIES } from '../utils/calculations.js';
import { formatCurrency, formatMonth } from '../utils/formatters.js';

const currentMonth = () => format(new Date(), 'yyyy-MM');

const Budget = () => {
  const [month, setMonth] = useState(currentMonth);
  const [form, setForm] = useState({});
  const { budget, loading, fetchBudget, saveBudget } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { user } = useAuthStore();

  const currency = user?.currency || 'INR';
  // Only show active categories in budget
  const categoryList = (categories.length ? categories : DEFAULT_CATEGORIES).filter(
    (c) => c.isActive !== false
  );

  useEffect(() => {
    const initial = {};
    categoryList.forEach((cat) => { initial[cat.slug] = ''; });
    setForm(initial);
  }, [categoryList.length]);

  useEffect(() => {
    fetchBudget(month);
  }, [month]);

  useEffect(() => {
    if (budget) {
      const filled = {};
      categoryList.forEach((cat) => {
        filled[cat.slug] = budget.categories[cat.slug] || '';
      });
      setForm(filled);
    } else {
      const empty = {};
      categoryList.forEach((cat) => { empty[cat.slug] = ''; });
      setForm(empty);
    }
  }, [budget, categoryList.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoriesPayload = {};
    categoryList.forEach((cat) => {
      categoriesPayload[cat.slug] = parseFloat(form[cat.slug]) || 0;
    });
    await saveBudget(month, categoriesPayload);
  };

  const total = categoryList.reduce((sum, cat) => sum + (parseFloat(form[cat.slug]) || 0), 0);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Monthly Budget</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Set your spending limits for {formatMonth(month)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
          />
          <Link
            to="/categories"
            style={{ padding: '9px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            🏷️ Manage Categories
          </Link>
        </div>
      </div>

      {categoryList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
          <p style={{ fontSize: '15px', margin: '0 0 16px' }}>No active categories found.</p>
          <Link to="/categories" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
            Go to Categories →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', overflow: 'hidden' }}>
            {categoryList.map((cat, index) => (
              <div
                key={cat.slug}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', borderBottom: index < categoryList.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{cat.name}</div>
                  {budget?.categories[cat.slug] > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      Current: {formatCurrency(budget.categories[cat.slug], currency)}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  name={cat.slug}
                  value={form[cat.slug] ?? ''}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="1"
                  style={{ width: '130px', padding: '9px 12px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', fontSize: '14px', fontFamily: 'var(--font-mono)', outline: 'none', textAlign: 'right' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', padding: '20px 24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Budget</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)', marginTop: '4px' }}>
                {formatCurrency(total, currency)}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px 28px', background: 'var(--color-accent)', border: 'none', borderRadius: '10px', color: '#0f1117', fontWeight: 700, fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Saving…' : 'Save Budget'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Budget;
