import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";

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

const testResponse = {
  id: 1,
  name: "Yoga du matin",
  date: new Date("2026-06-01T09:00:00.000Z"),
  description: "Session de yoga pour débutants",
  teacherId: 1,
  teacher: {
    id: 1,
    firstName: "Marie",
    lastName: "Dupont",
  },
  participants: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("Get /api/session", () => {
  it("returns 200 with an array of sessions", async () => {
    mockFindAll.mockResolvedValue([testResponse, testResponse]);

    const res = await request(app)
      .get("/api/session")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/session");

    expect(res.status).toBe(401);
  });

  it("returns 200 with a session", async () => {
    mockFindById.mockResolvedValue(testResponse);

    const res = await request(app)
      .get("/api/session/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/session/1");

    expect(res.status).toBe(401);
  });

  it("returns 404 when the session doesn't exist", async () => {
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
