import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface TabScreenWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps tab screens in an elegant transition.
 * 480ms duration, easeOutExpo bezier, subtle slide and scale.
 */
export function TabScreenWrapper({ children }: TabScreenWrapperProps) {
  const isFocused = useIsFocused();
  const translateY = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(0.985)).current;

  useEffect(() => {
    if (isFocused) {
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
    } else {
      translateY.setValue(14);
      scale.setValue(0.985);
    }
  }, [isFocused]);

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
