import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";
import { testSessionResponse, testSessionRequest } from "../fixtures/session.fixtures";
import { testTeacherResponse } from "../fixtures/teacher.fixtures";

const token = generateToken(1);

const {
  mockFindById,
  mockCreateSession,
  mockUpdateSession,
  mockDeleteSession,
  mockFindByIdUser,
  mockFindByIdTeacher,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockCreateSession: vi.fn(),
  mockUpdateSession: vi.fn(),
  mockDeleteSession: vi.fn(),
  mockFindByIdUser: vi.fn(),
  mockFindByIdTeacher: vi.fn(),
}));

vi.mock("../../repositories/session.repository", () => ({
  SessionRepository: class {
    findById = mockFindById;
    createSession = mockCreateSession;
    updateSession = mockUpdateSession;
    deleteSession = mockDeleteSession;
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

describe("POST /api/session", () => {
  it("returns 201 with session", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: true });
    mockFindByIdTeacher.mockResolvedValue(testTeacherResponse);
    mockCreateSession.mockResolvedValue(testSessionResponse);

    const res = await request(app)
      .post("/api/session")
      .send(testSessionRequest)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(201);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).post("/api/session");

    expect(res.status).toBe(401);
  });

  it("returns 403 if user is not admin", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: false });

    const res = await request(app)
      .post("/api/session")
      .send(testSessionRequest)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it.each([
    [{ ...testSessionRequest, name: "" }, "name"],
    [{ ...testSessionRequest, date: "" }, "date"],
    [{ ...testSessionRequest, description: "" }, "description"],
    [{ ...testSessionRequest, teacherId: null }, "teacherId"],
  ])("returns 400 if %s is missing", async (body, _field) => {
    const res = await request(app)
      .post("/api/session")
      .send(body)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("returns 404 if teacher does not exist", async () => {
    mockFindByIdUser.mockResolvedValue({ id: 1, admin: true });
    mockFindByIdTeacher.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/session")
      .send(testSessionRequest)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

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
