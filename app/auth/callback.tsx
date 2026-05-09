import { useAuth } from "@/contexts";
import { COLORS } from "@/utils/theme";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const AuthCallbackScreen: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="relative flex-1 items-center justify-center bg-indigo-50 dark:bg-indigo-950 px-6">
        <View
          pointerEvents="none"
          style={{ zIndex: 0 }}
          className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-indigo-200/40 dark:bg-indigo-700/20"
        />
        <View
          pointerEvents="none"
          style={{ zIndex: 0 }}
          className="absolute bottom-12 -left-16 h-56 w-56 rounded-full bg-indigo-200/30 dark:bg-indigo-700/15"
        />

        <View
          style={{ zIndex: 1 }}
          className="w-full max-w-sm items-center rounded-2xl border border-white/70 bg-white/70 dark:bg-slate-900/70 dark:border-indigo-900/60 px-6 py-6"
        >
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text className="mt-3 text-sm text-indigo-700 dark:text-indigo-200">
            Completing sign in...
          </Text>
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/prerequisite" />;
};

export default AuthCallbackScreen;
