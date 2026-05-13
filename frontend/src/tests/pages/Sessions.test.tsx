import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Sessions from "../../pages/Sessions";
import { testUserResponse } from "../fixture/user.fixture";
import { testSession } from "../fixture/session.fixture";
import { authService } from "../../services/auth.service";
import api from "../../services/api";

vi.mock("../../services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getToken: vi.fn(),
  },
}));

vi.mock("../../services/api", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("Sessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getCurrentUser).mockReturnValue(testUserResponse);
    vi.mocked(authService.getToken).mockReturnValue("fake-token");
    vi.mocked(api.get).mockResolvedValue({ data: [testSession] });
  });

  it("displays list of sessions", async () => {
    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(testSession.name)).toBeInTheDocument();
      expect(screen.getByText(/Marie Dupont/)).toBeInTheDocument();
    });
  });

  it("displays empty state when no sessions", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("No sessions available")).toBeInTheDocument();
    });
  });

  it("displays error when API fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Failed to load sessions")).toBeInTheDocument();
    });
  });

  it("shows Create Session link for admin", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      ...testUserResponse,
      admin: true,
    });

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Create Session" }),
      ).toBeInTheDocument();
    });
  });

  it("does not show Create Session link for regular user", async () => {
    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText(testSession.name));
    expect(
      screen.queryByRole("link", { name: "Create Session" }),
    ).not.toBeInTheDocument();
  });

  it("shows Delete button for admin", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      ...testUserResponse,
      admin: true,
    });

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Delete" }),
      ).toBeInTheDocument();
    });
  });

  it("deletes session when confirmed", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      ...testUserResponse,
      admin: true,
    });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        `/session/${testSession.id}`,
        expect.any(Object),
      );
    });
  });
});
