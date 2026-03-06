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
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!xpGainEvent || xpGainEvent.amount <= 0) {
      return;
    }

    // Stop any running animation before starting a new one
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    setDisplayAmount(xpGainEvent.amount);
    setIsVisible(true);

    opacity.setValue(0);
    translateY.setValue(12);
    scale.setValue(0.95);

    const animation = Animated.sequence([
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
    ]);

    animationRef.current = animation;

    animation.start(({ finished }) => {
      if (finished) {
        setIsVisible(false);
      }
      animationRef.current = null;
    });
  }, [opacity, scale, translateY, xpGainEvent]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

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
