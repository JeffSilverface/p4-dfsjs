import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import SessionDetail from "../../pages/SessionDetail";
import { testUserResponse } from "../fixture/user.fixture";
import { testSession } from "../fixture/session.fixture";
import { authService } from "../../services/auth.service";
import api from "../../services/api";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getToken: vi.fn(),
  },
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/sessions/1"]}>
      <Routes>
        <Route path="/sessions/:id" element={<SessionDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SessionDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getCurrentUser).mockReturnValue(testUserResponse);
    vi.mocked(authService.getToken).mockReturnValue("fake-token");
    vi.mocked(api.get).mockResolvedValue({ data: testSession });
  });

  it("displays session details", async () => {
    renderWithRoute();

    await waitFor(() => {
      expect(screen.getByText(testSession.name)).toBeInTheDocument();
      expect(screen.getByText(testSession.description)).toBeInTheDocument();
      expect(screen.getByText(/Marie Dupont/)).toBeInTheDocument();
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

    renderWithRoute();

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load session details"),
      ).toBeInTheDocument();
    });
  });

  it("shows Join Session button when user is not participating", async () => {
    renderWithRoute();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Join Session" }),
      ).toBeInTheDocument();
    });
  });

  it("shows Leave Session button when user is participating", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { ...testSession, users: [testUserResponse.id] },
    });

    renderWithRoute();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Leave Session" }),
      ).toBeInTheDocument();
    });
  });

  it("shows Edit and Delete buttons for admin", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      ...testUserResponse,
      admin: true,
    });

    renderWithRoute();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Delete" }),
      ).toBeInTheDocument();
    });
  });

  it("deletes session and navigates to sessions", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      ...testUserResponse,
      admin: true,
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithRoute();

    await waitFor(() => screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sessions");
    });
  });
});
