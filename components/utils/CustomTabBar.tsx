import type { TabConfig } from "@/types/tab.types";
import { COLORS } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";

interface CustomTabBarProps extends BottomTabBarProps {
  tabConfig?: TabConfig;
  tabOrder?: string[];
  activeColor?: string;
  inactiveColor?: string;
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  tabConfig = {},
  tabOrder,
  activeColor = COLORS.primary,
  inactiveColor = COLORS.muted,
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
        className="flex-row items-center rounded-full bg-white dark:bg-slate-900 px-6 h-14 shadow-sm"
        style={{ elevation: 6 }}
      >
        {sortedRoutes.map((route: { key: string; name: string }) => {
          const { options } = descriptors[route.key];
          const isFocused =
            state.index ===
            state.routes.findIndex((r: { key: string }) => r.key === route.key);

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
              className="items-center justify-center mx-5"
              accessibilityRole="button"
              accessibilityLabel={`Open ${options.title ?? route.name} tab`}
              accessibilityState={{ selected: isFocused }}
              style={({ pressed }) =>
                pressed
                  ? { opacity: 0.8, transform: [{ scale: 0.98 }] }
                  : undefined
              }
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
        })}
      </View>
    </View>
  );
}
