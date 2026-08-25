import "./global.css";

import { Caveat_700Bold, useFonts as useCaveat } from "@expo-google-fonts/caveat";
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  useFonts as useFigtree,
} from "@expo-google-fonts/figtree";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  const [caveatLoaded] = useCaveat({ Caveat_700Bold });
  const [figtreeLoaded] = useFigtree({ Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold });

  if (!caveatLoaded || !figtreeLoaded) {
    return <View className="flex-1 bg-chalk-board" />;
  }

  return (
    <View className="flex-1 items-center justify-center bg-chalk-board px-6">
      <View className="items-center rounded border-2 border-dashed border-chalk-white/30 px-8 py-10">
        <View className="h-9 w-9 items-center justify-center rounded-full border-2 border-chalk-yellow">
          <Text className="font-figtree-semibold text-chalk-yellow">✓</Text>
        </View>
        <Text className="mt-4 font-caveat text-5xl text-chalk-white">TeachMatch</Text>
        <Text className="mt-2 font-figtree text-chalk-blue">Screens land in the next pass.</Text>
      </View>
      <StatusBar style="light" />
    </View>
  );
}
