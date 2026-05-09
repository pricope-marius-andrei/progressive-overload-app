import { useAuth } from "@/contexts";
import { COLORS } from "@/utils/theme";
import * as Haptics from "expo-haptics";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type AuthRequiredProps = {
  title?: string;
  message?: string;
};

const AuthRequired: React.FC<AuthRequiredProps> = ({
  title = "Sign in required",
  message = "Please sign in with Google to continue.",
}) => {
  const { authError, isLoading, isSigningIn, signInWithGoogle } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-indigo-50 dark:bg-indigo-950">
        <View className="w-full max-w-md rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/70 p-6 items-center">
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text className="mt-3 text-sm text-indigo-700 dark:text-indigo-200">
            Restoring session...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6 bg-indigo-50 dark:bg-indigo-950">
      <View className="w-full max-w-md rounded-3xl p-6 shadow-sm bg-white/70 dark:bg-slate-900/70 border border-indigo-100 dark:border-indigo-900/60">
        <View className="self-start rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 mb-4 border border-indigo-100 dark:border-indigo-800">
          <Text className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200">
            Authentication
          </Text>
        </View>

        <Text className="text-2xl font-bold text-indigo-950 dark:text-indigo-50 mb-2">
          {title}
        </Text>
        <Text className="text-sm leading-6 text-indigo-700 dark:text-indigo-200 mb-5">
          {message}
        </Text>

        {authError ? (
          <View className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/70 dark:bg-red-900/30 px-3 py-2">
            <Text className="text-xs text-red-700 dark:text-red-200">
              {authError}
            </Text>
          </View>
        ) : null}

        <Pressable
          className="rounded-xl bg-indigo-600 px-4 py-3 items-center"
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
          <Text className="text-white font-semibold">
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default AuthRequired;
