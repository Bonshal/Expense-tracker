import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, PaperProvider } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { supabase } from '../../src/services/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      Alert.alert(
        'Registration Successful',
        'Please check your email for verification!',
      );
      // Optionally navigate to login or show a message
      // router.replace('/login');
    }
    setLoading(false);
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Create Account</Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        <Button
          mode="contained"
          onPress={signUpWithEmail}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Sign Up
        </Button>
        <View style={styles.footer}>
          <Text>Already have an account? </Text>
          <Link href="/login" asChild>
            <Button mode="text">Log In</Button>
          </Link>
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
}); 