import { COLORS } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type FeatureItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const FEATURE_LIST: FeatureItem[] = [
  { icon: "person", label: "Manage your profile" },
  { icon: "stats-chart", label: "View workout statistics" },
  { icon: "trophy", label: "Track your achievements" },
  { icon: "settings", label: "Customize app settings" },
];

const Profile = () => {
  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-50">
      <View className="bg-white rounded-2xl p-7 border border-gray-100 items-center w-full max-w-sm">
        <View className="bg-yellow-100 rounded-full p-4 mb-5">
          <Ionicons name="construct" size={48} color="#f59e0b" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Coming Soon!
        </Text>

        <Text className="text-gray-600 text-center mb-6 leading-6">
          The Profile section is currently under development. Here you&apos;ll
          be able to:
        </Text>

        <View className="w-full mb-6">
          {FEATURE_LIST.map((feature) => (
            <View
              key={feature.icon}
              className="flex-row items-center mb-3 bg-gray-50 rounded-xl px-3 py-2"
            >
              <View className="bg-indigo-100 rounded-full p-1 mr-3">
                <Ionicons
                  name={feature.icon}
                  size={16}
                  color={COLORS.primary}
                />
              </View>
              <Text className="text-gray-700">{feature.label}</Text>
            </View>
          ))}
        </View>

        <View className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2">
          <Text className="text-yellow-800 font-medium text-sm">
            In Development
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;
