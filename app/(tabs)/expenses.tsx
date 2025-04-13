import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { Appbar, Card, Title, Paragraph, Button, FAB, Portal, Modal, TextInput, IconButton, Snackbar, ProgressBar, Text } from 'react-native-paper';
import { useExpenses } from '../../src/hooks/useExpenses';
import { Expense } from '../../src/types/expense';
import { format } from 'date-fns';
import { useSettings } from '../../src/contexts/SettingsContext';
import { CURRENCIES } from '../../src/constants/currencies';

export default function ExpensesScreen() {
  const { expenses, loading, error, addExpense, deleteExpense, updateExpense, refetchExpenses } = useExpenses();
  const { currency, budgets } = useSettings();
  const [visible, setVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const showModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setCategory(expense.category);
      setDate(expense.date);
    } else {
      setEditingExpense(null);
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setEditingExpense(null);
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async () => {
    if (!amount || !description || !category || !date) return;

    const expenseData = {
      amount: parseFloat(amount),
      description,
      category,
      date,
    };

    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      hideModal();
      refetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      setSnackbarMessage('Failed to save expense');
      setSnackbarVisible(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      refetchExpenses();
      setSnackbarMessage('Expense deleted');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error deleting expense:', error);
      setSnackbarMessage('Failed to delete expense');
      setSnackbarVisible(true);
    }
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <Card
      style={styles.card}
      onPress={() => showModal(item)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title>{currencySymbol}{item.amount.toFixed(2)}</Title>
          <View style={styles.cardActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => showModal(item)}
            />
          </View>
        </View>
        <Paragraph>{item.description}</Paragraph>
        <View style={styles.cardFooter}>
          <Paragraph style={styles.category}>{item.category}</Paragraph>
          <Paragraph style={styles.date}>
            {format(new Date(item.date), 'MMM d, yyyy')}
          </Paragraph>
        </View>
        {budgets[item.category] && (
          <View style={styles.budgetProgress}>
            <Paragraph style={styles.budgetText}>
              Budget: {currencySymbol}{budgets[item.category]?.toFixed(2)}
            </Paragraph>
            <ProgressBar
              progress={item.amount / budgets[item.category]}
              color={item.amount > budgets[item.category] ? '#ff4444' : '#4CAF50'}
              style={styles.progressBar}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading expenses: {error.message}</Text>
        <Button onPress={() => refetchExpenses()}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Expenses" />
      </Appbar.Header>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>
            {editingExpense ? 'Edit Expense' : 'Add Expense'}
          </Title>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            left={<TextInput.Affix text={currencySymbol} />}
            style={styles.input}
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <TextInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />
          <TextInput
            label="Date"
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Button onPress={hideModal}>Cancel</Button>
            {editingExpense && (
              <Button
                onPress={() => handleDelete(editingExpense.id)}
                textColor="#ff4444"
              >
                Delete
              </Button>
            )}
            <Button mode="contained" onPress={handleSubmit}>
              {editingExpense ? 'Update' : 'Add'}
            </Button>
          </View>
        </Modal>
      </Portal>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => showModal()}
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  category: {
    fontWeight: 'bold',
  },
  date: {
    color: '#666',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  budgetProgress: {
    marginTop: 8,
  },
  budgetText: {
    fontSize: 12,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
}); 