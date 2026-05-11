import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";
import { testSessionResponse } from "../fixtures/session.fixtures";

const token = generateToken(1);

const { mockFindById, mockDeleteSession, mockFindByIdUser } = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockDeleteSession: vi.fn(),
  mockFindByIdUser: vi.fn(),
}));

vi.mock("../../repositories/session.repository", () => ({
  SessionRepository: class {
    findById = mockFindById;
    deleteSession = mockDeleteSession;
  },
}));

vi.mock("../../repositories/user.repository", () => ({
  UserRepository: class {
    findById = mockFindByIdUser;
  },
}));

describe("DELETE /api/session/:id", () => {
  it("returns 204 if session deleted", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: true });
    mockFindById.mockResolvedValue(testSessionResponse);
    mockDeleteSession.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/api/session/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).delete("/api/session/1");

    expect(res.status).toBe(401);
  });

  it("returns 403 if user is not admin", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: false });

    const res = await request(app)
      .delete("/api/session/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 if session does not exist", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: true });
    mockFindById.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/session/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 with invalid id", async () => {
    const res = await request(app)
      .delete("/api/session/wrongId")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
