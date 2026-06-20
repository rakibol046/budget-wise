import { useEffect } from 'react';
import useBudgetStore from '../store/budgetStore.js';

// Fetches and returns insights for a given month
const useInsights = (month) => {
  const { insights, insightsLoading, fetchInsights } = useBudgetStore();

  useEffect(() => {
    if (month) fetchInsights(month);
  }, [month]);

  return { insights, loading: insightsLoading };
};

export default useInsights;
