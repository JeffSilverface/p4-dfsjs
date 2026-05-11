import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";

const { mockFindByEmail } = vi.hoisted(() => ({
  mockFindByEmail: vi.fn(),
}));

vi.mock("../../repositories/auth.repository", () => ({
  AuthRepository: class {
    findByEmail = mockFindByEmail;
  },
}));

vi.mock("bcrypt", () => ({
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue("hashedpassword"),
}));

describe("POST /api/auth/login", () => {
  it("returns 200 with token if credentials are ok", async () => {
    mockFindByEmail.mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "hashedpassword",
      firstName: "Jean",
      lastName: "Dupont",
      admin: false,
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "password123" });

    expect(res.status).toBe(400);
  });

  it("returs 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com" });

    expect(res.status).toBe(400);
  });

  it("returns 401 if credentials are wrong", async () => {
    mockFindByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
  });
});
