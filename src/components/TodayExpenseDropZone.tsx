import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { format } from 'date-fns';

interface TodayExpenseDropZoneProps {
  total: number;
  isDragActive: boolean;
  currencySymbol: string;
}

export const TodayExpenseDropZone: React.FC<TodayExpenseDropZoneProps> = ({
  total,
  isDragActive,
  currencySymbol,
}) => {
  return (
    <Card
      style={[
        styles.dropZone,
        isDragActive && styles.dropZoneActive,
      ]}
    >
      <Card.Content>
        <Title>Today's Expenses</Title>
        <Paragraph style={styles.date}>
          {format(new Date(), 'MMMM d, yyyy')}
        </Paragraph>
        <Title style={styles.total}>
          {currencySymbol}{total.toFixed(2)}
        </Title>
        {isDragActive && (
          <Paragraph style={styles.dropHint}>
            Drop here to add to today's total
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  dropZone: {
    margin: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  dropZoneActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  date: {
    color: '#666',
    marginBottom: 8,
  },
  total: {
    fontSize: 32,
    marginVertical: 8,
  },
  dropHint: {
    color: '#2196f3',
    textAlign: 'center',
    marginTop: 8,
  },
}); 