import { useAuth } from "@/contexts";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const AuthCallbackScreen: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <ActivityIndicator size="small" color="#2563eb" />
        <Text className="mt-3 text-sm text-gray-600">
          Completing sign in...
        </Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/prerequisite" />;
};

export default AuthCallbackScreen;
