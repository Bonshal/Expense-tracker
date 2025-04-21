import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  List,
  Divider,
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  IconButton,
  useTheme,
  Switch,
} from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../src/contexts/SettingsContext';
import { supabase } from '../../src/services/supabase';
import { useRouter } from 'expo-router';

// Currency options
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'hi', name: 'हिंदी' },
];

export default function SettingsScreen() {
  const {
    currency,
    language,
    isDarkMode,
    accounts,
    budgets,
    setCurrency,
    setLanguage,
    setIsDarkMode,
    addAccount,
    deleteAccount,
    addBudget,
    deleteBudget,
  } = useSettings();

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newAccount, setNewAccount] = useState('');
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Currency Settings
  const handleCurrencyChange = async (newCurrency: string) => {
    await setCurrency(newCurrency);
    setShowCurrencyModal(false);
  };

  // Language Settings
  const handleLanguageChange = async (newLanguage: string) => {
    await setLanguage(newLanguage);
    setShowLanguageModal(false);
  };

  // Theme Settings
  const handleThemeChange = async (value: boolean) => {
    await setIsDarkMode(value);
  };

  // Account Management
  const handleAddAccount = async () => {
    if (newAccount.trim()) {
      await addAccount(newAccount.trim());
      setNewAccount('');
      setShowAccountModal(false);
    }
  };

  const handleDeleteAccount = async (index: number) => {
    await deleteAccount(index);
  };

  // Budget Settings
  const handleAddBudget = async () => {
    if (newBudgetCategory.trim() && newBudgetAmount.trim()) {
      await addBudget(newBudgetCategory.trim(), parseFloat(newBudgetAmount));
      setNewBudgetCategory('');
      setNewBudgetAmount('');
      setShowBudgetModal(false);
    }
  };

  const handleDeleteBudget = async (category: string) => {
    await deleteBudget(category);
  };

  // --- Logout Handler ---
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
        Alert.alert("Logout Failed", error.message);
      } else {
        // Navigate to login screen after successful sign out
        // Replace the current route stack to prevent going back
        router.replace('/(auth)/login'); 
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      Alert.alert("Logout Failed", "An unexpected error occurred.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Currency Settings */}
      <List.Section>
        <List.Subheader>{t('currency')}</List.Subheader>
        <List.Item
          title={t('currency')}
          description={`Current: ${CURRENCIES.find(c => c.code === currency)?.name}`}
          left={props => <List.Icon {...props} icon="currency-usd" />}
          onPress={() => setShowCurrencyModal(true)}
        />
      </List.Section>

      {/* Language Settings */}
      <List.Section>
        <List.Subheader>{t('language')}</List.Subheader>
        <List.Item
          title={t('language')}
          description={`Current: ${LANGUAGES.find(l => l.code === language)?.name}`}
          left={props => <List.Icon {...props} icon="translate" />}
          onPress={() => setShowLanguageModal(true)}
        />
      </List.Section>

      {/* Theme Settings */}
      <List.Section>
        <List.Subheader>{t('darkMode')}</List.Subheader>
        <List.Item
          title={t('darkMode')}
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeChange}
            />
          )}
        />
      </List.Section>

      {/* Account Management */}
      <List.Section>
        <List.Subheader>{t('accountManagement')}</List.Subheader>
        {accounts.map((account, index) => (
          <List.Item
            key={index}
            title={account}
            left={props => <List.Icon {...props} icon="bank" />}
            right={props => (
              <IconButton
                {...props}
                icon="delete"
                onPress={() => handleDeleteAccount(index)}
              />
            )}
          />
        ))}
        <List.Item
          title={t('addAccount')}
          left={props => <List.Icon {...props} icon="plus" />}
          onPress={() => setShowAccountModal(true)}
        />
      </List.Section>

      {/* Budget Settings */}
      <List.Section>
        <List.Subheader>{t('budgetSettings')}</List.Subheader>
        {Object.entries(budgets).map(([category, amount]) => (
          <List.Item
            key={category}
            title={category}
            description={`${CURRENCIES.find(c => c.code === currency)?.symbol}${amount.toFixed(2)}`}
            left={props => <List.Icon {...props} icon="wallet" />}
            right={props => (
              <IconButton
                {...props}
                icon="delete"
                onPress={() => handleDeleteBudget(category)}
              />
            )}
          />
        ))}
        <List.Item
          title={t('addBudget')}
          left={props => <List.Icon {...props} icon="plus" />}
          onPress={() => setShowBudgetModal(true)}
        />
      </List.Section>

      {/* --- Logout Section --- */}
      <Divider style={styles.divider} />
      <List.Section>
        <List.Subheader>{t('account')}</List.Subheader>
        <Button
          mode="contained"
          icon="logout"
          onPress={handleLogout}
          loading={isLoggingOut}
          disabled={isLoggingOut}
          style={[styles.button, { backgroundColor: theme.colors.error }]}
        >
          {t('logout')}
        </Button>
      </List.Section>

      {/* Currency Selection Modal */}
      <Portal>
        <Modal
          visible={showCurrencyModal}
          onDismiss={() => setShowCurrencyModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>{t('selectCurrency')}</Text>
          {CURRENCIES.map((curr) => (
            <List.Item
              key={curr.code}
              title={curr.name}
              description={`${curr.code} (${curr.symbol})`}
              onPress={() => handleCurrencyChange(curr.code)}
              right={props => 
                currency === curr.code && <List.Icon {...props} icon="check" />
              }
            />
          ))}
        </Modal>
      </Portal>

      {/* Language Selection Modal */}
      <Portal>
        <Modal
          visible={showLanguageModal}
          onDismiss={() => setShowLanguageModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
          {LANGUAGES.map((lang) => (
            <List.Item
              key={lang.code}
              title={lang.name}
              onPress={() => handleLanguageChange(lang.code)}
              right={props => 
                language === lang.code && <List.Icon {...props} icon="check" />
              }
            />
          ))}
        </Modal>
      </Portal>

      {/* Add Account Modal */}
      <Portal>
        <Modal
          visible={showAccountModal}
          onDismiss={() => setShowAccountModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>{t('addAccount')}</Text>
          <TextInput
            label={t('accountName')}
            value={newAccount}
            onChangeText={setNewAccount}
            style={styles.input}
          />
          <Button mode="contained" onPress={handleAddAccount}>
            {t('addAccount')}
          </Button>
        </Modal>
      </Portal>

      {/* Add Budget Modal */}
      <Portal>
        <Modal
          visible={showBudgetModal}
          onDismiss={() => setShowBudgetModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>{t('addBudget')}</Text>
          <TextInput
            label={t('category')}
            value={newBudgetCategory}
            onChangeText={setNewBudgetCategory}
            style={styles.input}
          />
          <TextInput
            label={t('amount')}
            value={newBudgetAmount}
            onChangeText={setNewBudgetAmount}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleAddBudget}>
            {t('addBudget')}
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  modalButton: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 10,
  },
  button: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
}); 