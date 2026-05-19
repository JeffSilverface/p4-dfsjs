import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../../services/auth.service";
import { testAuthResponse, testUserResponse } from "../fixture/user.fixture";

vi.mock("../../services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from "../../services/api";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("login stores token and user in localStorage", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: testAuthResponse });

    await authService.login({ email: testAuthResponse.email, password: "password" });

    expect(localStorage.getItem("token")).toBe(testAuthResponse.token);
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual(testAuthResponse);
  });

  it("login returns auth response", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: testAuthResponse });

    const result = await authService.login({ email: testAuthResponse.email, password: "password" });

    expect(result).toEqual(testAuthResponse);
  });

  it("register stores token and user in localStorage", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: testAuthResponse });

    await authService.register({
      email: testAuthResponse.email,
      password: "password",
      firstName: testAuthResponse.firstName,
      lastName: testAuthResponse.lastName,
    });

    expect(localStorage.getItem("token")).toBe(testAuthResponse.token);
  });

  it("logout removes token and user from localStorage", () => {
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("user", JSON.stringify(testUserResponse));

    authService.logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("getCurrentUser returns parsed user from localStorage", () => {
    localStorage.setItem("user", JSON.stringify(testUserResponse));

    const result = authService.getCurrentUser();

    expect(result).toEqual(testUserResponse);
  });

  it("getCurrentUser returns null when no user in localStorage", () => {
    expect(authService.getCurrentUser()).toBeNull();
  });

  it("getToken returns token from localStorage", () => {
    localStorage.setItem("token", "fake-token");

    expect(authService.getToken()).toBe("fake-token");
  });

  it("isAuthenticated returns true when token exists", () => {
    localStorage.setItem("token", "fake-token");

    expect(authService.isAuthenticated()).toBe(true);
  });

  it("isAuthenticated returns false when no token", () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  it("updateCurrentUser merges updates into existing user", () => {
    localStorage.setItem("user", JSON.stringify(testUserResponse));

    const result = authService.updateCurrentUser({ admin: true });

    expect(result?.admin).toBe(true);
    expect(JSON.parse(localStorage.getItem("user")!).admin).toBe(true);
  });

  it("updateCurrentUser returns null when no user in localStorage", () => {
    expect(authService.updateCurrentUser({ admin: true })).toBeNull();
  });
});
