import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import SessionForm from "../../pages/SessionForm";
import { testUserResponse, testAdminUser } from "../fixture/user.fixture";
import { testSession, testTeacher } from "../fixture/session.fixture";
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
    put: vi.fn(),
  },
}));

function renderCreateForm() {
  return render(
    <MemoryRouter initialEntries={["/sessions/create"]}>
      <Routes>
        <Route path="/sessions/create" element={<SessionForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderEditForm() {
  return render(
    <MemoryRouter initialEntries={["/sessions/edit/1"]}>
      <Routes>
        <Route path="/sessions/edit/:id" element={<SessionForm />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SessionForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.getCurrentUser).mockReturnValue(testAdminUser);
    vi.mocked(authService.getToken).mockReturnValue("fake-token");
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === "/teacher") return Promise.resolve({ data: [testTeacher] });
      return Promise.resolve({ data: testSession });
    });
  });

  it("redirects non-admin to sessions", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue(testUserResponse);

    renderCreateForm();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/sessions");
    });
  });

  it("shows Create New Session title in create mode", async () => {
    renderCreateForm();

    await waitFor(() => {
      expect(screen.getByText("Create New Session")).toBeInTheDocument();
    });
  });

  it("shows Edit Session title in edit mode", async () => {
    renderEditForm();

    await waitFor(() => {
      expect(screen.getByText("Edit Session")).toBeInTheDocument();
    });
  });

  it("pre-fills form in edit mode", async () => {
    renderEditForm();

    await waitFor(() => {
      expect(screen.getByDisplayValue(testSession.name)).toBeInTheDocument();
    });
  });

  it("displays teachers in select", async () => {
    renderCreateForm();

    await waitFor(() => {
      expect(screen.getByText("Marie Dupont")).toBeInTheDocument();
    });
  });

  it("creates session and navigates to sessions", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: testSession });

    renderCreateForm();

    await waitFor(() => screen.getByText("Marie Dupont"));

    fireEvent.submit(screen.getByRole("button", { name: "Create Session" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/session",
        expect.any(Object),
        expect.any(Object),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/sessions");
    });
  });

  it("updates session and navigates to sessions", async () => {
    vi.mocked(api.put).mockResolvedValue({ data: testSession });

    renderEditForm();

    await waitFor(() => screen.getByText("Edit Session"));

    fireEvent.submit(screen.getByRole("button", { name: "Update Session" }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        "/session/1",
        expect.any(Object),
        expect.any(Object),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/sessions");
    });
  });

  it("displays error on save failure", async () => {
    vi.mocked(api.post).mockRejectedValue({
      response: { data: { message: "Teacher not found" } },
    });

    renderCreateForm();

    await waitFor(() => screen.getByText("Marie Dupont"));

    fireEvent.submit(screen.getByRole("button", { name: "Create Session" }));

    await waitFor(() => {
      expect(screen.getByText("Teacher not found")).toBeInTheDocument();
    });
  });
});
