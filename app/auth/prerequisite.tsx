import { useAuth } from "@/contexts";
import { Ionicons } from "@expo/vector-icons";
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
      <View className="relative flex-1 items-center justify-center bg-[#EEF2FF] px-6">
        <View
          pointerEvents="none"
          style={{ zIndex: 0 }}
          className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[#6366F1]/15"
        />
        <View
          pointerEvents="none"
          style={{ zIndex: 0 }}
          className="absolute bottom-12 -left-16 h-56 w-56 rounded-full bg-[#6366F1]/10"
        />
        <View style={{ zIndex: 1 }} className="items-center">
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="mt-3 text-sm text-indigo-700">
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
    <View className="relative flex-1 items-center justify-center bg-[#EEF2FF] px-6 py-8">
      <View
        pointerEvents="none"
        style={{ zIndex: 0 }}
        className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[#6366F1]/15"
      />
      <View
        pointerEvents="none"
        style={{ zIndex: 0 }}
        className="absolute bottom-12 -left-16 h-56 w-56 rounded-full bg-[#6366F1]/10"
      />

      <View
        className="w-full max-w-md rounded-3xl border border-white/70 bg-white/65 p-6"
        style={{ zIndex: 1 }}
      >
        <View className="mb-4 self-start rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Sign In
          </Text>
        </View>

        <Text className="mb-2 text-2xl font-semibold text-indigo-950">
          Sign in before continuing
        </Text>
        <Text className="mb-4 text-sm leading-6 text-indigo-700">
          Your workouts, streaks, and gym settings are account-based. Use Google
          sign-in to unlock the app.
        </Text>

        <View className="mb-4 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-3">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Prerequisites
          </Text>
          <Text className="text-sm text-indigo-700">- A Google account</Text>
          <Text className="text-sm text-indigo-700">- Internet connection</Text>
          <Text className="text-sm text-indigo-700">
            - Supabase Google provider configured
          </Text>
          <Text className="text-sm text-indigo-700">
            - Allow browser-based sign-in when prompted
          </Text>
        </View>

        {authError ? (
          <View className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2">
            <Text className="text-xs text-indigo-700">{authError}</Text>
          </View>
        ) : null}

        <Pressable
          className="flex-row items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3"
          onPress={() => {
            signInWithGoogle().catch(() => undefined);
          }}
          disabled={isSigningIn}
        >
          {!isSigningIn ? (
            <Ionicons name="logo-google" size={16} color="#FFFFFF" />
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
