import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Alert } from 'react-native';
import type { Expense, NewExpenseData } from '../types/expense';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpenses = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch expenses'));
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (newExpense: NewExpenseData) => {
    try {
      setAdding(true);
      
      // Get current user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
          console.error('[useExpenses] Error fetching user for insert:', userError);
          throw userError || new Error('User not authenticated');
      }
      
      const expenseDataWithUser = {
        ...newExpense,
        user_id: user.id // Add user_id to the data
      };
      
      console.log('[useExpenses] Attempting to insert with user_id:', expenseDataWithUser);
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseDataWithUser]) // Insert data including user_id
        .select()
        .single();

      if (error) {
        console.error('[useExpenses] Supabase insert error:', error);
        throw error;
      } 
      
      console.log('[useExpenses] Supabase insert success, data:', data);
      setExpenses(prev => {
          const newState = [data, ...prev];
          console.log('[useExpenses] setExpenses called, new count:', newState.length);
          return newState;
      });
      return data;
    } catch (err) {
      console.error('[useExpenses] Error in addExpense function:', err);
      setError(err instanceof Error ? err : new Error('Failed to add expense'));
      throw err; 
    } finally {
      setAdding(false);
      console.log('[useExpenses] addExpense finished.');
    }
  };

  const updateExpense = async (id: string, updatedExpense: NewExpenseData) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updatedExpense)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setExpenses(prev => prev.map(exp => exp.id === id ? data : exp));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update expense'));
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete expense'));
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    loading,
    adding,
    error,
    refetchExpenses: fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  };
} 