import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Title,
  HelperText,
} from 'react-native-paper';
import { ExpenseCardProps } from './ExpenseCard';

interface EditExpenseCardModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (cardId: string, updates: { name?: string; amount?: number; category?: string }) => void;
  card: ExpenseCardProps;
  submitting?: boolean;
}

const EditExpenseCardModal: React.FC<EditExpenseCardModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  card,
  submitting = false,
}) => {
  const [name, setName] = useState(card.name);
  const [amount, setAmount] = useState(card.amount.toString());
  const [category, setCategory] = useState(card.category || '');
  const [amountError, setAmountError] = useState<string | null>(null);

  // Reset form when modal is opened with new card data
  useEffect(() => {
    if (visible) {
      setName(card.name);
      setAmount(card.amount.toString());
      setCategory(card.category || '');
      setAmountError(null);
    }
  }, [visible, card]);

  const handleAmountChange = (text: string) => {
    // Allow only numbers and one decimal point
    const numericValue = text.replace(/[^0-9.]/g, '');
    if (numericValue.split('.').length > 2) {
      // Prevent multiple decimal points
      return;
    }
    setAmount(numericValue);
    if (isNaN(parseFloat(numericValue)) && numericValue !== '') {
      setAmountError('Please enter a valid number');
    } else {
      setAmountError(null);
    }
  };

  const handleSubmit = () => {
    // Prevent double submit if already submitting
    if (submitting) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid positive amount');
      return;
    }
    if (!name.trim()) {
      return;
    }

    onSubmit(card.id, {
      name: name.trim(),
      amount: numericAmount,
      category: category.trim() || undefined,
    });
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Title style={styles.title}>Edit Expense Card</Title>
        
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          disabled={submitting}
        />

        <TextInput
          label="Amount"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="decimal-pad"
          style={styles.input}
          disabled={submitting}
        />
        {amountError && <HelperText type="error">{amountError}</HelperText>}

        <TextInput
          label="Category (Optional)"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
          disabled={submitting}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.button}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={submitting}
            disabled={submitting || !name.trim() || !amount.trim() || !!amountError}
          >
            Save Changes
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    marginLeft: 8,
  },
});

export default EditExpenseCardModal; 