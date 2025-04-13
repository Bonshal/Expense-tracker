import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type SettingsContextType = {
  currency: string;
  language: string;
  isDarkMode: boolean;
  accounts: string[];
  budgets: { [key: string]: number };
  setCurrency: (currency: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
  setIsDarkMode: (isDarkMode: boolean) => Promise<void>;
  addAccount: (account: string) => Promise<void>;
  deleteAccount: (index: number) => Promise<void>;
  addBudget: (category: string, amount: number) => Promise<void>;
  deleteBudget: (category: string) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState('USD');
  const [language, setLanguageState] = useState('en');
  const [isDarkMode, setIsDarkModeState] = useState(false);
  const [accounts, setAccountsState] = useState<string[]>([]);
  const [budgets, setBudgetsState] = useState<{ [key: string]: number }>({});
  const systemColorScheme = useColorScheme();

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('currency');
      const savedLanguage = await AsyncStorage.getItem('language');
      const savedDarkMode = await AsyncStorage.getItem('isDarkMode');
      const savedAccounts = await AsyncStorage.getItem('accounts');
      const savedBudgets = await AsyncStorage.getItem('budgets');

      if (savedCurrency) setCurrencyState(savedCurrency);
      if (savedLanguage) setLanguageState(savedLanguage);
      if (savedDarkMode) setIsDarkModeState(savedDarkMode === 'true');
      if (savedAccounts) setAccountsState(JSON.parse(savedAccounts));
      if (savedBudgets) setBudgetsState(JSON.parse(savedBudgets));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);
    await AsyncStorage.setItem('currency', newCurrency);
  };

  const setLanguage = async (newLanguage: string) => {
    setLanguageState(newLanguage);
    await AsyncStorage.setItem('language', newLanguage);
  };

  const setIsDarkMode = async (value: boolean) => {
    setIsDarkModeState(value);
    await AsyncStorage.setItem('isDarkMode', value.toString());
  };

  const addAccount = async (account: string) => {
    const updatedAccounts = [...accounts, account];
    setAccountsState(updatedAccounts);
    await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
  };

  const deleteAccount = async (index: number) => {
    const updatedAccounts = accounts.filter((_, i) => i !== index);
    setAccountsState(updatedAccounts);
    await AsyncStorage.setItem('accounts', JSON.stringify(updatedAccounts));
  };

  const addBudget = async (category: string, amount: number) => {
    const updatedBudgets = {
      ...budgets,
      [category]: amount,
    };
    setBudgetsState(updatedBudgets);
    await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
  };

  const deleteBudget = async (category: string) => {
    const updatedBudgets = { ...budgets };
    delete updatedBudgets[category];
    setBudgetsState(updatedBudgets);
    await AsyncStorage.setItem('budgets', JSON.stringify(updatedBudgets));
  };

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 