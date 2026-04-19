import { useAuth } from "@/contexts";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

const RootIndex: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return <Redirect href="/auth/prerequisite" />;
};

export default RootIndex;
