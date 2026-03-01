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
    <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
      <Text className="text-sm font-medium text-gray-500 mb-1">
        Welcome back
      </Text>
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        {user.username}
      </Text>
      <Text className="text-gray-600">
        Ready for today&apos;s training session?
      </Text>

      <View className="mt-4 self-start bg-indigo-50 rounded-full px-3 py-1">
        <Text className="text-primary font-semibold">
          {user.dailyStreak} day streak
        </Text>
      </View>
      <View className="mt-2 self-start bg-indigo-50 rounded-full px-3 py-1">
        <Text className="text-primary font-semibold">
          {user.experienceScore} XP
        </Text>
      </View>
      <Text className="text-gray-500 mt-2 text-sm">
        Open the app daily to keep your streak growing.
      </Text>
    </View>
  );
};

export default WelcomeHeader;
