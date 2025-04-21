import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

// Duration of the splash screen in milliseconds
const SPLASH_DURATION = 3000; // 3 seconds

export default function SplashScreen() {
  const router = useRouter();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Play the animation
    animationRef.current?.play();

    // Set a timer to navigate after the splash duration
    const timer = setTimeout(() => {
      // Replace the current route with the login route
      // Adjust '/(auth)/login' if your login route is different
      router.replace('/(auth)/login'); 
    }, SPLASH_DURATION);

    // Clear the timer if the component unmounts before the timer finishes
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        style={styles.lottie}
        // Try path relative to app directory
        source={require('../assets/animations/loading.json')} 
        autoPlay={false} // Start manually in useEffect for potentially better control
        loop={true} // Loop the animation while screen is shown
        // Consider adding onAnimationFinish prop if you want to navigate exactly when animation ends
        // onAnimationFinish={() => router.replace('/(auth)/login')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Or your desired background color
  },
  lottie: {
    width: 250, // Adjust size as needed
    height: 250, // Adjust size as needed
  },
}); 