import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useSettings } from '../contexts/SettingsContext';
import { CURRENCIES, Currency } from '../constants/currencies';

type ExpenseFormProps = {
  onSubmit: (data: {
    amount: number;
    description: string;
    category: string;
    date: string;
    account: string;
  }) => void;
  initialValues?: {
    amount: number;
    description: string;
    category: string;
    date: string;
    account: string;
  };
};

export default function ExpenseForm({ onSubmit, initialValues }: ExpenseFormProps) {
  const { currency, accounts } = useSettings();
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [date, setDate] = useState(initialValues?.date || new Date().toISOString().split('T')[0]);
  const [selectedAccount, setSelectedAccount] = useState(initialValues?.account || accounts[0] || '');

  const handleSubmit = () => {
    if (!amount || !description || !category || !date || !selectedAccount) return;

    onSubmit({
      amount: parseFloat(amount),
      description,
      category,
      date,
      account: selectedAccount,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedAccount(accounts[0] || '');
  };

  const currencySymbol = CURRENCIES.find((c: Currency) => c.code === currency)?.symbol || '$';

  return (
    <View style={styles.container}>
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
      {accounts.length > 0 && (
        <View style={styles.accountContainer}>
          <Text style={styles.label}>Account</Text>
          <View style={styles.accountButtons}>
            {accounts.map((account) => (
              <Button
                key={account}
                mode={selectedAccount === account ? 'contained' : 'outlined'}
                onPress={() => setSelectedAccount(account)}
                style={styles.accountButton}
              >
                {account}
              </Button>
            ))}
          </View>
        </View>
      )}
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        {initialValues ? 'Update Expense' : 'Add Expense'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  accountContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  accountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accountButton: {
    marginRight: 8,
  },
  button: {
    marginTop: 8,
  },
}); 