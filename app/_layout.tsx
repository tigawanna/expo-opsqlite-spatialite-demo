import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { InitDatabase } from "@/lib/drizzle/InitDatabase";
import {
  useOnlineManager,
  useAppState,
  onAppStateChange,
} from "@/lib/tanstack/query/react-native-setup-hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/tanstack/query/client";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  useOnlineManager();
  useAppState(onAppStateChange);
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <InitDatabase>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
          </Stack>
          <StatusBar style="auto" />
        </InitDatabase>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
