import { useAuth } from "@/contexts";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const Profile: React.FC = () => {
  const { authError, isAuthenticated, isLoading, signOut, user } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-5 py-8">
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/prerequisite" />;
  }

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "Athlete";

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-5 py-8">
      <View className="w-full max-w-md rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
        <View className="self-start rounded-full bg-blue-100 px-3 py-1 mb-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-blue-800">
            Account
          </Text>
        </View>

        <Text className="mb-1 text-3xl font-bold text-gray-900">Profile</Text>
        <Text className="mb-4 text-sm text-gray-600">
          Signed in with Google
        </Text>

        <View className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
          <Text className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Name
          </Text>
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {displayName}
          </Text>

          <Text className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Email
          </Text>
          <Text className="text-sm text-gray-700">{user?.email ?? "-"}</Text>
        </View>

        {authError ? (
          <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
            <Text className="text-xs text-red-700">{authError}</Text>
          </View>
        ) : null}

        <Pressable
          className="items-center rounded-xl bg-gray-900 px-4 py-3"
          onPress={() => {
            signOut().catch(() => undefined);
          }}
        >
          <Text className="font-semibold text-white">Sign out</Text>
        </Pressable>

        <View className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4">
          <Text className="text-sm leading-6 text-gray-600">
            Data ownership is now aligned to your authenticated account using
            user_id columns and row-level security policies.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;
