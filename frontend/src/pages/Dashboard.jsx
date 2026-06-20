import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import useInsights from '../hooks/useInsights.js';
import useExpenseStore from '../store/expenseStore.js';
import useCategoryStore from '../store/categoryStore.js';
import useAccountStore from '../store/accountStore.js';
import useAuthStore from '../store/authStore.js';
import SummaryCard from '../components/SummaryCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { SpendingPieChart, TimelineChart } from '../components/Charts.jsx';
import { formatCurrency, formatPercent, formatMonth } from '../utils/formatters.js';
import { DEFAULT_CATEGORIES, getCategoryBySlug } from '../utils/calculations.js';

const currentMonth = () => format(new Date(), 'yyyy-MM');

const InsightBanner = ({ warning, message }) => {
  if (warning === 'safe') return null;
  const colors = {
    warning: { bg: '#f59e0b20', border: '#f59e0b', text: '#f59e0b' },
    danger:  { bg: '#f8717120', border: '#f87171', text: '#f87171' },
  };
  const c = colors[warning] || colors.warning;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <span style={{ fontSize: '20px' }}>{warning === 'danger' ? '🚨' : '⚠️'}</span>
      <span style={{ color: c.text, fontWeight: 600, fontSize: '14px' }}>{message}</span>
    </div>
  );
};

const Dashboard = () => {
  const [month, setMonth] = useState(currentMonth);
  const { insights, loading } = useInsights(month);
  const { expenses, fetchExpenses } = useExpenseStore();
  const { categories } = useCategoryStore();
  const { netWorth } = useAccountStore();
  const { user } = useAuthStore();

  const currency = user?.currency || 'INR';
  const categoryList = categories.length ? categories : DEFAULT_CATEGORIES;

  useEffect(() => {
    fetchExpenses({ month });
  }, [month]);

  const warning = insights?.warning || 'safe';
  const warningMessage = {
    danger:  `⚡ You've used ${formatPercent(insights?.percentage)} of your budget — overspending risk!`,
    warning: `You've used ${formatPercent(insights?.percentage)} of your budget. Keep an eye on spending.`,
  }[warning];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>{formatMonth(month)}</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text)', padding: '8px 12px', fontSize: '14px', outline: 'none' }}
        />
      </div>

      {/* Warning banner */}
      {insights && <InsightBanner warning={warning} message={warningMessage} />}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <SummaryCard title="Total Budget" value={insights?.totalBudget || 0} type="budget" warning="safe" subtitle="Monthly allocation" currency={currency} />
            <SummaryCard title="Total Spent" value={insights?.totalSpent || 0} type="spent" warning={warning} subtitle={`${insights?.expenseCount || expenses.length} transactions`} currency={currency} />
            <SummaryCard title="Remaining" value={insights?.remaining || 0} type="remaining" warning={(insights?.remaining ?? 1) < 0 ? 'danger' : 'safe'} subtitle="Available balance" currency={currency} />
            <SummaryCard title="Spent" value={insights?.percentage || 0} type="percent" warning={warning} isPercent subtitle="Of total budget" />
            <SummaryCard title="Net Worth" value={netWorth} type="budget" warning={netWorth < 0 ? 'danger' : 'safe'} subtitle="All accounts" currency={currency} />
          </>
        )}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Pie chart */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Category Breakdown</h2>
          <SpendingPieChart expenses={expenses} categories={categoryList} currency={currency} />
        </div>

        {/* Timeline chart (weekly/monthly/yearly) */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Spending Trend</h2>
          <TimelineChart expenses={expenses} month={month} categories={categoryList} currency={currency} />
        </div>
      </div>

      {/* Smart Insights */}
      {insights && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {/* Top category */}
          <InsightCard title="Highest Spending" icon="🏆">
            {insights.topCategory ? (() => {
              const cat = getCategoryBySlug(categoryList, insights.topCategory);
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '99px', background: `${cat.color}20`, color: cat.color, fontWeight: 700, fontSize: '14px' }}>
                    {cat.icon} {cat.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-text)' }}>
                    {formatCurrency(insights.byCat?.[insights.topCategory] || 0, currency)}
                  </span>
                </div>
              );
            })() : <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>No data yet</span>}
          </InsightCard>

          {/* Daily average */}
          <InsightCard title="Daily Average" icon="📅">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>
              {formatCurrency(insights.dailyAvg, currency)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
              over {insights.daysPassed} day{insights.daysPassed !== 1 ? 's' : ''}
            </span>
          </InsightCard>

          {/* Prediction */}
          <InsightCard title="Predicted Month-End" icon="🔮">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 700, color: insights.predicted > insights.totalBudget ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {formatCurrency(insights.predicted, currency)}
            </span>
            {insights.predicted > insights.totalBudget && (
              <span style={{ fontSize: '11px', color: 'var(--color-danger)', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                {formatCurrency(insights.predicted - insights.totalBudget, currency)} over budget
              </span>
            )}
          </InsightCard>
        </div>
      )}

      {/* Category budget breakdown */}
      {insights?.budgetByCat && Object.keys(insights.budgetByCat).length > 0 && (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Budget by Category</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(insights.budgetByCat).map(([slug, data]) => (
              <CategoryRow key={slug} slug={slug} data={data} categoryList={categoryList} currency={currency} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const InsightCard = ({ title, icon, children }) => (
  <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
    </div>
    {children}
  </div>
);

const CategoryRow = ({ slug, data, categoryList, currency }) => {
  const cat = getCategoryBySlug(categoryList, slug);
  const pct = Math.min(data.percentage, 100);
  const color = pct >= 80 ? 'var(--color-danger)' : pct >= 60 ? 'var(--color-warning)' : 'var(--color-safe)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{cat.icon}</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>{cat.name}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color, fontWeight: 600 }}>
            {formatCurrency(data.spent, currency)}
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
            {' '}/ {formatCurrency(data.budget, currency)}
          </span>
        </div>
      </div>
      <div style={{ height: '6px', background: 'var(--color-surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
};

export default Dashboard;
