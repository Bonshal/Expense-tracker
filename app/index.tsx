import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expense Tracker</Text>
      {/* We will replace this with links/navigation to auth or dashboard later */}
      <Link href="/(auth)/login" style={styles.link}>
        Go to Login (temp)
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: 'blue',
  },
}); 