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

jest.mock("./src/lib/auth-client", () => ({
  useSession: () => ({ data: null, isPending: false }),
  signIn: { email: jest.fn() },
  signUp: { email: jest.fn() },
  signOut: jest.fn(),
}));

describe("App", () => {
  it("shows the login screen once fonts are loaded and there is no session", () => {
    render(<App />);
    expect(screen.getByText("Welcome back")).toBeTruthy();
  });
});
