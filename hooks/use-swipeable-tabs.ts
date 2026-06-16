import { useRef, useState } from 'react';
import { Dimensions, ScrollView, Animated } from 'react-native';
import { useTabNavigator } from '@/contexts/TabNavigatorContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UseSwipeableTabsOptions {
  tabs: string[];
  /** Main tab index of the PREVIOUS main tab. Pass -1 if this is the first main tab. */
  prevMainTab?: number;
  /** Main tab index of the NEXT main tab. Pass -1 if this is the last main tab. */
  nextMainTab?: number;
  /** Velocity threshold for edge-swipe to trigger main-tab advance. Default: 0.3 */
  edgeVelocityThreshold?: number;
}

interface UseSwipeableTabsReturn {
  activeTab: string;
  activeIndex: number;
  scrollRef: React.RefObject<ScrollView | null>;
  scrollX: Animated.Value;
  goToTab: (tabName: string) => void;
  goToTabByIndex: (index: number) => void;
  handleScroll: (e: any) => void;
  handleScrollEnd: (e: any) => void;
  handleScrollEndDrag: (e: any) => void;
}

/**
 * Manages horizontal pager state for sub-tab navigation.
 * Handles: active tab sync, programmatic scroll, edge detection for main-tab advance.
 */
export function useSwipeableTabs({
  tabs,
  prevMainTab = -1,
  nextMainTab = -1,
  edgeVelocityThreshold = 0.3,
}: UseSwipeableTabsOptions): UseSwipeableTabsReturn {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { goToMainTab } = useTabNavigator();

  const activeIndex = tabs.indexOf(activeTab);

  const goToTab = (tabName: string) => {
    const index = tabs.indexOf(tabName);
    if (index === -1) return;
    setActiveTab(tabName);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    Animated.spring(scrollX, {
      toValue: index * SCREEN_WIDTH,
      useNativeDriver: false,
    }).start();
  };

  const goToTabByIndex = (index: number) => {
    if (index < 0 || index >= tabs.length) return;
    setActiveTab(tabs[index]);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    Animated.spring(scrollX, {
      toValue: index * SCREEN_WIDTH,
      useNativeDriver: false,
    }).start();
  };

  const handleScrollEnd = (e: any) => {
    const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (pageIndex >= 0 && pageIndex < tabs.length) {
      setActiveTab(tabs[pageIndex]);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: handleScrollEnd,
    }
  );

  const handleScrollEndDrag = (e: any) => {
    // Disabled edge-swipe between main tabs and sub-tabs
  };

  return {
    activeTab,
    activeIndex,
    scrollRef,
    scrollX,
    goToTab,
    goToTabByIndex,
    handleScroll,
    handleScrollEnd,
    handleScrollEndDrag,
  };
}
