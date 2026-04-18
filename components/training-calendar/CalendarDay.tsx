import React from "react";
import { Pressable, Text, View } from "react-native";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  status: "default" | "completed" | "freezed" | "selected";
  onPress?: () => void;
}) {
  const containerClassName =
    status === "selected"
      ? "border-[#3B3DC9] bg-[#4B4DD9] border-4"
      : status === "completed"
        ? "border-[#bbf7d0] bg-[#dcfce7]"
        : status === "freezed"
          ? "border-sky-100 bg-sky-50"
          : "border-indigo-100 bg-white/80";

  const textClassName =
    status === "selected"
      ? "text-[#E1E2F4]"
      : status === "completed"
        ? "text-[#166534]"
        : status === "freezed"
          ? "text-sky-700"
          : "text-black";

  return (
    <Pressable
      onPress={onPress}
      className="items-center"
      style={{ width: width }}
    >
      <Text className="font-bold text-base">{DAY_LABELS[day.getDay()]}</Text>
      <View
        style={{ width: width, height: height }}
        className={`items-center justify-center rounded-full border ${containerClassName}`}
      >
        <Text className={`text-2xl font-black ${textClassName}`}>
          {day.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

export default CalendarDay;
