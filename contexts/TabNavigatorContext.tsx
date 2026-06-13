import React, { createContext, useContext } from 'react';

interface TabNavigatorContextType {
  /** Jump to a main tab by index (0=Home,1=Looking,2=My Cricket,3=Community,4=Store) */
  goToMainTab: (index: number) => void;
  /** Currently active main tab index */
  activeMainTab: number;
}

const TabNavigatorContext = createContext<TabNavigatorContextType>({
  goToMainTab: () => {},
  activeMainTab: 0,
});

export const TabNavigatorProvider = TabNavigatorContext.Provider;

/**
 * Use inside any tab screen to get main tab navigation control.
 * Enables hierarchical swipe: sub-tab edge → advance to next main tab.
 */
export function useTabNavigator() {
  return useContext(TabNavigatorContext);
}
