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
  primary: '#4CAF50',    // Vibrant Green
  accent: '#FF9800',     // Bright Orange
  background: '#F1F8E9', // Light Greenish Background
  surface: '#FFFFFF',    // White surface
  text: '#212121',       // Dark text for readability
  error: '#F44336',      // Red for errors
  onPrimary: '#FFFFFF',  // White text on primary
  onSurface: '#212121',  // Dark text on surface
};

const customDarkColors = {
  ...MD3DarkTheme.colors,
  primary: '#81C784',    // Softer Green for dark mode
  accent: '#FFB74D',     // Softer Orange
  background: '#263238', // Dark Blue-Grey Background
  surface: '#37474F',    // Darker surface
  text: '#E0E0E0',       // Light text for readability
  error: '#E57373',      // Softer Red for errors
  onPrimary: '#000000',  // Black text on primary
  onSurface: '#E0E0E0',  // Light text on surface
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