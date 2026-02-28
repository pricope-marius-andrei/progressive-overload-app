import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css"; // Global styles for the entire app

/**
 * Root layout component that provides the base navigation structure
 * This component wraps all screens and handles the main navigation flow
 * Includes SafeAreaProvider to enable SafeArea support throughout the app
 * Also verifies Supabase backend server connection on app startup
 * @returns JSX.Element - The root navigation stack with SafeArea support
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          // Hide header since we're using tabs as primary navigation
          // This gives us a clean, full-screen experience
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}
