import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

interface TabScreenWrapperProps {
  children: React.ReactNode;
  /** @deprecated No longer needed — pager handles all swipe navigation */
  swipeEnabled?: boolean;
}

/**
 * Wraps tab screens in an elegant entrance transition.
 * 480ms, easeOutExpo bezier, subtle slide and scale on mount.
 * Swipe navigation is handled by the root pager in _layout.tsx.
 */
export function TabScreenWrapper({ children }: TabScreenWrapperProps) {
  const translateY = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 480,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
