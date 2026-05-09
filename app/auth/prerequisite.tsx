import { useAuth } from "@/contexts";
import { COLORS } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const LoginPrerequisiteScreen: React.FC = () => {
  const {
    authError,
    isAuthenticated,
    isLoading,
    isSigningIn,
    signInWithGoogle,
  } = useAuth();

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
        <View style={{ zIndex: 1 }} className="items-center">
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text className="mt-3 text-sm text-indigo-700 dark:text-indigo-200">
            Restoring session...
          </Text>
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View className="relative flex-1 items-center justify-center bg-indigo-50 dark:bg-indigo-950 px-6 py-8">
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
        className="w-full max-w-md rounded-3xl border border-white/70 bg-white/70 dark:bg-slate-900/70 dark:border-indigo-900/60 p-6"
        style={{ zIndex: 1 }}
      >
        <View className="mb-4 self-start rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
            Sign In
          </Text>
        </View>

        <Text className="mb-2 text-2xl font-semibold text-indigo-950 dark:text-indigo-50">
          Sign in before continuing
        </Text>
        <Text className="mb-4 text-sm leading-6 text-indigo-700 dark:text-indigo-200">
          Your workouts, streaks, and gym settings are account-based. Use Google
          sign-in to unlock the app.
        </Text>

        <View className="mb-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-4 py-3">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Prerequisites
          </Text>
          <Text className="text-sm text-indigo-700 dark:text-indigo-200">
            - A Google account
          </Text>
          <Text className="text-sm text-indigo-700 dark:text-indigo-200">
            - Internet connection
          </Text>
          <Text className="text-sm text-indigo-700 dark:text-indigo-200">
            - Supabase Google provider configured
          </Text>
          <Text className="text-sm text-indigo-700 dark:text-indigo-200">
            - Allow browser-based sign-in when prompted
          </Text>
        </View>

        {authError ? (
          <View className="mb-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 px-3 py-2">
            <Text className="text-xs text-indigo-700 dark:text-indigo-200">
              {authError}
            </Text>
          </View>
        ) : null}

        <Pressable
          className="flex-row items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3"
          onPress={() => {
            signInWithGoogle()
              .then(() =>
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                ),
              )
              .catch(() => undefined);
          }}
          disabled={isSigningIn}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          accessibilityHint="Starts Google sign in"
          style={({ pressed }) =>
            pressed
              ? { opacity: 0.85, transform: [{ scale: 0.99 }] }
              : undefined
          }
        >
          {!isSigningIn ? (
            <Ionicons name="logo-google" size={16} color="white" />
          ) : null}
          <Text className="font-semibold text-white">
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LoginPrerequisiteScreen;
