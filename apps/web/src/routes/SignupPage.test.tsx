import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { SignupPage } from "./SignupPage";

const { signUpEmailMock } = vi.hoisted(() => ({ signUpEmailMock: vi.fn() }));

vi.mock("../lib/auth-client", () => ({
  signUp: { email: signUpEmailMock },
}));

describe("SignupPage", () => {
  it("submits the chosen account type along with the form fields", async () => {
    signUpEmailMock.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByText("School"));
    await user.type(screen.getByLabelText("Full name"), "Ada Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "supersecret");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(signUpEmailMock).toHaveBeenCalledWith({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "supersecret",
      accountType: "SCHOOL",
    });
  });
});
