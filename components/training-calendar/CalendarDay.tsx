import { statusColors, type StatusType } from "@/utils/colors";
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
  status: StatusType;
  onPress?: () => void;
}) {
  const colors = statusColors[status];

  return (
    <Pressable
      onPress={onPress}
      className="items-center"
      style={{ width: width }}
    >
      <Text className="font-bold text-base">{DAY_LABELS[day.getDay()]}</Text>
      <View
        style={{
          width: width,
          height: height,
          borderColor: colors.border,
          backgroundColor: colors.bg,
        }}
        className="items-center justify-center rounded-full border-4"
      >
        <Text style={{ color: colors.text }} className="text-2xl font-black">
          {day.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

export default CalendarDay;
