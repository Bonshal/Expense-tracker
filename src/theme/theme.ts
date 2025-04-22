import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Combine React Navigation and React Native Paper themes
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Define custom colors - replace with your preferred palette
const customLightColors = {
  ...MD3LightTheme.colors,
  primary: '#6200EE',    // Example Purple
  accent: '#03DAC5',     // Example Teal
  background: '#F6F6F6', // Lighter background
  surface: '#FFFFFF',    // White surface
  // Add more overrides as needed
};

const customDarkColors = {
  ...MD3DarkTheme.colors,
  primary: '#BB86FC',    // Lighter Purple for dark mode
  accent: '#03DAC5',     // Teal works okay
  background: '#121212', // Standard dark background
  surface: '#1E1E1E',    // Slightly lighter dark surface
  // Add more overrides as needed
};

// Define custom fonts - using Inter as loaded in _layout.tsx
// React Native Paper v5 uses variant names (displayLarge, titleMedium, bodySmall etc.)
const customFontConfig = {
    fontFamily: 'Inter-Regular', // Default font
    // Specific variants (Optional - customize as needed)
    // You might need to map specific font weights to variants
    // Title styles might use Medium or Bold
    // Body styles typically use Regular
    // Headline styles might use Bold
};

// Create the final themes
export const AppLightTheme = {
  ...MD3LightTheme,
  ...LightTheme, // Include adapted navigation theme colors
  colors: customLightColors,
  fonts: configureFonts({ config: customFontConfig }), // Configure fonts
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme, // Include adapted navigation theme colors
  colors: customDarkColors,
  fonts: configureFonts({ config: customFontConfig }), // Configure fonts
};

// Helper function to configure fonts (might need import from react-native-paper)
// If configureFonts gives an error, you might need to manually structure the fonts object
// based on Paper v5 theme type: https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation/#integrating-app-theme-with-react-navigation-theme
import { configureFonts } from 'react-native-paper'; 