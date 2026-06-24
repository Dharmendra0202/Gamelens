import { TabNavigatorProvider } from "@/contexts/TabNavigatorContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
} from "react-native";

// Import all tab screens directly — rendered side-by-side in pager
import HomeScreen from "./home";
import LookingScreen from "./looking";
import MyCricketScreen from "./my-cricket";
import CommunityScreen from "./Nearby turf";
import StoreScreen from "./Profile";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 50;

const TABS = [
  {
    key: "home",
    label: "Home",
    icon: "home" as const,
    iconFocused: "home" as const,
  },
  {
    key: "looking",
    label: "Looking",
    icon: "search-outline" as const,
    iconFocused: "search" as const,
  },
  {
    key: "my-cricket",
    label: "Sport",
    icon: "baseball-outline" as const,
    iconFocused: "baseball" as const,
  },
  {
    key: "community",
    label: "Nearby Turf",
    icon: "location-outline" as const,
    iconFocused: "location" as const,
  },
  {
    key: "store",
    label: "Profile",
    icon: "person-outline" as const,
    iconFocused: "person" as const,
  },
];

// Tab icon — instant switch, no animation delay
function AnimatedTabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{ transform: [{ scale: focused ? 1.12 : 0.92 }], opacity: focused ? 1 : 0.55 }}>
      <Ionicons name={name} size={21} color={color} />
    </View>
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
        backgroundColor: "#B71C1C",
        opacity,
        marginTop: 2,
      }}
    />
  );
}

// Tab screens rendered in pager — order must match TABS
// Memoized to prevent re-renders on tab switch (activeIndex change)
const MemoizedHome = React.memo(HomeScreen);
const MemoizedLooking = React.memo(LookingScreen);
const MemoizedMyCricket = React.memo(MyCricketScreen);
const MemoizedCommunity = React.memo(CommunityScreen);
const MemoizedStore = React.memo(StoreScreen);

const TAB_SCREENS = [
  MemoizedHome,
  MemoizedLooking,
  MemoizedMyCricket,
  MemoizedCommunity,
  MemoizedStore,
];

export default function TabLayout() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isProgrammaticScroll = useRef(false);

  // Jump to tab — instant scroll, no animation blink
  const goToTab = useCallback(
    (index: number) => {
      isProgrammaticScroll.current = true;
      scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: false });
      setActiveIndex(index);
      scrollX.setValue(index * SCREEN_WIDTH);
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 50);
    },
    [scrollX],
  );

  // Live sync active index from user swipe
  const handleScroll = useCallback(
    (e: any) => {
      if (isProgrammaticScroll.current) return;
      const pageIndex = Math.round(
        e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );
      if (
        pageIndex >= 0 &&
        pageIndex < TABS.length &&
        pageIndex !== activeIndex
      ) {
        setActiveIndex(pageIndex);
      }
    },
    [activeIndex],
  );

  return (
    <TabNavigatorProvider
      value={{ goToMainTab: goToTab, activeMainTab: activeIndex }}
    >
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
            },
          )}
          directionalLockEnabled
          style={styles.pager}
          contentContainerStyle={{ width: SCREEN_WIDTH * TABS.length }}
        >
          {TAB_SCREENS.map((Screen, index) => (
            <View
              key={TABS[index].key}
              style={[
                styles.tabPage,
                { width: SCREEN_WIDTH, paddingBottom: TAB_BAR_HEIGHT },
              ]}
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
              position: "absolute",
              top: 0,
              left: 0,
              width: 24,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: "#B71C1C",
              transform: [
                {
                  translateX: scrollX.interpolate({
                    inputRange: [0, SCREEN_WIDTH * (TABS.length - 1)],
                    outputRange: [
                      (SCREEN_WIDTH / 5 - 24) / 2,
                      (SCREEN_WIDTH / 5 - 24) / 2 +
                        (SCREEN_WIDTH / 5) * (TABS.length - 1),
                    ],
                  }),
                },
              ],
              zIndex: 10,
            }}
          />

          {TABS.map((tab, index) => {
            // Drive icon opacity from scrollX — same as the sliding indicator
            // so they update in the same frame with zero delay
            const focusedOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [0, 1, 0],
              extrapolate: "clamp",
            });
            const unfocusedOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: [1, 0, 1],
              extrapolate: "clamp",
            });
            const labelColor = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH,
              ],
              outputRange: ["#9E9E9E", "#B71C1C", "#9E9E9E"],
              extrapolate: "clamp",
            });

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => goToTab(index)}
                activeOpacity={0.7}
              >
                <View style={styles.tabItemInner}>
                  <View style={{ position: "relative", width: 22, height: 22 }}>
                    <Animated.View style={{ position: "absolute", opacity: unfocusedOpacity }}>
                      <Ionicons name={tab.icon} size={22} color="#9E9E9E" />
                    </Animated.View>
                    <Animated.View style={{ position: "absolute", opacity: focusedOpacity }}>
                      <Ionicons name={tab.iconFocused} size={22} color="#B71C1C" />
                    </Animated.View>
                  </View>
                </View>
                <Animated.Text style={[styles.tabLabel, { color: labelColor }]}>{tab.label}</Animated.Text>
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
    backgroundColor: "#F5F5F5",
  },
  pager: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
    overflow: "hidden",
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    paddingTop: 2,
    paddingBottom: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
  },
  tabItemInner: {
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
