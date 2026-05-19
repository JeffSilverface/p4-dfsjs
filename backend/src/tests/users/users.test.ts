import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";
import { testUserResponse, testAdminResponse } from "../fixtures/user.fixtures";

const token = generateToken(2);

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

describe("GET /api/user/:id", () => {
  it("returns 200 with user", async () => {
    mockFindById.mockResolvedValue(testUserResponse);

    const res = await request(app)
      .get("/api/user/2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/user/2");

    expect(res.status).toBe(401);
  });

  it("returns 404 if user does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/user/2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 with invalid id", async () => {
    const res = await request(app)
      .get("/api/user/wrongId")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe("POST /api/user/promote-admin", () => {
  it("returns 200 with promoted user", async () => {
    mockFindById.mockResolvedValue(testUserResponse);
    mockPromoteToAdmin.mockResolvedValue(testAdminResponse);

    const res = await request(app)
      .post("/api/user/promote-admin")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.admin).toBe(true);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).post("/api/user/promote-admin");

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/user/:id", () => {
  it("returns 204 if user deleted", async () => {
    mockFindById.mockResolvedValue(testUserResponse);
    mockDelete.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/api/user/2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).delete("/api/user/2");

    expect(res.status).toBe(401);
  });

  it("returns 403 if deleting another user", async () => {
    const res = await request(app)
      .delete("/api/user/99")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 if user does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/user/2")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 with invalid id", async () => {
    const res = await request(app)
      .delete("/api/user/wrongId")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
