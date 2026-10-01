import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#2b1a10" },
        headerTintColor: "#f5ead6",
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "KopiMatch" }} />
      <Stack.Screen name="jobs" options={{ title: "Loker Barista" }} />
    </Stack>
  );
}
