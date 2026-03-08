import { useAuth } from "@/contexts";
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
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <ActivityIndicator size="small" color="#2563eb" />
        <Text className="mt-3 text-sm text-gray-600">Restoring session...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6 py-8">
      <View className="w-full max-w-md rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
        <View className="self-start rounded-full bg-blue-100 px-3 py-1 mb-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-blue-800">
            Login Prerequisite
          </Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Sign in before continuing
        </Text>
        <Text className="text-sm leading-6 text-gray-600 mb-4">
          Your workouts, streaks, and gym settings are account-based. Use Google
          sign-in to unlock the app.
        </Text>

        <View className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 mb-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Prerequisites
          </Text>
          <Text className="text-sm text-gray-700">- A Google account</Text>
          <Text className="text-sm text-gray-700">- Internet connection</Text>
          <Text className="text-sm text-gray-700">
            - Supabase Google provider with client ID and secret configured
          </Text>
          <Text className="text-sm text-gray-700">
            - Allow browser-based sign-in when prompted
          </Text>
        </View>

        {authError ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <Text className="text-xs text-red-700">{authError}</Text>
          </View>
        ) : null}

        <Pressable
          className="items-center rounded-xl bg-blue-600 px-4 py-3"
          onPress={() => {
            signInWithGoogle().catch(() => undefined);
          }}
          disabled={isSigningIn}
        >
          <Text className="font-semibold text-white">
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LoginPrerequisiteScreen;
