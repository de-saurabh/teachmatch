import { render, screen } from "@testing-library/react-native";

import App from "./App";

describe("App", () => {
  it("renders the placeholder screen", () => {
    render(<App />);
    expect(screen.getByText(/open up App.tsx/i)).toBeTruthy();
  });
});
