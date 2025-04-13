import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { ExpenseCardProps } from '../components/expenses/ExpenseCard';
import { Alert } from 'react-native';

// Define the type fetched from Supabase (matches table structure)
// Note: Supabase returns snake_case, we might map to camelCase
interface FetchedExpenseCard {
  id: string;
  user_id: string;
  name: string;
  amount: number; // Supabase might return string for decimal, handle parsing
  category: string | null;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export function useExpenseCards() {
  const [expenseCards, setExpenseCards] = useState<ExpenseCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchExpenseCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Fetch cards for the logged-in user
      const { data, error: fetchError } = await supabase
        .from('expense_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Map Supabase data (snake_case) to component props (camelCase if needed)
      // And parse amount if necessary
      const formattedData: ExpenseCardProps[] = data.map((card: FetchedExpenseCard) => ({
        id: card.id,
        name: card.name,
        // Ensure amount is a number if Supabase returns string for decimal
        amount: typeof card.amount === 'string' ? parseFloat(card.amount) : card.amount,
        // Convert null category to undefined
        category: card.category ?? undefined,
        is_favorite: card.is_favorite,
        // We don't need user_id, created_at, updated_at in ExpenseCardProps directly
      }));

      setExpenseCards(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch expense cards'));
      console.error('Error fetching expense cards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpenseCard = useCallback(async (cardData: { name: string; amount: number; category?: string }) => {
    setAdding(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase
        .from('expense_cards')
        .insert([{
          user_id: user.id,
          name: cardData.name,
          amount: cardData.amount,
          category: cardData.category,
          is_favorite: false,
        }]);

      if (insertError) throw insertError;

      // Refetch cards after adding
      await fetchExpenseCards();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add expense card'));
      console.error('Error adding expense card:', err);
      Alert.alert('Error', 'Could not save expense card. Please try again.');
    } finally {
      setAdding(false);
    }
  }, [fetchExpenseCards]);

  const toggleFavorite = useCallback(async (cardId: string, currentFavorite: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('expense_cards')
        .update({ is_favorite: !currentFavorite })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state immediately for better UX
      setExpenseCards(prevCards =>
        prevCards.map(card =>
          card.id === cardId
            ? { ...card, is_favorite: !currentFavorite }
            : card
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Could not update favorite status. Please try again.');
    }
  }, []);

  const deleteExpenseCard = useCallback(async (cardId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: deleteError } = await supabase
        .from('expense_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Update local state immediately for better UX
      setExpenseCards(prevCards => prevCards.filter(card => card.id !== cardId));
    } catch (err) {
      console.error('Error deleting expense card:', err);
      Alert.alert('Error', 'Could not delete expense card. Please try again.');
    }
  }, []);

  const editExpenseCard = useCallback(async (cardId: string, updates: { name?: string; amount?: number; category?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('expense_cards')
        .update(updates)
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state immediately for better UX
      setExpenseCards(prevCards =>
        prevCards.map(card =>
          card.id === cardId
            ? { ...card, ...updates }
            : card
        )
      );
    } catch (err) {
      console.error('Error updating expense card:', err);
      Alert.alert('Error', 'Could not update expense card. Please try again.');
    }
  }, []);

  // Fetch cards on initial mount
  useEffect(() => {
    fetchExpenseCards();
  }, [fetchExpenseCards]);

  // Return state and refetch function
  return {
    expenseCards,
    loading,
    adding,
    error,
    refetchExpenseCards: fetchExpenseCards,
    addExpenseCard,
    toggleFavorite,
    deleteExpenseCard,
    editExpenseCard,
  };
} 