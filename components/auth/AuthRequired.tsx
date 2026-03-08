import { useAuth } from "@/contexts";
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
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <View className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 items-center">
          <ActivityIndicator size="small" color="#2563eb" />
          <Text className="mt-3 text-sm text-gray-600">
            Restoring session...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <View className="w-full max-w-md rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
        <View className="self-start rounded-full bg-blue-100 px-3 py-1 mb-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-blue-800">
            Authentication
          </Text>
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-2">{title}</Text>
        <Text className="text-sm leading-6 text-gray-600 mb-5">{message}</Text>

        {authError ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <Text className="text-xs text-red-700">{authError}</Text>
          </View>
        ) : null}

        <Pressable
          className="rounded-xl bg-blue-600 px-4 py-3 items-center"
          onPress={() => {
            signInWithGoogle().catch(() => undefined);
          }}
          disabled={isSigningIn}
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
