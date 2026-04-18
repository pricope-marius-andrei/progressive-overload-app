import { useHome } from "@/contexts";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, LayoutChangeEvent, Text, View } from "react-native";
import CalendarDay from "./CalendarDay";

const DAY_ITEM_WIDTH = 40;
const DAY_GAP = 8;
const CONTAINER_HORIZONTAL_PADDING = 0;
const MAX_PAGE_COUNT = 10;

const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

function TrainingCalendar() {
  const { trainingDateKeys } = useHome();
  const [calendarWidth, setCalendarWidth] = useState(0);
  const [today, setToday] = useState(() => getStartOfToday());

  useFocusEffect(
    useCallback(() => {
      const normalizedToday = getStartOfToday();
      setToday((current) =>
        current.getTime() === normalizedToday.getTime()
          ? current
          : normalizedToday,
      );
    }, []),
  );

  const trainingDateKeySet = useMemo(
    () => new Set(trainingDateKeys),
    [trainingDateKeys],
  );

  const pages = useMemo(
    () => Array.from({ length: MAX_PAGE_COUNT }, (_, index) => index),
    [],
  );

  const visibleDays = calendarWidth
    ? Math.max(
        1,
        Math.floor(
          (calendarWidth -
            CONTAINER_HORIZONTAL_PADDING -
            DAY_GAP * 2 +
            DAY_GAP) /
            (DAY_ITEM_WIDTH + DAY_GAP),
        ),
      )
    : 7;

  if (Number.isNaN(today.getTime())) {
    return <Text className="text-red-500">Invalid date range.</Text>;
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    setCalendarWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  };

  const getDaysForPage = (pageIndex: number) => {
    const end = new Date(today);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() - pageIndex * visibleDays);

    const items: Date[] = [];

    for (let offset = 0; offset < visibleDays; offset += 1) {
      const day = new Date(end);
      day.setDate(end.getDate() - offset);
      items.push(day);
    }

    return items;
  };

  const renderPage = ({ item: pageIndex }: { item: number }) => {
    const days = getDaysForPage(pageIndex);

    return (
      <View
        className="items-center justify-center"
        style={{ width: calendarWidth || undefined }}
      >
        <View
          className="flex-row-reverse items-center"
          style={{
            gap: DAY_GAP,
            minWidth: visibleDays * (DAY_ITEM_WIDTH + DAY_GAP),
          }}
        >
          {days.map((day) => {
            const isToday = day.getTime() === today.getTime();
            const status = isToday
              ? "today"
              : trainingDateKeySet.has(toDateKey(day))
                ? "completed"
                : "default";

            return (
              <CalendarDay
                key={day.toISOString()}
                day={day}
                height={DAY_ITEM_WIDTH}
                width={DAY_ITEM_WIDTH}
                status={status}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View onLayout={handleLayout} className="flex-1">
      <FlatList
        data={pages}
        horizontal
        inverted
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        renderItem={renderPage}
        getItemLayout={(_, index) => ({
          index,
          length: calendarWidth,
          offset: calendarWidth * index,
        })}
        style={{ flexGrow: 0 }}
      />
    </View>
  );
}

export default TrainingCalendar;
