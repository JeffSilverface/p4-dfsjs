import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";
import { testSessionResponse } from "../fixtures/session.fixtures";

const token = generateToken(1);

const { mockFindAll, mockFindById, mockFindParticipationBySessionIdUserId } =
  vi.hoisted(() => ({
    mockFindAll: vi.fn(),
    mockFindById: vi.fn(),
    mockFindParticipationBySessionIdUserId: vi.fn(),
  }));

vi.mock("../../repositories/session.repository", () => ({
  SessionRepository: class {
    findAll = mockFindAll;
    findById = mockFindById;
    findParticipationBySessionIdUserId = mockFindParticipationBySessionIdUserId;
  },
}));

describe("GET /api/session", () => {
  it("returns 200 with array of sessions", async () => {
    mockFindAll.mockResolvedValue([testSessionResponse, testSessionResponse]);

    const res = await request(app)
      .get("/api/session")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/session");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/session/:id", () => {
  it("returns 200 with session", async () => {
    mockFindById.mockResolvedValue(testSessionResponse);

    const res = await request(app)
      .get("/api/session/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/session/1");

    expect(res.status).toBe(401);
  });

  it("returns 404 if session does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/session/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 with invalid id", async () => {
    const res = await request(app)
      .get("/api/session/wrongId")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
