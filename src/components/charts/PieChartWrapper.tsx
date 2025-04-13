import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface PieChartItem {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
}

interface PieChartWrapperProps {
  data: PieChartItem[];
  width: number;
  height?: number;
}

const PieChartWrapper: React.FC<PieChartWrapperProps> = ({ 
  data, 
  width, 
  height = 220
}) => {
  // Ensure we have valid data with positive values
  const validData = data.filter(item => item.population > 0);

  if (!validData || validData.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  try {
    return (
      <View style={styles.container}>
        <PieChart
          data={validData}
          width={width}
          height={height}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  } catch (error) {
    console.error('Error rendering PieChart:', error);
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
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  noDataText: {
    color: 'gray',
    textAlign: 'center',
  }
});

export default PieChartWrapper; 