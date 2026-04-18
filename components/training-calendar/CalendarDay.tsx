import React from "react";
import { Text, View } from "react-native";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarDay({
  day,
  width,
  height,
  status,
}: {
  day: Date;
  width: number;
  height: number;
  status: "default" | "completed" | "freezed" | "today";
}) {
  //TODO: add support for completed and freezed statuses, with different colors and styles
  return (
    <View className="items-center" style={{ width: width }}>
      <Text className="font-bold text-base">{DAY_LABELS[day.getDay()]}</Text>
      <View
        style={{ width: width, height: height }}
        className={`items-center justify-center rounded-full border ${
          status === "today"
            ? "border-[#3B3DC9] bg-[#4B4DD9] border-4"
            : "border-indigo-100 bg-white/80"
        }`}
      >
        <Text
          className={`text-xl font-black ${status === "today" ? "text-[#E1E2F4]" : "text-black"}`}
        >
          {day.getDate()}
        </Text>
      </View>
    </View>
  );
}

export default CalendarDay;
