import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 480,
            gestureEnabled: true,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
              animation: "slide_from_right",
              animationDuration: 480,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: "slide_from_right",
              animationDuration: 480,
            }}
          />
          <Stack.Screen name="setup/players" options={{ headerShown: false }} />
          <Stack.Screen name="setup/match" options={{ headerShown: false }} />
          <Stack.Screen name="profile/setup" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "transparentModal",
              animation: "fade",
              animationDuration: 250,
              title: "Modal",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
