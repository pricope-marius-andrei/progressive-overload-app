/**
 * WelcomeHeader Component - Progressive Overload Gym App
 *
 * Displays welcome message and daily streak information
 */

import { useHome } from "@/contexts";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type WelcomeHeaderProps = {
  onOpenGymPicker?: () => void;
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ onOpenGymPicker }) => {
  const { user } = useHome();
  const gymNameLabel = user.gymName?.trim() || "Go to the gym";

  return (
    <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
      <View className="flex flex-row justify-start items-center gap-2">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="bg-indigo-50 rounded-full px-3 py-1">
            <Text className="text-primary font-semibold">
              {user.dailyStreak} day gym streak
            </Text>
          </View>
          <View className=" bg-indigo-50 rounded-full px-3 py-1">
            <Text className="text-primary font-semibold">
              {user.experienceScore} XP
            </Text>
          </View>
        </View>

        <Text
          className="text-sm font-medium text-gray-600"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {gymNameLabel}
        </Text>
        <Pressable
          className="h-9 w-9 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100"
          onPress={onOpenGymPicker}
        >
          <Ionicons name="map-outline" size={18} color="#4f46e5" />
        </Pressable>
      </View>
    </View>
  );
};

export default WelcomeHeader;
