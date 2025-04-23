import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform, // For DatePicker conditional rendering
} from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Title,
  HelperText,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import the DateTimePicker

interface AddExpenseModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: { amount: number; description: string; category?: string; date: Date; expense_card_id?: string }) => void;
  submitting?: boolean;
  initialValues?: {
    amount?: number;
    description?: string;
    category?: string;
    date?: Date;
    expense_card_id?: string;
  };
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  submitting = false,
  initialValues,
}) => {
  const [amount, setAmount] = useState(initialValues?.amount?.toString() || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState(initialValues?.category || '');
  const [date, setDate] = useState(initialValues?.date || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Reset form when modal is opened with new initial values
  useEffect(() => {
    if (visible && initialValues) {
      setAmount(initialValues.amount?.toString() || '');
      setDescription(initialValues.description || '');
      setCategory(initialValues.category || '');
      setDate(initialValues.date || new Date());
      setAmountError(null);
    }
  }, [visible, initialValues]);

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // Hide picker immediately on Android
    setDate(currentDate);
  };

  const handleSubmit = () => {
    // Prevent double submit if already submitting
    if (submitting) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid positive amount');
      return;
    }
    if (!description.trim()) {
      // Optionally add validation for description
    }

    onSubmit({
      amount: numericAmount,
      description: description.trim(),
      category: category.trim() || undefined,
      date: date,
      expense_card_id: initialValues?.expense_card_id,
    });
  };

  const showPicker = () => {
    setShowDatePicker(true);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={!submitting ? onDismiss : undefined} /* Prevent dismiss while submitting */ contentContainerStyle={styles.modalContainer}>
        <Title style={styles.title}>Add New Expense</Title>
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          error={!!amountError}
        />
        {amountError && <HelperText type="error">{amountError}</HelperText>}
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Category (Optional)"
          value={category}
          onChangeText={setCategory}
          mode="outlined"
          style={styles.input}
        />
        <Button onPress={showPicker} mode="outlined" style={styles.input}>
          {`Date: ${date.toLocaleDateString()}`}
        </Button>

        {/* Date Picker - Requires @react-native-community/datetimepicker */}
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="default" // Or 'spinner'
            onChange={handleDateChange}
          />
        )}
        <HelperText type="info">Date Picker needs library install</HelperText>

        <View style={styles.buttonContainer}>
          <Button onPress={onDismiss} mode="outlined" style={styles.button} disabled={submitting}>
            Cancel
          </Button>
          <Button
             onPress={handleSubmit}
             mode="contained"
             style={styles.button}
             loading={submitting} // Show loading indicator on button
             disabled={submitting} // Disable button while submitting
           >
            {submitting ? 'Adding...' : 'Add Expense'}
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
    margin: 20, // Add margin around the modal
    borderRadius: 8,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default AddExpenseModal;