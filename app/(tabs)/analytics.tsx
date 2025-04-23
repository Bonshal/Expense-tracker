import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import type { ViewProps, FlatListProps, ActivityIndicatorProps } from 'react-native';
import { Appbar, Card, Title, Paragraph, Button } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { useExpenses } from '../../src/hooks/useExpenses';
import { useSettings } from '../../src/contexts/SettingsContext';
import { CURRENCIES } from '../../src/constants/currencies';
import BarChart from '../../src/components/charts/BarChart';
import PieChartWrapper from '../../src/components/charts/PieChartWrapper';
import { supabase } from '../../src/services/supabase'; // Corrected supabase import path
import { useAuth } from '../../src/contexts/AuthContext'; // Corrected AuthContext import path
import MonthlySpendingTrend from '../../src/components/charts/MonthlySpendingTrend'; // Corrected import path

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
  description?: string; // Add an optional description property
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
  const { user } = useAuth(); // Add user from AuthContext
  const [chartError, setChartError] = useState(false);
  const [monthlyData, setMonthlyData] = useState<DataPoint[]>([]); // Add state for monthly data
  
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
  
  const { categoryData, topCategories, totalSpending, averageSpendingPerCategory } = analyticsData;

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

  const fetchMonthlyData = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('amount, date');

      if (error) {
        console.error('Error fetching monthly data:', error);
        return;
      }

      const monthlyTotals = data.reduce((acc: Record<string, number>, expense: { date: string; amount: number }) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
        return acc;
      }, {});

      const formattedData = Object.entries(monthlyTotals).map(([month, total]) => ({
        x: month,
        y: total as number,
      }));

      setMonthlyData(formattedData as DataPoint[]);
    } catch (err) {
      console.error('Error processing monthly data:', err);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#4CAF50' }}>
        <Appbar.Content title="Analytics" titleStyle={{ color: '#FFFFFF' }} />
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
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Total Spending</Title>
                <View style={styles.totalAmountContainer}>
                  <Text style={styles.totalAmount}>
                    {currencySymbol}{(totalSpending || 0).toFixed(2)}
                  </Text>
                </View>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Expenses by Category</Title>
                <View style={styles.chartContainer}>
                  <PieChartWrapper
                    data={pieChartData}
                    width={chartWidth}
                    height={220}
                  />
                </View>
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Monthly Spending Trend</Title>
                <MonthlySpendingTrend data={monthlyData} width={chartWidth} />
              </Card.Content>
            </Card>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Top Categories</Title>
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
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Average Spending per Category</Title>
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
    padding: 20, // Increase padding for better spacing
    borderRadius: 12, // Add rounded corners
    elevation: 3, // Subtle shadow for depth
    backgroundColor: '#FFFFFF', // Ensure consistent background color
    alignItems: 'center', // Center align content
    justifyContent: 'center', // Center content vertically
  },
  cardTitle: {
    fontSize: 24, // Increase font size for better visibility
    fontWeight: 'bold', // Make the text bold
    textAlign: 'center', // Center align the text
    color: '#4CAF50', // Match the primary theme color
    marginBottom: 8, // Add spacing below the title
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16, // Add spacing around charts
  },
  totalAmountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  totalAmount: {
    fontSize: 32, // Increase font size for better visibility
    fontWeight: 'bold',
    color: '#4CAF50', // Match the primary theme color
    textAlign: 'center',
  },
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  chartDescription: {
    marginTop: 8,
    textAlign: 'center',
    color: '#7F7F7F',
  },
});