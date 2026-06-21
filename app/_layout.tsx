import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
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
            <Stack.Screen
              name="setup/players"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="setup/match" options={{ headerShown: false }} />
            <Stack.Screen
              name="profile/setup"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="forgot-password"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="turf-management"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="admin"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="my-bookings"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="saved-addresses"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="payment-methods"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="help-support"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="special-offers"
              options={{ headerShown: false }}
            />
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
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
