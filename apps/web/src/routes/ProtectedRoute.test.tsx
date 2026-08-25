import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ProtectedRoute } from "./ProtectedRoute";

const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn() }));

vi.mock("../lib/auth-client", () => ({
  useSession: useSessionMock,
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Secret dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /login when there is no session", () => {
    useSessionMock.mockReturnValue({ data: null, isPending: false });

    renderProtected();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when a session exists", () => {
    useSessionMock.mockReturnValue({ data: { user: { name: "Ada" } }, isPending: false });

    renderProtected();

    expect(screen.getByText("Secret dashboard")).toBeInTheDocument();
  });
});
