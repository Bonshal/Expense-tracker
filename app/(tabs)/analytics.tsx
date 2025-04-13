import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import type { ViewProps, ScrollViewProps, ActivityIndicatorProps } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { useExpenses } from '../../src/hooks/useExpenses';
import { useSettings } from '../../src/contexts/SettingsContext';
import { CURRENCIES } from '../../src/constants/currencies';
import BarChart from '../../src/components/charts/BarChart';
import PieChartWrapper from '../../src/components/charts/PieChartWrapper';

// Color scale for charts
const colorScale = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

// Define types for analytics data
interface DataPoint {
  x: string;
  y: number;
}

interface CategoryItem {
  category: string;
  total: number;
}

interface AverageItem {
  category: string;
  average: number;
}

interface AnalyticsData {
  categoryData: DataPoint[];
  monthlyData: DataPoint[];
  topCategories: CategoryItem[];
  totalSpending: number;
  averageSpendingPerCategory: AverageItem[];
}

export default function AnalyticsScreen() {
  const { expenses, loading, error, refetchExpenses } = useExpenses();
  const { currency } = useSettings();
  const [chartError, setChartError] = useState(false);
  
  // Add try-catch to handle potential errors in data processing
  const defaultAnalyticsData: AnalyticsData = {
    categoryData: [],
    monthlyData: [],
    topCategories: [],
    totalSpending: 0,
    averageSpendingPerCategory: []
  };
  
  let analyticsData: AnalyticsData = defaultAnalyticsData;
  
  try {
    analyticsData = useAnalytics();
  } catch (err) {
    console.error("Error in useAnalytics:", err);
    setChartError(true);
  }
  
  const { categoryData, monthlyData, topCategories, totalSpending, averageSpendingPerCategory } = analyticsData;

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;

  // Add safe checks for pieChartData
  const pieChartData = Array.isArray(categoryData) ? categoryData.map((item, index) => ({
    name: item?.x || 'Unknown',
    population: item?.y || 0,
    color: colorScale[index % colorScale.length],
    legendFontColor: '#7F7F7F',
  })) : [];

  // Add safe checks for lineChartData
  const lineChartData = {
    labels: Array.isArray(monthlyData) ? monthlyData.map(item => {
      if (!item || !item.x) return '';
      const [year, month] = String(item.x).split('-');
      return `${month}/${year?.slice(2) || ''}`;
    }) : [],
    datasets: [{
      data: Array.isArray(monthlyData) ? monthlyData.map(item => item?.y || 0) : [0],
    }],
  };

  // Add safe checks for barChartData
  const barChartData = {
    labels: Array.isArray(topCategories) ? topCategories.map(item => item?.category || 'Unknown') : [],
    datasets: [{
      data: Array.isArray(topCategories) ? topCategories.map(item => item?.total || 0) : [0],
    }],
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Analytics" />
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        {loading && (
          <ActivityIndicator animating={true} size="large" style={styles.loader} />
        )}
        {(error || chartError) && (
          <View style={styles.errorContainer}>
            <Paragraph style={styles.errorText}>
              {error ? `Error loading data: ${error.message}` : 'Error processing analytics data'}
            </Paragraph>
            <Button onPress={() => refetchExpenses()}>Retry</Button>
          </View>
        )}
        {!loading && !error && !chartError && (
          <>
            {/* Total Spending Overview */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Total Spending</Title>
                <Paragraph style={styles.totalAmount}>
                  {currencySymbol}{(totalSpending || 0).toFixed(2)}
                </Paragraph>
              </Card.Content>
            </Card>

            {/* Expenses by Category Pie Chart */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Expenses by Category</Title>
                <View style={styles.chartContainer}>
                  <PieChartWrapper
                    data={pieChartData}
                    width={chartWidth}
                    height={220}
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Monthly Spending Trend */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Monthly Spending Trend</Title>
                {Array.isArray(monthlyData) && monthlyData.length > 1 ? (
                  <View style={styles.chartContainer}>
                    <LineChart
                      data={lineChartData}
                      width={chartWidth}
                      height={220}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
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
                ) : (
                  <Paragraph>No monthly data to display.</Paragraph>
                )}
              </Card.Content>
            </Card>

            {/* Top Categories */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Top Categories</Title>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={barChartData}
                    width={chartWidth}
                    height={220}
                    color="rgba(54, 162, 235, 1)"
                  />
                </View>
              </Card.Content>
            </Card>

            {/* Average Spending per Category */}
            <Card style={styles.card}>
              <Card.Content>
                <Title>Average Spending per Category</Title>
                {Array.isArray(averageSpendingPerCategory) && averageSpendingPerCategory.length > 0 ? (
                  averageSpendingPerCategory.map(({ category, average }) => (
                    <View key={category} style={styles.averageRow}>
                      <Paragraph>{category}</Paragraph>
                      <Paragraph>{currencySymbol}{average.toFixed(2)}</Paragraph>
                    </View>
                  ))
                ) : (
                  <Paragraph>No average spending data to display.</Paragraph>
                )}
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loader: {
    marginTop: 50,
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
  card: {
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
}); 