import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Profile from "../../pages/Profile";
import { testUserResponse } from "../fixture/user.fixture";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getToken: vi.fn(),
    logout: vi.fn(),
    updateCurrentUser: vi.fn(),
  },
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

import { authService } from "../../services/auth.service";
import api from "../../services/api";

describe("Profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getCurrentUser).mockReturnValue(testUserResponse);
    vi.mocked(authService.getToken).mockReturnValue("fake-token");
    vi.mocked(api.get).mockResolvedValue({ data: testUserResponse });
  });

  it("displays user information", async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(testUserResponse.firstName)).toBeInTheDocument();
      expect(screen.getByText(testUserResponse.lastName)).toBeInTheDocument();
      expect(screen.getByText(testUserResponse.email)).toBeInTheDocument();
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load user information")).toBeInTheDocument();
    });
  });

  it("deletes account and redirects to login", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Delete Account"));
    fireEvent.click(screen.getByText("Delete Account"));

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("does not delete account when confirm is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("Delete Account"));
    fireEvent.click(screen.getByText("Delete Account"));

    expect(authService.logout).not.toHaveBeenCalled();
  });
});
