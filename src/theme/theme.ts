import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { DefaultTheme, configureFonts } from 'react-native-paper';

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
  text: '#000000',       // Solid black text for readability
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
  text: '#000000',       // Solid black text for readability
  error: '#E57373',      // Softer Red for errors
  onPrimary: '#000000',  // Black text on primary
  onSurface: '#E0E0E0',  // Light text on surface
};

// Define custom fonts - using OpenSans for a more professional look
const fontConfig = {
  regular: {
    fontFamily: 'OpenSans-Regular',
    fontWeight: "400" as "400",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  medium: {
    fontFamily: 'OpenSans-Medium',
    fontWeight: "500" as "500",
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  light: {
    fontFamily: 'OpenSans-Regular',
    fontWeight: "300" as "300",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  thin: {
    fontFamily: 'OpenSans-Regular',
    fontWeight: "100" as "100",
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
};

// Create the final themes
export const AppLightTheme = {
  ...MD3LightTheme,
  ...LightTheme, // Include adapted navigation theme colors
  colors: customLightColors,
  fonts: configureFonts({ config: fontConfig }), // Configure fonts
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme, // Include adapted navigation theme colors
  colors: customDarkColors,
  fonts: configureFonts({ config: fontConfig }), // Configure fonts
};

// Helper function to configure fonts (might need import from react-native-paper)
// If configureFonts gives an error, you might need to manually structure the fonts object
// based on Paper v5 theme type: https://callstack.github.io/react-native-paper/docs/guides/theming-with-react-navigation/#integrating-app-theme-with-react-navigation-theme  fonts: configureFonts(fontConfig), // Configure fonts
