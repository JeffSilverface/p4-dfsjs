import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";
import { testUserRequest } from "../fixtures/user.fixtures";

const { mockFindByEmail, mockCreate } = vi.hoisted(() => ({
  mockFindByEmail: vi.fn(),
  mockCreate: vi.fn(),
}));

vi.mock("../../repositories/auth.repository", () => ({
  AuthRepository: class {
    findByEmail = mockFindByEmail;
    create = mockCreate;
  },
}));

vi.mock("bcrypt", () => ({
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue("hashedpassword"),
}));


describe("POST /api/auth/register", () => {
  it("returns 201 with token if credentials are ok", async () => {
    mockFindByEmail.mockResolvedValue(null);
    mockCreate.mockResolvedValue(testUserRequest);

    const res = await request(app).post("/api/auth/register").send(testUserRequest);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it.each([
    [{ ...testUserRequest, email: "" }, "email"],
    [{ ...testUserRequest, password: "" }, "password"],
    [{ ...testUserRequest, firstName: "" }, "firstName"],
    [{ ...testUserRequest, lastName: "" }, "lastName"],
    [{ ...testUserRequest, password: "Short" }, "password too short"],
  ])("returns 400 if %s is invalid", async (body, _field) => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(body);

    expect(res.status).toBe(400);
  });

  it("returns 400 if credentials are wrong", async () => {
    mockFindByEmail.mockResolvedValue(testUserRequest);

    const res = await request(app).post("/api/auth/register").send(testUserRequest);

    expect(res.status).toBe(400);
  });
});
