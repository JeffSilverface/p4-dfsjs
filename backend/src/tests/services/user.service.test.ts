import { describe, expect, it, vi, beforeEach } from "vitest";
import { UserService } from "../../services/user.service";
import { testUserResponse, testAdminResponse } from "../fixtures/user.fixtures";

const { mockFindById, mockDelete, mockPromoteToAdmin } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockDelete: vi.fn(),
  mockPromoteToAdmin: vi.fn(),
}));

vi.mock("../../repositories/user.repository", () => ({
  UserRepository: class {
    findById = mockFindById;
    delete = mockDelete;
    promoteToAdmin = mockPromoteToAdmin;
  },
}));

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getById returns user", async () => {
    mockFindById.mockResolvedValue(testUserResponse);
    const userService = new UserService();
    const result = await userService.getById(testUserResponse.id);
    expect(result).toEqual({
      id: testUserResponse.id,
      email: testUserResponse.email,
      firstName: testUserResponse.firstName,
      lastName: testUserResponse.lastName,
      admin: testUserResponse.admin,
      createdAt: testUserResponse.createdAt,
      updatedAt: testUserResponse.updatedAt,
    });
  });

  it("getById throws 404 when user not found", async () => {
    mockFindById.mockResolvedValue(null);
    const userService = new UserService();
    await expect(userService.getById(99)).rejects.toMatchObject({ status: 404 });
  });

  it("delete calls userRepository.delete", async () => {
    mockFindById.mockResolvedValue(testUserResponse);
    const userService = new UserService();
    await userService.delete(testUserResponse.id, testUserResponse.id);
    expect(mockDelete).toHaveBeenCalledWith(testUserResponse.id);
  });

  it("delete throws 403 when deleting another user", async () => {
    const userService = new UserService();
    await expect(userService.delete(2, 1)).rejects.toMatchObject({ status: 403 });
  });

  it("delete throws 404 when user not found", async () => {
    mockFindById.mockResolvedValue(null);
    const userService = new UserService();
    await expect(userService.delete(99, 99)).rejects.toMatchObject({ status: 404 });
  });

  it("promoteSelfToAdmin promotes user", async () => {
    mockFindById.mockResolvedValue(testUserResponse);
    mockPromoteToAdmin.mockResolvedValue({ ...testUserResponse, admin: true });
    const userService = new UserService();
    const result = await userService.promoteSelfToAdmin(testUserResponse.id);
    expect(result.admin).toBe(true);
    expect(mockPromoteToAdmin).toHaveBeenCalledWith(testUserResponse.id);
  });

  it("promoteSelfToAdmin returns user as-is when already admin", async () => {
    mockFindById.mockResolvedValue(testAdminResponse);
    const userService = new UserService();
    const result = await userService.promoteSelfToAdmin(testAdminResponse.id);
    expect(result.admin).toBe(true);
    expect(mockPromoteToAdmin).not.toHaveBeenCalled();
  });

  it("promoteSelfToAdmin throws 404 when user not found", async () => {
    mockFindById.mockResolvedValue(null);
    const userService = new UserService();
    await expect(userService.promoteSelfToAdmin(99)).rejects.toMatchObject({ status: 404 });
  });

  it("promoteSelfToAdmin throws 403 in production", async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const userService = new UserService();
    await expect(userService.promoteSelfToAdmin(1)).rejects.toMatchObject({ status: 403 });
    process.env.NODE_ENV = original;
  });
});
