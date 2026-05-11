import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import app from "../../app";

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

const testUser = {
  email: "user@test.com",
  password: "myfavoritepassword",
  firstName: "Jean",
  lastName: "Peuplu",
};

describe("POST /api/auth/register", () => {
  it("returns 201 with token if credentials are ok", async () => {
    mockFindByEmail.mockResolvedValue(null);
    mockCreate.mockResolvedValue(testUser);

    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
  });

  it("returns 400 if email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, email: "" });

    expect(res.status).toBe(400);
  });

  it("returs 400 if password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, password: "" });

    expect(res.status).toBe(400);
  });

  it("returs 400 if firstName is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, firstName: "" });

    expect(res.status).toBe(400);
  });

  it("returs 400 if lastName is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, lastName: "" });

    expect(res.status).toBe(400);
  });

  it("returs 400 if password is too short", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, password: "Short" });

    expect(res.status).toBe(400);
  });

  it("returns 400 if credentials are wrong", async () => {
    mockFindByEmail.mockResolvedValue(testUser);

    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.status).toBe(400);
  });
});
