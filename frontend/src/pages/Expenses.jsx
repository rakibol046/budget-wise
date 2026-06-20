import { useEffect } from 'react';
import useExpenseStore from '../store/expenseStore.js';
import ExpenseList from '../components/ExpenseList.jsx';

const Expenses = () => {
  const { filters, fetchExpenses } = useExpenseStore();

  useEffect(() => {
    fetchExpenses(filters);
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text)' }}>Expenses</h1>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Track and manage all your spending
        </p>
      </div>
      <ExpenseList />
    </div>
  );
};

export default Expenses;
