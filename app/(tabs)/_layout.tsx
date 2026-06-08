import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

// Animated tab icon with scale + fade entrance
function AnimatedTabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.12 : 0.92,
        tension: 200,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0.55,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Ionicons name={name} size={20} color={color} />
    </Animated.View>
  );
}

// Animated active indicator dot
function TabIndicator({ focused }: { focused: boolean }) {
  const width = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(width, {
        toValue: focused ? 20 : 0,
        tension: 200,
        friction: 14,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        width,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#B91C1C',
        opacity,
        marginTop: 2,
      }}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#B91C1C',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
          position: 'absolute',
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <AnimatedTabIcon name="home" color={color} focused={focused} />
              <TabIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="looking"
        options={{
          title: 'Looking',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <AnimatedTabIcon name="search" color={color} focused={focused} />
              <TabIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="my-cricket"
        options={{
          title: 'My Cricket',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <AnimatedTabIcon name="baseball" color={color} focused={focused} />
              <TabIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <AnimatedTabIcon name="people" color={color} focused={focused} />
              <TabIndicator focused={focused} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <AnimatedTabIcon name="bag" color={color} focused={focused} />
              <TabIndicator focused={focused} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
