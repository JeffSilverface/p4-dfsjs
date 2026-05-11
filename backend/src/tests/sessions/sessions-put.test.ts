import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";
import { testSessionResponse, testSessionRequest } from "../fixtures/session.fixtures";
import { testTeacherResponse } from "../fixtures/teacher.fixtures";

const token = generateToken(1);

const { mockFindById, mockUpdateSession, mockFindByIdUser, mockFindByIdTeacher } =
  vi.hoisted(() => ({
    mockFindById: vi.fn(),
    mockUpdateSession: vi.fn(),
    mockFindByIdUser: vi.fn(),
    mockFindByIdTeacher: vi.fn(),
  }));

vi.mock("../../repositories/session.repository", () => ({
  SessionRepository: class {
    findById = mockFindById;
    updateSession = mockUpdateSession;
  },
}));

vi.mock("../../repositories/user.repository", () => ({
  UserRepository: class {
    findById = mockFindByIdUser;
  },
}));

vi.mock("../../repositories/teacher.repository", () => ({
  TeacherRepository: class {
    findById = mockFindByIdTeacher;
  },
}));

describe("PUT /api/session/:id", () => {
  it("returns 200 with updated session", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: true });
    mockFindById.mockResolvedValue(testSessionResponse);
    mockFindByIdTeacher.mockResolvedValue(testTeacherResponse);
    mockUpdateSession.mockResolvedValue(testSessionResponse);

    const res = await request(app)
      .put("/api/session/1")
      .send(testSessionRequest)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).put("/api/session/1").send(testSessionRequest);

    expect(res.status).toBe(401);
  });

  it("returns 403 if user is not admin", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: false });

    const res = await request(app)
      .put("/api/session/1")
      .send(testSessionRequest)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 if session does not exist", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: true });
    mockFindById.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/session/1")
      .send(testSessionRequest)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 with invalid id", async () => {
    const res = await request(app)
      .put("/api/session/wrongId")
      .send(testSessionRequest)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
