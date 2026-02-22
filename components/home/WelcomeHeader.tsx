/**
 * WelcomeHeader Component - Progressive Overload Gym App
 *
 * Displays welcome message and daily streak information
 */

import { useHome } from "@/contexts";
import React from "react";
import { Text, View } from "react-native";

const WelcomeHeader: React.FC = () => {
  const { user } = useHome();

  return (
    <View>
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Welcome back, {user.username}!
      </Text>
      <Text className="text-gray-600 mb-2">
        Your current streak is{" "}
        <Text className="font-bold">{user.dailyStreak}</Text> days. Keep it up!
      </Text>
    </View>
  );
};

export default WelcomeHeader;
