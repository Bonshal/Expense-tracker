import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface MonthlySpendingTrendProps {
  data: { x: string; y: number }[];
  width: number;
  height?: number;
}

const MonthlySpendingTrend: React.FC<MonthlySpendingTrendProps> = ({ data, width, height = 220 }) => {
  // Ensure valid data
  const validData = data.filter(item => item.y > 0);

  if (!validData || validData.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}> 
        <Text style={styles.noDataText}>No data available for Monthly Spending Trend</Text>
      </View>
    );
  }

  try {
    return (
      <View style={styles.container}>
        <LineChart
          data={{
            labels: validData.map(item => item.x),
            datasets: [{ data: validData.map(item => item.y) }],
          }}
          width={width}
          height={height}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  } catch (error) {
    console.error('Error rendering Monthly Spending Trend:', error);
    return (
      <View style={[styles.container, { width, height }]}> 
        <Text style={styles.errorText}>Error rendering chart</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: 'gray',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default MonthlySpendingTrend;