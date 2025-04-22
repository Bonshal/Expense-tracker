import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SettingsProvider, useSettings } from '../src/contexts/SettingsContext';
import { useFonts } from 'expo-font';
import { AppLightTheme, AppDarkTheme } from '../src/theme/theme';

function RootLayoutNav() {
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? AppDarkTheme : AppLightTheme;

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/OpenSans-Medium.ttf'),
    'Inter-Bold': require('../assets/fonts/OpenSans-Bold.ttf'),
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (fontError) {
     console.error("Font loading error:", fontError);
  }

  return (
    <PaperProvider theme={theme}>
      {fontsLoaded && (
         <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
         </Stack>
       )}
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SettingsProvider>
        <RootLayoutNav />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});