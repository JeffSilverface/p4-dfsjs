import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";
import { testSessionResponse } from "../fixtures/session.fixtures";
import { testUserResponse } from "../fixtures/user.fixtures";

const token = generateToken(1);

const {
  mockFindById,
  mockFindByIdUser,
  mockFindParticipation,
  mockCreateParticipation,
  mockDeleteParticipation,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockFindByIdUser: vi.fn(),
  mockFindParticipation: vi.fn(),
  mockCreateParticipation: vi.fn(),
  mockDeleteParticipation: vi.fn(),
}));

vi.mock("../../repositories/session.repository", () => ({
  SessionRepository: class {
    findById = mockFindById;
    findParticipationBySessionIdUserId = mockFindParticipation;
    createParticipation = mockCreateParticipation;
    deleteParticipation = mockDeleteParticipation;
  },
}));

vi.mock("../../repositories/user.repository", () => ({
  UserRepository: class {
    findById = mockFindByIdUser;
  },
}));

describe("POST /api/session/:id/participate/:userId", () => {
  it("returns 200 if participation created", async () => {
    mockFindById.mockResolvedValue(testSessionResponse);
    mockFindByIdUser.mockResolvedValue(testUserResponse);
    mockFindParticipation.mockResolvedValue(null);
    mockCreateParticipation.mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/session/1/participate/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).post("/api/session/1/participate/1");

    expect(res.status).toBe(401);
  });

  it("returns 404 if session does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/session/1/participate/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 if user does not exist", async () => {
    mockFindById.mockResolvedValue(testSessionResponse);
    mockFindByIdUser.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/session/1/participate/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 if user already participating", async () => {
    mockFindById.mockResolvedValue(testSessionResponse);
    mockFindByIdUser.mockResolvedValue(testUserResponse);
    mockFindParticipation.mockResolvedValue({ sessionId: 1, userId: 1 });

    const res = await request(app)
      .post("/api/session/1/participate/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/session/:id/participate/:userId", () => {
  it("returns 204 if participation deleted", async () => {
    mockFindParticipation.mockResolvedValue({ sessionId: 1, userId: 1 });
    mockDeleteParticipation.mockResolvedValue(undefined);

    const res = await request(app)
      .delete("/api/session/1/participate/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).delete("/api/session/1/participate/1");

    expect(res.status).toBe(401);
  });

  it("returns 404 if participation does not exist", async () => {
    mockFindParticipation.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/session/1/participate/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
