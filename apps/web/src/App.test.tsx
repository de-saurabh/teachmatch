import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("./lib/auth-client", () => ({
  useSession: () => ({ data: null, isPending: false }),
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
}));

describe("App", () => {
  it("redirects unauthenticated visitors to the login page", async () => {
    render(<App />);

    expect(await screen.findByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
  });
});
