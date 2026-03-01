import { useWorkout } from "@/contexts";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";

const XpGainPopup: React.FC = () => {
  const { xpGainEvent } = useWorkout();
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!xpGainEvent || xpGainEvent.amount <= 0) {
      return;
    }

    setDisplayAmount(xpGainEvent.amount);
    setIsVisible(true);

    opacity.setValue(0);
    translateY.setValue(12);
    scale.setValue(0.95);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1100),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setIsVisible(false);
    });
  }, [opacity, scale, translateY, xpGainEvent]);

  if (!isVisible || displayAmount <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      className="absolute top-3 left-0 right-0 items-center z-50"
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }, { scale }],
        }}
        className="bg-indigo-600 rounded-full px-4 py-2"
      >
        <Text className="text-white font-semibold">+{displayAmount} XP</Text>
      </Animated.View>
    </View>
  );
};

export default XpGainPopup;
