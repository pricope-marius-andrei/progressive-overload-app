import { useAuth } from "@/contexts";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const Profile: React.FC = () => {
  const { authError, isAuthenticated, isLoading, signOut, user } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF2FF] px-5 py-8">
        <ActivityIndicator size="small" color="#6366F1" />
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
    <View className="relative flex-1 items-center justify-center bg-[#EEF2FF] px-5 py-8">
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
        style={{ zIndex: 1 }}
        className="w-full max-w-md rounded-3xl border border-white/70 bg-white/65 p-6"
      >
        <View className="mb-4 self-start rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Account
          </Text>
        </View>

        <Text className="mb-1 text-3xl font-semibold text-indigo-950">
          Profile
        </Text>
        <Text className="mb-4 text-sm text-indigo-700">
          Signed in with Google
        </Text>

        <View className="mb-4 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-4">
          <Text className="mb-1 text-xs uppercase tracking-wide text-indigo-500">
            Name
          </Text>
          <Text className="mb-3 text-base font-semibold text-indigo-950">
            {displayName}
          </Text>

          <Text className="mb-1 text-xs uppercase tracking-wide text-indigo-500">
            Email
          </Text>
          <Text className="text-sm text-indigo-800">{user?.email ?? "-"}</Text>
        </View>

        {authError ? (
          <View className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2">
            <Text className="text-xs text-indigo-700">{authError}</Text>
          </View>
        ) : null}

        <Pressable
          className="items-center rounded-xl bg-indigo-500 px-4 py-3"
          onPress={() => {
            signOut().catch(() => undefined);
          }}
        >
          <Text className="font-semibold text-white">Sign out</Text>
        </Pressable>

        <View className="mt-4 rounded-2xl border border-dashed border-indigo-200 bg-white/70 px-4 py-4">
          <Text className="text-sm leading-6 text-indigo-700">
            Data ownership is now aligned to your authenticated account using
            user_id columns and row-level security policies.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;
