import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { testLoginRequest, testUserResponse } from "../fixtures/user.fixtures";

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
    mockFindByEmail.mockResolvedValue(testUserResponse);

    const res = await request(app)
      .post("/api/auth/login")
      .send(testLoginRequest);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("returns 401 when token format is invalid", async () => {
    const response = await request(app)
      .get("/api/session")
      .set("Authorization", "Bearer");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid token format");
  });

  it("returns 401 when token is invalid", async () => {
    const response = await request(app)
      .get("/api/session")
      .set("Authorization", "Bearer invalidtoken");
    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid or expired token");
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: testLoginRequest.password });

    expect(res.status).toBe(400);
  });

  it("returs 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testLoginRequest.email });

    expect(res.status).toBe(400);
  });

  it("returns 401 if credentials are wrong", async () => {
    mockFindByEmail.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send(testLoginRequest);

    expect(res.status).toBe(401);
  });
});
