import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TabNavigatorProvider } from '@/contexts/TabNavigatorContext';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Import all tab screens directly — rendered side-by-side in pager
import HomeScreen from './home';
import LookingScreen from './looking';
import MyCricketScreen from './my-cricket';
import CommunityScreen from './community';
import StoreScreen from './Turf hub';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 60;

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' as const, iconFocused: 'home' as const },
  { key: 'looking', label: 'Looking', icon: 'search-outline' as const, iconFocused: 'search' as const },
  { key: 'my-cricket', label: 'My Cricket', icon: 'baseball-outline' as const, iconFocused: 'baseball' as const },
  { key: 'community', label: 'Community', icon: 'people-outline' as const, iconFocused: 'people' as const },
  { key: 'store', label: 'Store', icon: 'bag-outline' as const, iconFocused: 'bag' as const },
];

// Animated tab icon
function AnimatedTabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1.12 : 0.92)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0.55)).current;

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
  const width = useRef(new Animated.Value(focused ? 20 : 0)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

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

// Tab screens rendered in pager — order must match TABS
const TAB_SCREENS = [
  HomeScreen,
  LookingScreen,
  MyCricketScreen,
  CommunityScreen,
  StoreScreen,
];

export default function TabLayout() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isProgrammaticScroll = useRef(false);

  // Jump to tab — instant scroll, zero navigation lifecycle overhead
  const goToTab = useCallback((index: number) => {
    isProgrammaticScroll.current = true;
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
    // Programmatic animation updates scrollX directly to match target
    Animated.spring(scrollX, {
      toValue: index * SCREEN_WIDTH,
      useNativeDriver: false,
    }).start();
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 350);
  }, [scrollX]);

  // Live sync active index from user swipe
  const handleScroll = useCallback(
    (e: any) => {
      if (isProgrammaticScroll.current) return;
      const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (pageIndex >= 0 && pageIndex < TABS.length && pageIndex !== activeIndex) {
        setActiveIndex(pageIndex);
      }
    },
    [activeIndex],
  );

  return (
    <TabNavigatorProvider value={{ goToMainTab: goToTab, activeMainTab: activeIndex }}>
    <View style={styles.root}>
      {/* ── Pager: all 5 screens side-by-side ── */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: false,
            listener: handleScroll,
          }
        )}
        directionalLockEnabled
        style={styles.pager}
        contentContainerStyle={{ width: SCREEN_WIDTH * TABS.length }}
      >
        {TAB_SCREENS.map((Screen, index) => (
          <View
            key={TABS[index].key}
            style={[styles.tabPage, { width: SCREEN_WIDTH, paddingBottom: TAB_BAR_HEIGHT }]}
          >
            <Screen />
          </View>
        ))}
      </ScrollView>

      {/* ── Custom Bottom Tab Bar ── */}
      <View style={styles.tabBar}>
        {/* Real-time sliding indicator line */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 24,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: '#B91C1C',
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, SCREEN_WIDTH * (TABS.length - 1)],
                  outputRange: [
                    (SCREEN_WIDTH / 5 - 24) / 2,
                    (SCREEN_WIDTH / 5 - 24) / 2 + (SCREEN_WIDTH / 5) * (TABS.length - 1),
                  ],
                }),
              },
            ],
            zIndex: 10,
          }}
        />

        {TABS.map((tab, index) => {
          const focused = activeIndex === index;
          const color = focused ? '#B91C1C' : '#999';
          const iconName = focused ? tab.iconFocused : tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => goToTab(index)}
              activeOpacity={0.7}
            >
              <View style={styles.tabItemInner}>
                <AnimatedTabIcon name={iconName} color={color} focused={focused} />
              </View>
              <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
    </TabNavigatorProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  pager: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
    overflow: 'hidden',
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 5,
    paddingBottom: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  tabItemInner: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
