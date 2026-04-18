import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center", // 👈 centers horizontally
      }}
    >
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#fff",
          borderRadius: 30,
          height: 60,
          paddingHorizontal: 20,
          alignItems: "center",
          elevation: 5, // Android shadow
          shadowColor: "#000", // iOS shadow
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        {state.routes.map(
          (route: { key: string; name: string }, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconName =
              route.name === "Home"
                ? isFocused
                  ? "home"
                  : "home-outline"
                : isFocused
                  ? "person"
                  : "person-outline";

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 20, // 👈 spacing between tabs
                }}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? "#6366f1" : "#9ca3af"}
                />
                <Text
                  className="font-black"
                  style={{
                    fontSize: 12,
                    color: isFocused ? "#6366f1" : "#9ca3af",
                  }}
                >
                  {options.title ?? route.name}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>
    </View>
  );
}
