import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { groupByCategory, groupByWeek, groupByMonth, groupByYear } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatters.js';
import useExpenseStore from '../store/expenseStore.js';

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: 'var(--color-text)' }}>
      {label && <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: '2px 0', color: entry.color || entry.fill }}>
          {entry.name}: {formatCurrency(entry.value, currency)}
        </p>
      ))}
    </div>
  );
};

export const SpendingPieChart = ({ expenses, categories, currency = 'INR' }) => {
  const data = groupByCategory(expenses, categories);
  if (!data.length) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>No spending data for this period</div>
  );
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} strokeWidth={0}>
          {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
        </Pie>
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend formatter={(v) => <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const WeeklyBarChart = ({ expenses, categories, currency = 'INR' }) => {
  const data = groupByWeek(expenses, categories);
  if (!data.length) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>No spending data for this period</div>
  );
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={(p) => <CustomTooltip {...p} currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend formatter={(v) => <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{categories.find(c => c.slug === v)?.name || v}</span>} />
        {categories.map((cat) => (
          <Bar key={cat.slug} dataKey={cat.slug} name={cat.name} fill={cat.color} radius={[3, 3, 0, 0]} maxBarSize={20} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

const MonthlyBarChart = ({ year, currency }) => {
  const { yearlyExpenses, yearlyLoading } = useExpenseStore();
  const expenses = yearlyExpenses[String(year)] || [];
  const data = groupByMonth(expenses);

  if (yearlyLoading && !expenses.length) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>Loading monthly data…</div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={(p) => <CustomTooltip {...p} currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend formatter={(v) => <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>} />
        <Bar dataKey="spent"   name="Spent"   fill="#f87171" radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="budget"  name="Budget"  fill="#4fd1c5" radius={[3, 3, 0, 0]} maxBarSize={20} />
        <Bar dataKey="savings" name="Savings" fill="#34d399" radius={[3, 3, 0, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const YearlyBarChart = ({ currency }) => {
  const { yearlyExpenses, yearlyLoading } = useExpenseStore();
  const data = groupByYear(yearlyExpenses);

  if (yearlyLoading && !data.length) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>Loading yearly data…</div>
  );
  if (!data.length) return (
    <div className="flex items-center justify-center h-64" style={{ color: 'var(--color-text-muted)' }}>No yearly data available</div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={(p) => <CustomTooltip {...p} currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Legend formatter={(v) => <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{v.charAt(0).toUpperCase() + v.slice(1)}</span>} />
        <Bar dataKey="spent"   name="Spent"   fill="#f87171" radius={[3, 3, 0, 0]} maxBarSize={28} />
        <Bar dataKey="budget"  name="Budget"  fill="#4fd1c5" radius={[3, 3, 0, 0]} maxBarSize={28} />
        <Bar dataKey="savings" name="Savings" fill="#34d399" radius={[3, 3, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PERIODS = ['weekly', 'monthly', 'yearly'];

export const TimelineChart = ({ expenses, month, categories, currency }) => {
  const [period, setPeriod] = useState('weekly');
  const year = month ? month.split('-')[0] : String(new Date().getFullYear());
  const { fetchYearly } = useExpenseStore();

  useEffect(() => {
    if (period === 'monthly' || period === 'yearly') {
      fetchYearly(year);
      if (period === 'yearly') {
        fetchYearly(String(parseInt(year) - 1));
        fetchYearly(String(parseInt(year) - 2));
      }
    }
  }, [period, year]);

  return (
    <div>
      {/* Period toggle */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              background: period === p ? 'var(--color-accent)' : 'var(--color-surface-2)',
              color: period === p ? '#0f1117' : 'var(--color-text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {period === 'weekly'  && <WeeklyBarChart expenses={expenses} categories={categories} currency={currency} />}
      {period === 'monthly' && <MonthlyBarChart year={year} currency={currency} />}
      {period === 'yearly'  && <YearlyBarChart currency={currency} />}
    </div>
  );
};
