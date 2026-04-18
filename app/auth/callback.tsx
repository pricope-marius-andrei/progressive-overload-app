import { useAuth } from "@/contexts";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const AuthCallbackScreen: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

        <View
          style={{ zIndex: 1 }}
          className="w-full max-w-sm items-center rounded-2xl border border-white/70 bg-white/65 px-6 py-6"
        >
          <ActivityIndicator size="small" color="#6366F1" />
          <Text className="mt-3 text-sm text-indigo-700">
            Completing sign in...
          </Text>
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return <Redirect href="/auth/prerequisite" />;
};

export default AuthCallbackScreen;
