import type { TabConfig } from "@/types/tab.types";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";

interface CustomTabBarProps extends BottomTabBarProps {
  tabConfig?: TabConfig;
  tabOrder?: string[];
  activeColor?: string;
  inactiveColor?: string;
}

const DEFAULT_ACTIVE_COLOR = "#6366f1";
const DEFAULT_INACTIVE_COLOR = "#9ca3af";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  tabConfig = {},
  tabOrder,
  activeColor = DEFAULT_ACTIVE_COLOR,
  inactiveColor = DEFAULT_INACTIVE_COLOR,
}: CustomTabBarProps) {
  // Sort routes by tabOrder if provided
  const sortedRoutes = tabOrder
    ? state.routes.sort(
        (a: { name: string }, b: { name: string }) =>
          (tabOrder.indexOf(a.name) ?? Infinity) -
          (tabOrder.indexOf(b.name) ?? Infinity),
      )
    : state.routes;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
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
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        {sortedRoutes.map(
          (route: { key: string; name: string }, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused =
              state.index ===
              state.routes.findIndex(
                (r: { key: string }) => r.key === route.key,
              );

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

            const routeConfig = tabConfig[route.name];
            const iconName = isFocused
              ? routeConfig?.focused || route.name.toLowerCase()
              : routeConfig?.unfocused || `${route.name.toLowerCase()}-outline`;

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 20,
                }}
              >
                <Ionicons
                  name={iconName as any}
                  size={24}
                  color={isFocused ? activeColor : inactiveColor}
                />
                <Text
                  className="font-black"
                  style={{
                    fontSize: 12,
                    color: isFocused ? activeColor : inactiveColor,
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
