import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, Text, View } from "react-native";

const DAY_ITEM_WIDTH = 50;
const DAY_GAP = 8;
const ARROW_BUTTON_SIZE = 30;
const CONTAINER_HORIZONTAL_PADDING = 0;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

function TrainingCalendar() {
  const [calendarWidth, setCalendarWidth] = useState(0);
  const [today, setToday] = useState(() => getStartOfToday());
  const [anchorDate, setAnchorDate] = useState(() => getStartOfToday());

  useFocusEffect(
    useCallback(() => {
      const normalizedToday = getStartOfToday();
      setToday((current) =>
        current.getTime() === normalizedToday.getTime()
          ? current
          : normalizedToday,
      );
      setAnchorDate((current) =>
        current.getTime() === normalizedToday.getTime()
          ? current
          : normalizedToday,
      );
    }, []),
  );

  const canGoForward = anchorDate.getTime() < today.getTime();

  const visibleDays = calendarWidth
    ? Math.max(
        1,
        Math.floor(
          (calendarWidth -
            CONTAINER_HORIZONTAL_PADDING -
            ARROW_BUTTON_SIZE * 2 -
            DAY_GAP * 2 +
            DAY_GAP) /
            (DAY_ITEM_WIDTH + DAY_GAP),
        ),
      )
    : 7;

  const days = useMemo(() => {
    const end = new Date(anchorDate);
    end.setHours(0, 0, 0, 0);

    if (Number.isNaN(end.getTime())) {
      return [] as Date[];
    }

    const items: Date[] = [];

    for (let offset = 0; offset < visibleDays; offset += 1) {
      const day = new Date(end);
      day.setDate(end.getDate() - offset);
      items.push(day);
    }

    return items;
  }, [anchorDate, visibleDays]);

  if (Number.isNaN(anchorDate.getTime())) {
    return <Text className="text-red-500">Invalid date range.</Text>;
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setCalendarWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  };

  const shiftByVisibleDays = (direction: -1 | 1) => {
    setAnchorDate((current) => {
      const nextDate = new Date(current);
      nextDate.setHours(0, 0, 0, 0);
      nextDate.setDate(nextDate.getDate() + direction);

      if (direction > 0 && nextDate > today) {
        return today;
      }

      return nextDate;
    });
  };

  return (
    <View onLayout={handleLayout} className="flex-1">
      <View
        className="flex-1 flex-row justify-between items-center overflow-hidden"
        style={{ gap: DAY_GAP }}
      >
        <Pressable
          onPress={() => shiftByVisibleDays(-1)}
          className="shrink-0"
          style={{ width: ARROW_BUTTON_SIZE, height: ARROW_BUTTON_SIZE }}
        >
          <View className="h-full w-full items-center justify-center rounded-full border border-indigo-100 bg-white/80">
            <Ionicons name="chevron-back" size={18} color="#4f46e5" />
          </View>
        </Pressable>

        <View
          className="flex-1 items-center justify-center"
          style={{ minWidth: visibleDays * (DAY_ITEM_WIDTH + DAY_GAP) }}
        >
          <View
            className="flex-row-reverse items-center overflow-hidden"
            style={{ gap: DAY_GAP }}
          >
            {days.map((day) => (
              <View
                key={day.toISOString()}
                className="items-center"
                style={{ width: DAY_ITEM_WIDTH }}
              >
                <Text className="text-[10px] font-semibold text-indigo-400">
                  {DAY_LABELS[day.getDay()]}
                </Text>
                <View
                  style={{ width: DAY_ITEM_WIDTH, height: DAY_ITEM_WIDTH }}
                  className={`items-center justify-center rounded-full border ${
                    day.getTime() === today.getTime()
                      ? "border-indigo-500 bg-indigo-100/80"
                      : "border-indigo-100 bg-white/80"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      day.getTime() === today.getTime()
                        ? "text-indigo-700"
                        : "text-indigo-700"
                    }`}
                  >
                    {day.getDate()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => shiftByVisibleDays(1)}
          disabled={!canGoForward}
          className="shrink-0"
          style={{
            width: ARROW_BUTTON_SIZE,
            height: ARROW_BUTTON_SIZE,
            opacity: canGoForward ? 1 : 0.35,
          }}
        >
          <View className="h-full w-full items-center justify-center rounded-full border border-indigo-100 bg-white/80">
            <Ionicons name="chevron-forward" size={18} color="#4f46e5" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export default TrainingCalendar;
