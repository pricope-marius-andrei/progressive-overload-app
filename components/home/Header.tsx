/**
 * WelcomeHeader Component - Progressive Overload Gym App
 *
 * Displays welcome message and daily streak information
 */
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, View } from "react-native";

function Header() {
  const [streak] = useState(0);
  const [gymLabel] = useState("No Gym Selected");

  return (
    <View className="flex-row justify-between items-center pb-10">
      <View className="flex-row items-center">
        <Ionicons
          name="flame"
          size={35}
          color="#f97316"
          accessibilityLabel="fire icon"
        />
        <Text className="text-3xl font-black">{streak}</Text>
      </View>

      <View className="flex-row items-center gap-1">
        <Text className="text-lg font-semibold text-gray-800">{gymLabel}</Text>
        <Ionicons name="chevron-down" size={20} color="black" />
      </View>
    </View>
  );
}

export default Header;
