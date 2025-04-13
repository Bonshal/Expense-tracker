import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { supabase } from '../../src/services/supabase';

// Placeholder for your app logo
const AppLogo = () => (
  <Image 
    source={require('../../assets/icon.png')} // Adjust path if needed
    style={styles.logo}
    resizeMode="contain"
  />
);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const validateInput = () => {
    if (!email.trim()) {
      setError('Email cannot be empty.');
      return false;
    }
    if (!password) {
      setError('Password cannot be empty.');
      return false;
    }
    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    setError(null);
    return true;
  };

  async function signInWithEmail() {
    if (!validateInput()) {
      return;
    }
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message || 'Login failed. Please check your credentials.');
      Alert.alert('Login Failed', authError.message || 'Please check your credentials.');
    } else {
      router.replace('/(tabs)/dashboard');
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.keyboardAvoidingView, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollViewContainer} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {<AppLogo /> }
          <Text variant="headlineMedium" style={styles.title}>Welcome to Expensify</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Log in to manage your expenses</Text>
          
          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null); // Clear error on input change
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              error={!!error && error.toLowerCase().includes('email')} // Show error if relevant
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null); // Clear error on input change
              }}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              error={!!error && error.toLowerCase().includes('password')}
            />
            
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            <Button
              mode="contained"
              onPress={signInWithEmail}
              loading={loading}
              disabled={loading}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <Link href="/register" asChild>
              <Button mode="text" labelStyle={{ color: theme.colors.primary }} disabled={loading}>
                Sign Up
              </Button>
            </Link>
          </View>
          {/* Optional: Add Forgot Password */}
          {/* <Button mode="text" onPress={() => {}} style={styles.forgotPasswordButton} disabled={loading}>
            Forgot Password?
          </Button> */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: 8, // Slightly rounded corners
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContent: {
     paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  forgotPasswordButton: {
    marginTop: 8,
  }
}); 