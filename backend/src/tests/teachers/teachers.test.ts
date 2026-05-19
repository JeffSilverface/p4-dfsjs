import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { generateToken } from "../../utils/jwt.util";
import { testTeacherResponse } from "../fixtures/teacher.fixtures";

const token = generateToken(1);

const { mockFindAll, mockFindById } = vi.hoisted(() => ({
  mockFindAll: vi.fn(),
  mockFindById: vi.fn(),
}));

vi.mock("../../repositories/teacher.repository", () => ({
  TeacherRepository: class {
    findAll = mockFindAll;
    findById = mockFindById;
  },
}));

describe("GET /api/teacher", () => {
  it("returns 200 with array of teachers", async () => {
    mockFindAll.mockResolvedValue([testTeacherResponse]);

    const res = await request(app)
      .get("/api/teacher")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/teacher");

    expect(res.status).toBe(401);
  });
});

describe("GET /api/teacher/:id", () => {
  it("returns 200 with teacher", async () => {
    mockFindById.mockResolvedValue(testTeacherResponse);

    const res = await request(app)
      .get("/api/teacher/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/teacher/1");

    expect(res.status).toBe(401);
  });

  it("returns 404 if teacher does not exist", async () => {
    mockFindById.mockResolvedValue(null);

    const res = await request(app)
      .get("/api/teacher/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 with invalid id", async () => {
    const res = await request(app)
      .get("/api/teacher/wrongId")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});
