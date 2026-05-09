import React from "react";
import { Pressable, Text, View } from "react-native";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STATUS_STYLES: Record<
  "selected" | "completed" | "default",
  { container: string; text: string }
> = {
  selected: {
    container:
      "border-indigo-500 bg-indigo-500/20 dark:border-indigo-300 dark:bg-indigo-900/40",
    text: "text-indigo-950 dark:text-indigo-50",
  },
  completed: {
    container:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-200",
  },
  default: {
    container:
      "border-indigo-100 bg-white/80 dark:border-indigo-800 dark:bg-slate-900/70",
    text: "text-indigo-950 dark:text-indigo-50",
  },
};

function CalendarDay({
  day,
  width,
  height,
  status,
  onPress,
}: {
  day: Date;
  width: number;
  height: number;
  status: "selected" | "completed" | "default";
  onPress?: () => void;
}) {
  const styles = STATUS_STYLES[status];
  const dayLabel = DAY_LABELS[day.getDay()];
  const readableDate = day.toDateString();

  return (
    <Pressable
      onPress={onPress}
      className="items-center"
      accessibilityRole="button"
      accessibilityLabel={`Select ${readableDate}`}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      style={({ pressed }) => [
        { width: width },
        pressed ? { opacity: 0.8, transform: [{ scale: 0.98 }] } : null,
      ]}
    >
      <Text className="font-bold text-base text-indigo-700 dark:text-indigo-200">
        {dayLabel}
      </Text>
      <View
        style={{
          width: width,
          height: height,
        }}
        className={`items-center justify-center rounded-full border-4 ${styles.container}`}
      >
        <Text className={`text-2xl font-black ${styles.text}`}>
          {day.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

export default CalendarDay;
