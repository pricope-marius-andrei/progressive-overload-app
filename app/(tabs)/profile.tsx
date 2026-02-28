import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const Profile = () => {
  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-50">
      <View className="bg-white rounded-2xl p-7 border border-gray-100 items-center w-full max-w-sm">
        {/* Construction Icon */}
        <View className="bg-yellow-100 rounded-full p-4 mb-5">
          <Ionicons name="construct" size={48} color="#f59e0b" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Coming Soon!
        </Text>

        {/* Description */}
        <Text className="text-gray-600 text-center mb-6 leading-6">
          The Profile section is currently under development. Here you&apos;ll
          be able to:
        </Text>

        {/* Feature List */}
        <View className="w-full mb-6">
          <View className="flex-row items-center mb-3 bg-gray-50 rounded-xl px-3 py-2">
            <View className="bg-indigo-100 rounded-full p-1 mr-3">
              <Ionicons name="person" size={16} color="#6366f1" />
            </View>
            <Text className="text-gray-700">Manage your profile</Text>
          </View>

          <View className="flex-row items-center mb-3 bg-gray-50 rounded-xl px-3 py-2">
            <View className="bg-indigo-100 rounded-full p-1 mr-3">
              <Ionicons name="stats-chart" size={16} color="#6366f1" />
            </View>
            <Text className="text-gray-700">View workout statistics</Text>
          </View>

          <View className="flex-row items-center mb-3 bg-gray-50 rounded-xl px-3 py-2">
            <View className="bg-indigo-100 rounded-full p-1 mr-3">
              <Ionicons name="trophy" size={16} color="#6366f1" />
            </View>
            <Text className="text-gray-700">Track your achievements</Text>
          </View>

          <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2">
            <View className="bg-indigo-100 rounded-full p-1 mr-3">
              <Ionicons name="settings" size={16} color="#6366f1" />
            </View>
            <Text className="text-gray-700">Customize app settings</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2">
          <Text className="text-yellow-800 font-medium text-sm">
            🚧 In Development
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;
