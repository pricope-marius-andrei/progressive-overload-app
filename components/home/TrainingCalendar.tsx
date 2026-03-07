import { useHome } from "@/contexts";
import React, { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GRID_CELL_WIDTH = "14.2857%";

function toMonthId(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function toMonthStartFromDateKey(dateKey: string): Date | null {
  const [rawYear, rawMonth] = dateKey.split("-");
  const year = Number(rawYear);
  const month = Number(rawMonth);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return new Date(year, month - 1, 1);
}

function toDateKey(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, "0");
  const date = String(day).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

const TrainingCalendar: React.FC = () => {
  const { trainingDateKeys } = useHome();

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonthIndex = now.getMonth();
  const todayDay = now.getDate();
  const todayMonth = useMemo(
    () => new Date(todayYear, todayMonthIndex, 1),
    [todayYear, todayMonthIndex],
  );

  const { minAllowedMonth, maxAllowedMonth } = useMemo(() => {
    if (trainingDateKeys.length === 0) {
      return {
        minAllowedMonth: null as Date | null,
        maxAllowedMonth: null as Date | null,
      };
    }

    const sortedDateKeys = [...trainingDateKeys].sort();
    const firstTrainingMonth = toMonthStartFromDateKey(sortedDateKeys[0]);
    const lastTrainingMonth = toMonthStartFromDateKey(
      sortedDateKeys[sortedDateKeys.length - 1],
    );

    return {
      minAllowedMonth: firstTrainingMonth,
      maxAllowedMonth: lastTrainingMonth,
    };
  }, [trainingDateKeys]);

  const minAllowedMonthId = minAllowedMonth ? toMonthId(minAllowedMonth) : null;
  const maxAllowedMonthId = maxAllowedMonth ? toMonthId(maxAllowedMonth) : null;

  const initialVisibleMonth = maxAllowedMonth ?? todayMonth;

  const [visibleMonth, setVisibleMonth] = useState(() => initialVisibleMonth);

  useEffect(() => {
    setVisibleMonth((previousMonth) => {
      const previousMonthId = toMonthId(previousMonth);

      if (minAllowedMonthId !== null && previousMonthId < minAllowedMonthId) {
        return minAllowedMonth ?? previousMonth;
      }

      if (maxAllowedMonthId !== null && previousMonthId > maxAllowedMonthId) {
        return maxAllowedMonth ?? previousMonth;
      }

      return previousMonth;
    });
  }, [maxAllowedMonth, maxAllowedMonthId, minAllowedMonth, minAllowedMonthId]);

  const currentYear = visibleMonth.getFullYear();
  const currentMonthIndex = visibleMonth.getMonth();
  const visibleMonthId = toMonthId(visibleMonth);
  const firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const isCurrentMonth =
    currentYear === todayYear && currentMonthIndex === todayMonthIndex;

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  const trainingDatesSet = useMemo(
    () => new Set(trainingDateKeys),
    [trainingDateKeys],
  );

  const canGoPreviousMonth =
    minAllowedMonthId !== null && visibleMonthId > minAllowedMonthId;
  const canGoNextMonth =
    maxAllowedMonthId !== null && visibleMonthId < maxAllowedMonthId;
  const canJumpToLatestMonth =
    maxAllowedMonthId !== null && visibleMonthId !== maxAllowedMonthId;

  const goToPreviousMonth = () => {
    if (!canGoPreviousMonth) {
      return;
    }

    setVisibleMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    if (!canGoNextMonth) {
      return;
    }

    setVisibleMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + 1, 1),
    );
  };

  const jumpToLatestMonth = () => {
    if (!maxAllowedMonth) {
      return;
    }

    setVisibleMonth(maxAllowedMonth);
  };

  return (
    <View className="bg-white rounded-2xl p-5 border border-gray-100 mb-4">
      <Text className="text-base font-semibold text-gray-900 mb-3">
        Training Calendar
      </Text>

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm text-gray-500">{monthLabel}</Text>

        <View className="flex-row items-center">
          <TouchableOpacity
            className={`h-7 px-2 rounded-md border items-center justify-center mr-2 ${
              canJumpToLatestMonth
                ? "border-gray-200"
                : "border-gray-100 bg-gray-50"
            }`}
            onPress={jumpToLatestMonth}
            disabled={!canJumpToLatestMonth}
          >
            <Text
              className={`text-xs font-medium ${
                canJumpToLatestMonth ? "text-gray-600" : "text-gray-300"
              }`}
            >
              Latest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-8 w-8 rounded-full border items-center justify-center mr-2 ${
              canGoPreviousMonth
                ? "border-gray-200"
                : "border-gray-100 bg-gray-50"
            }`}
            onPress={goToPreviousMonth}
            disabled={!canGoPreviousMonth}
          >
            <Text
              className={`text-base ${canGoPreviousMonth ? "text-gray-600" : "text-gray-300"}`}
            >
              {"<"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`h-8 w-8 rounded-full border items-center justify-center ${
              canGoNextMonth ? "border-gray-200" : "border-gray-100 bg-gray-50"
            }`}
            onPress={goToNextMonth}
            disabled={!canGoNextMonth}
          >
            <Text
              className={`text-base ${canGoNextMonth ? "text-gray-600" : "text-gray-300"}`}
            >
              {">"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={{ width: GRID_CELL_WIDTH }}>
            <Text className="text-center text-xs font-medium text-gray-400">
              {label}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <View
            key={`spacer-${index}`}
            style={{ width: GRID_CELL_WIDTH }}
            className="py-2"
          />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dateKey = toDateKey(currentYear, currentMonthIndex, day);
          const hasTraining = trainingDatesSet.has(dateKey);
          const isToday = isCurrentMonth && day === todayDay;

          return (
            <View
              key={dateKey}
              style={{ width: GRID_CELL_WIDTH }}
              className="py-1 items-center"
            >
              <View
                className={`h-8 w-8 rounded-full items-center justify-center ${
                  hasTraining
                    ? "bg-primary"
                    : isToday
                      ? "border border-primary"
                      : ""
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    hasTraining
                      ? "text-white"
                      : isToday
                        ? "text-primary"
                        : "text-gray-600"
                  }`}
                >
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View className="mt-4 flex-row items-center">
        <View className="h-2.5 w-2.5 rounded-full bg-primary mr-2" />
        <Text className="text-xs text-gray-500">
          Day with at least one training logged
        </Text>
      </View>

      {minAllowedMonth && maxAllowedMonth ? (
        <Text className="text-xs text-gray-400 mt-2">
          Range:{" "}
          {new Intl.DateTimeFormat(undefined, {
            month: "short",
            year: "numeric",
          }).format(minAllowedMonth)}{" "}
          to{" "}
          {new Intl.DateTimeFormat(undefined, {
            month: "short",
            year: "numeric",
          }).format(maxAllowedMonth)}
        </Text>
      ) : (
        <Text className="text-xs text-gray-400 mt-2">
          No trainings registered yet.
        </Text>
      )}
    </View>
  );
};

export default TrainingCalendar;
