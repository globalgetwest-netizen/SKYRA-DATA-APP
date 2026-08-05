import { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '@/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  rounded?: number;
}

/** Subtle shimmer placeholder used while data loads. */
export function Skeleton({ width = '100%', height = 16, style, rounded = radius.sm }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: rounded },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.surfaceSunken },
});
