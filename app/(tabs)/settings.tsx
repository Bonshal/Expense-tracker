import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
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
  Appbar,
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

  interface SettingItem {
    title: string;
    description?: string;
    icon: string;
    onPress?: () => void;
    right?: (props: any) => JSX.Element;
    left?: (props: any) => JSX.Element; // Added left property to the type definition
  }

  interface AccountItem extends SettingItem {
    right: (props: any) => JSX.Element;
  }

  interface BudgetItem extends SettingItem {
    description: string;
    right: (props: any) => JSX.Element;
  }

  const settingsData: (SettingItem | AccountItem | BudgetItem)[] = [
    {
      title: t('currency'),
      description: `Current: ${CURRENCIES.find(c => c.code === currency)?.name || ''}`,
      icon: 'currency-usd',
      onPress: () => setShowCurrencyModal(true),
    },
    {
      title: t('language'),
      description: `Current: ${LANGUAGES.find(l => l.code === language)?.name || ''}`,
      icon: 'translate',
      onPress: () => setShowLanguageModal(true),
    },
    {
      title: t('darkMode'),
      icon: 'theme-light-dark',
      right: () => (
        <Switch
          value={isDarkMode}
          onValueChange={handleThemeChange}
        />
      ),
    },
    {
      title: "Profile",
      description: "View and update your profile details",
      icon: 'account-circle',
      // Removed the profile route navigation
      // onPress: () => router.push('/(tabs)/profile'),
    },
    ...accounts.map((account, index): AccountItem => ({
      title: account,
      icon: 'bank',
      right: props => (
        <IconButton
          {...props}
          icon="delete"
          onPress={() => handleDeleteAccount(index)}
        />
      ),
    })),
    {
      title: t('addAccount'),
      icon: 'plus',
      onPress: () => setShowAccountModal(true),
    },
    ...Object.entries(budgets).map(([category, amount]): BudgetItem => ({
      title: category,
      description: `${CURRENCIES.find(c => c.code === currency)?.symbol || ''}${amount.toFixed(2)}`,
      icon: 'wallet',
      right: props => (
        <IconButton
          {...props}
          icon="delete"
          onPress={() => handleDeleteBudget(category)}
        />
      ),
    })),
    {
      title: t('addBudget'),
      icon: 'plus',
      onPress: () => setShowBudgetModal(true),
    },
    {
      title: "Log Out",
      icon: 'logout',
      onPress: handleLogout, // Fixed the logout functionality
      left: (props: any) => <List.Icon {...props} icon="logout" />, // Explicitly typed props
    },
  ];

  return (
    <>
      <Appbar.Header style={{ backgroundColor: '#4CAF50' }}>
        <Appbar.Content title="Settings" titleStyle={{ color: '#FFFFFF' }} />
      </Appbar.Header>
      <FlatList
        data={settingsData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={item.description}
            left={props => <List.Icon {...props} icon={item.icon} />}
            right={item.right}
            onPress={item.onPress}
          />
        )}
        contentContainerStyle={styles.scrollView}
      />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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