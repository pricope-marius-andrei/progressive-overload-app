import { useWorkout } from "@/contexts/WorkoutContext";
import { getSnapshotDate } from "@/contexts/workout/workout.repository";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const DATE_CARD_WIDTH = 96;
const DATE_CARD_GAP = 8;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getDateFromSnapshot(snapshotDate: string): Date {
  return new Date(`${snapshotDate}T00:00:00`);
}

function getDayLabel(snapshotDate: string): string {
  const date = getDateFromSnapshot(snapshotDate);
  return WEEKDAY_LABELS[date.getDay()];
}

function getMonthDayLabel(snapshotDate: string): string {
  const date = getDateFromSnapshot(snapshotDate);
  const month = MONTH_LABELS[date.getMonth()];
  return `${month} ${date.getDate()}`;
}

const WorkoutDatePicker: React.FC = () => {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const {
    selectedSnapshotDate,
    selectableSnapshotDates,
    setSelectedSnapshotDate,
  } = useWorkout();

  const orderedSnapshotDates = React.useMemo(() => {
    if (selectableSnapshotDates.length > 0) {
      return [...selectableSnapshotDates].reverse();
    }

    return [getSnapshotDate()];
  }, [selectableSnapshotDates]);

  const horizontalInset = Math.max((containerWidth - DATE_CARD_WIDTH) / 2, 0);

  React.useEffect(() => {
    if (orderedSnapshotDates.length === 0) {
      return;
    }

    const selectedIndex = orderedSnapshotDates.indexOf(selectedSnapshotDate);

    if (selectedIndex < 0) {
      return;
    }

    const targetOffset = selectedIndex * (DATE_CARD_WIDTH + DATE_CARD_GAP);

    const frameId = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        x: targetOffset,
        y: 0,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [containerWidth, orderedSnapshotDates, selectedSnapshotDate]);

  return (
    <View
      className="mb-1"
      onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: horizontalInset }}
        snapToInterval={DATE_CARD_WIDTH + DATE_CARD_GAP}
        decelerationRate="fast"
      >
        {orderedSnapshotDates.map((date) => {
          const isSelected = selectedSnapshotDate === date;

          return (
            <TouchableOpacity
              key={date}
              className={`flex items-center rounded-xl border py-2.5 mr-2 ${
                isSelected
                  ? "border-indigo-500 bg-indigo-500 dark:bg-indigo-400"
                  : "border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60"
              }`}
              style={{ width: DATE_CARD_WIDTH }}
              onPress={() => setSelectedSnapshotDate(date)}
              accessibilityRole="button"
              accessibilityLabel={`Select ${getMonthDayLabel(date)}`}
            >
              <Text
                className={`text-xs ${
                  isSelected
                    ? "text-white"
                    : "text-indigo-500 dark:text-indigo-200"
                }`}
              >
                {getDayLabel(date)}
              </Text>
              <Text
                className={`text-sm font-semibold ${
                  isSelected
                    ? "text-white"
                    : "text-indigo-900 dark:text-indigo-50"
                }`}
              >
                {getMonthDayLabel(date)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default WorkoutDatePicker;
