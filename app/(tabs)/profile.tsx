import React from "react";
import { Text, View } from "react-native";

const Profile: React.FC = () => {
  return (
    <View className="flex-1 bg-gray-50 px-5 py-8 items-center justify-center">
      <View className="w-full max-w-md bg-white rounded-3xl border border-amber-200 p-6 shadow-sm">
        <View className="self-start bg-amber-100 rounded-full px-3 py-1 mb-4">
          <Text className="text-amber-800 text-xs font-semibold uppercase tracking-wide">
            Status
          </Text>
        </View>

        <Text className="text-3xl font-bold text-gray-900 mb-2">Profile</Text>
        <Text className="text-lg font-semibold text-amber-700 mb-4">
          In Development
        </Text>

        <View className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-4">
          <Text className="text-sm text-amber-900 leading-6">
            This tab is currently under construction. New profile features will
            appear here soon.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;
