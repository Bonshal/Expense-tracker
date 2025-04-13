import { useMemo } from 'react';
import { useExpenses } from './useExpenses';

interface CategoryTotal {
  category: string;
  total: number;
}

interface MonthlyTotal {
  month: string;
  total: number;
}

interface CategoryDataPoint {
  x: string;
  y: number;
}

export function useAnalytics() {
  const { expenses } = useExpenses();

  // Process data for category breakdown
  const categoryData = useMemo(() => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return [];
    }

    try {
      const categoryTotals = expenses.reduce((acc, expense) => {
        if (!expense) return acc;
        
        const category = expense.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + (expense.amount || 0);
        return acc;
      }, {} as { [key: string]: number });

      return Object.entries(categoryTotals)
        .map(([category, total]) => ({
          x: category,
          y: total,
        }))
        .sort((a, b) => b.y - a.y); // Sort by amount descending
    } catch (error) {
      console.error("Error processing category data:", error);
      return [];
    }
  }, [expenses]);

  // Process data for monthly trend
  const monthlyData = useMemo(() => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return [];
    }

    try {
      const monthlyTotals = expenses.reduce((acc, expense) => {
        if (!expense || !expense.date) return acc;
        
        try {
          const date = new Date(expense.date);
          if (isNaN(date.getTime())) return acc;
          
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          acc[monthKey] = (acc[monthKey] || 0) + (expense.amount || 0);
        } catch (e) {
          console.error("Error processing date in monthly data:", e);
        }
        return acc;
      }, {} as { [key: string]: number });

      return Object.entries(monthlyTotals)
        .map(([month, total]) => ({
          x: month,
          y: total,
        }))
        .sort((a, b) => a.x.localeCompare(b.x)); // Sort by date
    } catch (error) {
      console.error("Error processing monthly data:", error);
      return [];
    }
  }, [expenses]);

  // Get top categories
  const topCategories = useMemo(() => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return [];
    }

    try {
      const categoryTotals = expenses.reduce((acc, expense) => {
        if (!expense) return acc;
        
        const category = expense.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + (expense.amount || 0);
        return acc;
      }, {} as { [key: string]: number });

      return Object.entries(categoryTotals)
        .map(([category, total]) => ({
          category,
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5); // Get top 5 categories
    } catch (error) {
      console.error("Error processing top categories:", error);
      return [];
    }
  }, [expenses]);

  // Calculate total spending
  const totalSpending = useMemo(() => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return 0;
    }

    try {
      return expenses.reduce((sum, expense) => {
        if (!expense || typeof expense.amount !== 'number') return sum;
        return sum + expense.amount;
      }, 0);
    } catch (error) {
      console.error("Error calculating total spending:", error);
      return 0;
    }
  }, [expenses]);

  // Calculate average spending per category
  const averageSpendingPerCategory = useMemo(() => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0 || !categoryData || categoryData.length === 0) {
      return [];
    }

    try {
      const categoryCounts = expenses.reduce((acc, expense) => {
        if (!expense) return acc;
        
        const category = expense.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      return Object.entries(categoryCounts).map(([category, count]) => {
        const dataPoint = categoryData.find((d: CategoryDataPoint) => d.x === category);
        return {
          category,
          average: dataPoint && count > 0 ? dataPoint.y / count : 0,
        };
      });
    } catch (error) {
      console.error("Error calculating average spending per category:", error);
      return [];
    }
  }, [expenses, categoryData]);

  return {
    categoryData,
    monthlyData,
    topCategories,
    totalSpending,
    averageSpendingPerCategory,
  };
} 