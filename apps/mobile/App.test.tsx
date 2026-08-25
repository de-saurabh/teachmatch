import { render, screen } from "@testing-library/react-native";

import App from "./App";

jest.mock("@expo-google-fonts/caveat", () => ({
  useFonts: () => [true],
  Caveat_700Bold: "Caveat_700Bold",
}));

jest.mock("@expo-google-fonts/figtree", () => ({
  useFonts: () => [true],
  Figtree_400Regular: "Figtree_400Regular",
  Figtree_500Medium: "Figtree_500Medium",
  Figtree_600SemiBold: "Figtree_600SemiBold",
}));

describe("App", () => {
  it("renders the TeachMatch placeholder once fonts are loaded", () => {
    render(<App />);
    expect(screen.getByText("TeachMatch")).toBeTruthy();
  });
});
