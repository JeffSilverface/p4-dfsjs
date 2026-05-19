import { describe, expect, it, vi } from "vitest";
import { AuthService } from "../../services/auth.service";
import { testUserResponse, testUserRequest, testLoginRequest } from "../fixtures/user.fixtures";

const { mockFindByEmail, mockCreate, mockCompare, mockHash, mockGenerateToken } = vi.hoisted(() => ({
  mockFindByEmail: vi.fn(),
  mockCreate: vi.fn(),
  mockCompare: vi.fn(),
  mockHash: vi.fn(),
  mockGenerateToken: vi.fn(),
}));

vi.mock("../../repositories/auth.repository", () => ({
  AuthRepository: class {
    findByEmail = mockFindByEmail;
    create = mockCreate;
  },
}));

vi.mock("bcrypt", () => ({
  compare: mockCompare,
  hash: mockHash,
}));

vi.mock("../../utils/jwt.util", () => ({
  generateToken: mockGenerateToken,
}));

describe("AuthService", () => {
  it("login returns user with token", async () => {
    mockFindByEmail.mockResolvedValue(testUserResponse);
    mockCompare.mockResolvedValue(true);
    mockGenerateToken.mockReturnValue("fake-token");
    const authService = new AuthService();
    const result = await authService.login(testLoginRequest.email, testLoginRequest.password);
    expect(result).toEqual({
      id: testUserResponse.id,
      email: testUserResponse.email,
      firstName: testUserResponse.firstName,
      lastName: testUserResponse.lastName,
      admin: testUserResponse.admin,
      token: "fake-token",
    });
  });

  it("login throws 401 when user not found", async () => {
    mockFindByEmail.mockResolvedValue(null);
    const authService = new AuthService();
    await expect(
      authService.login(testLoginRequest.email, testLoginRequest.password),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("login throws 401 when password is wrong", async () => {
    mockFindByEmail.mockResolvedValue(testUserResponse);
    mockCompare.mockResolvedValue(false);
    const authService = new AuthService();
    await expect(
      authService.login(testLoginRequest.email, testLoginRequest.password),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("register creates user and returns token", async () => {
    mockFindByEmail.mockResolvedValue(null);
    mockHash.mockResolvedValue("hashedpassword");
    mockCreate.mockResolvedValue(testUserResponse);
    mockGenerateToken.mockReturnValue("fake-token");
    const authService = new AuthService();
    const result = await authService.register(
      testUserRequest.email,
      testUserRequest.password,
      testUserRequest.firstName,
      testUserRequest.lastName,
    );
    expect(result).toEqual({
      id: testUserResponse.id,
      email: testUserResponse.email,
      firstName: testUserResponse.firstName,
      lastName: testUserResponse.lastName,
      admin: testUserResponse.admin,
      token: "fake-token",
    });
    expect(mockHash).toHaveBeenCalledWith(testUserRequest.password, 10);
  });

  it("register throws 400 when email already exists", async () => {
    mockFindByEmail.mockResolvedValue(testUserResponse);
    const authService = new AuthService();
    await expect(
      authService.register(
        testUserRequest.email,
        testUserRequest.password,
        testUserRequest.firstName,
        testUserRequest.lastName,
      ),
    ).rejects.toMatchObject({ status: 400 });
  });
});
