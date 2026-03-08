import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

/**
 * Root layout component that provides the base navigation structure.
 * Wraps all screens with SafeAreaProvider and configures the navigation stack.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </ErrorBoundary>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
