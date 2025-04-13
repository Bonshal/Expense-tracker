import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
  width?: number;
  height?: number;
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  width = Dimensions.get('window').width - 40, 
  height = 220,
  color = 'rgba(54, 162, 235, 1)',
}) => {
  // Ensure the data is valid
  if (!data || !data.labels || !data.datasets || data.labels.length === 0 || data.datasets.length === 0) {
    return null;
  }
  
  // Make sure there are no null values
  const safeData = {
    labels: data.labels.map(label => label || 'Unknown'),
    datasets: [{
      data: data.datasets[0].data.map(value => value || 0)
    }]
  };
  
  return (
    <View style={styles.container}>
      <LineChart
        data={safeData}
        width={width}
        height={height}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => color.replace('1)', `${opacity})`),
          style: {
            borderRadius: 16,
          },
        }}
        bezier={false}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BarChart; 