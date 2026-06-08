import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';

type TransitionType = 'slideRight' | 'slideLeft' | 'slideUp' | 'scaleIn';

interface AnimatedViewTransitionProps {
  /** Key that triggers the transition when changed */
  transitionKey: string;
  /** Children to render with the animation */
  children: React.ReactNode;
  /** Type of transition animation */
  type?: TransitionType;
  /** Additional container style */
  style?: ViewStyle;
}

/**
 * Timing-based transition using a 480ms duration.
 * Uses custom cubic bezier for extremely polished, smooth motion.
 * Uses native driver for 60fps execution.
 */
export function AnimatedViewTransition({
  transitionKey,
  children,
  type = 'slideUp',
  style,
}: AnimatedViewTransitionProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset based on transition type
    switch (type) {
      case 'slideRight':
        translateX.setValue(35);
        translateY.setValue(0);
        scale.setValue(1);
        break;
      case 'slideLeft':
        translateX.setValue(-35);
        translateY.setValue(0);
        scale.setValue(1);
        break;
      case 'slideUp':
        translateX.setValue(0);
        translateY.setValue(14);
        scale.setValue(0.985);
        break;
      case 'scaleIn':
        translateX.setValue(0);
        translateY.setValue(0);
        scale.setValue(0.96);
        break;
    }

    // Animate to final position with slow, smooth curve
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 480,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
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
  }, [transitionKey]);

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [
            { translateX },
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
