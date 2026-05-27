import { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewStyle,
  DimensionValue,
} from 'react-native';

import { useThemeStore } from '../../store/useThemeStore';
import { Colors } from '../../constants/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark
            ? Colors.dark.surf2
            : Colors.light.surf2,
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 0.9],
          }),
        },
        style,
      ]}
    />
  );
}

export function SessionCardSkeleton() {
  return (
    <View style={skStyles.card}>
      <View style={skStyles.row}>
        <Skeleton width={38} height={38} borderRadius={10} />

        <View style={skStyles.textWrap}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} />
        </View>

        <Skeleton width={32} height={22} borderRadius={6} />
      </View>

      <View style={skStyles.tagRow}>
        <Skeleton width={100} height={24} borderRadius={20} />
        <Skeleton width={80} height={24} borderRadius={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

const skStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  textWrap: {
    flex: 1,
    gap: 6,
  },

  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
});