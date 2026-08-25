import "./global.css";

import { Caveat_700Bold, useFonts as useCaveat } from "@expo-google-fonts/caveat";
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  useFonts as useFigtree,
} from "@expo-google-fonts/figtree";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { RootNavigator } from "./src/navigation/RootNavigator";

const queryClient = new QueryClient();

export default function App() {
  const [caveatLoaded] = useCaveat({ Caveat_700Bold });
  const [figtreeLoaded] = useFigtree({ Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold });

  if (!caveatLoaded || !figtreeLoaded) {
    return <View className="flex-1 bg-chalk-board" />;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
