import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { authService } from "../services/auth.service";
import { testAuthResponse, testUserRequest } from "./fixture/user.fixture";
import Register from "../pages/Register";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/auth.service", () => ({
  authService: {
    register: vi.fn(),
  },
}));

describe("Register", () => {
  it("displays register form", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" }),
    ).toBeInTheDocument();
  });

  it("redirects to sessions after successful register", async () => {
    vi.mocked(authService.register).mockResolvedValue(testAuthResponse);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: testUserRequest.firstName },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: testUserRequest.lastName },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: testUserRequest.email },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: testUserRequest.password },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sessions");
    });
  });

  it("displays error message on register failure", async () => {
    vi.mocked(authService.register).mockRejectedValue({
      response: { data: { message: "Email already exists" } },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("First Name"), {
      target: { value: "Jean", name: "firstName" },
    });
    fireEvent.change(screen.getByLabelText("Last Name"), {
      target: { value: "Peuplu", name: "lastName" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@test.com", name: "email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123", name: "password" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  it("displays link to login page", () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: "Login here" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});
