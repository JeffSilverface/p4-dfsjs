import { describe, expect, it, vi } from "vitest";
import { SessionService } from "../../services/session.service";
import {
  testSessionFormatted,
  testSessionResponse,
  testSessionRequest,
} from "../fixtures/session.fixtures";
import { testTeacherResponse } from "../fixtures/teacher.fixtures";
import { testAdminResponse, testUserResponse } from "../fixtures/user.fixtures";

const {
  mockFindAll,
  mockFindById,
  mockCreateSession,
  mockUpdateSession,
  mockDeleteSession,
  mockFindParticipation,
  mockCreateParticipation,
  mockUserFindById,
  mockTeacherFindById,
} = vi.hoisted(() => ({
  mockFindAll: vi.fn(),
  mockFindById: vi.fn(),
  mockCreateSession: vi.fn(),
  mockUpdateSession: vi.fn(),
  mockDeleteSession: vi.fn(),
  mockFindParticipation: vi.fn(),
  mockCreateParticipation: vi.fn(),
  mockUserFindById: vi.fn(),
  mockTeacherFindById: vi.fn(),
}));

vi.mock("../../repositories/session.repository", () => ({
  SessionRepository: class {
    findAll = mockFindAll;
    findById = mockFindById;
    createSession = mockCreateSession;
    updateSession = mockUpdateSession;
    deleteSession = mockDeleteSession;
    findParticipationBySessionIdUserId = mockFindParticipation;
    createParticipation = mockCreateParticipation;
  },
}));

vi.mock("../../repositories/user.repository", () => ({
  UserRepository: class {
    findById = mockUserFindById;
  },
}));

vi.mock("../../repositories/teacher.repository", () => ({
  TeacherRepository: class {
    findById = mockTeacherFindById;
  },
}));

describe("SessionService tests", () => {
  it("getAll returns formatted sessions", async () => {
    mockFindAll.mockResolvedValue([testSessionResponse]);
    const sessionService = new SessionService();
    const result = await sessionService.getAll();
    expect(result).toEqual([testSessionFormatted]);
  });

  it("Test the getById method of the session service", async () => {
    mockFindById.mockResolvedValue(testSessionResponse);
    mockTeacherFindById.mockResolvedValue(testTeacherResponse);
    const sessionService = new SessionService();
    const response = await sessionService.getById(1);
    expect(response).toEqual(testSessionFormatted);
  });

  it("getById maps participants to users array", async () => {
    mockFindById.mockResolvedValue({
      ...testSessionResponse,
      teacher: testTeacherResponse,
      participants: [{ user: { id: 5 } }, { user: { id: 7 } }],
    });
    const sessionService = new SessionService();
    const result = await sessionService.getById(1);
    expect(result.users).toEqual([5, 7]);
  });

  it("create returns formatted session", async () => {
    mockUserFindById.mockResolvedValue(testAdminResponse);
    mockTeacherFindById.mockResolvedValue(testTeacherResponse);
    mockCreateSession.mockResolvedValue(testSessionResponse);
    const sessionService = new SessionService();
    const result = await sessionService.create(
      testSessionRequest,
      testAdminResponse.id,
    );
    expect(result).toEqual(testSessionFormatted);
  });

  it("create throws 403 when user is not admin", async () => {
    mockUserFindById.mockResolvedValue(testUserResponse);
    const sessionService = new SessionService();
    await expect(
      sessionService.create(testSessionRequest, testUserResponse.id),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("create throws 404 when teacher not found", async () => {
    mockUserFindById.mockResolvedValue(testAdminResponse);
    mockTeacherFindById.mockResolvedValue(null);
    const sessionService = new SessionService();
    await expect(
      sessionService.create(testSessionRequest, testAdminResponse.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("update returns formatted session", async () => {
    mockUserFindById.mockResolvedValue(testAdminResponse);
    mockFindById.mockResolvedValue(testSessionResponse);
    mockTeacherFindById.mockResolvedValue(testTeacherResponse);
    mockUpdateSession.mockResolvedValue(testSessionResponse);
    const sessionService = new SessionService();
    const result = await sessionService.update(
      1,
      { name: "Nouveau nom" },
      testAdminResponse.id,
    );
    expect(result).toEqual(testSessionFormatted);
  });

  it("update throws 404 when session not found", async () => {
    mockUserFindById.mockResolvedValue(testAdminResponse);
    mockFindById.mockResolvedValue(null);
    const sessionService = new SessionService();
    await expect(
      sessionService.update(99, { name: "Nouveau nom" }, testAdminResponse.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("delete calls deleteSession", async () => {
    mockUserFindById.mockResolvedValue(testAdminResponse);
    mockFindById.mockResolvedValue(testSessionResponse);
    const sessionService = new SessionService();
    await sessionService.delete(1, testAdminResponse.id);
    expect(mockDeleteSession).toHaveBeenCalledWith(1);
  });

  it("delete throws 404 when session not found", async () => {
    mockUserFindById.mockResolvedValue(testAdminResponse);
    mockFindById.mockResolvedValue(null);
    const sessionService = new SessionService();
    await expect(
      sessionService.delete(99, testAdminResponse.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("update throws 404 when teacher not found", async () => {
    mockUserFindById.mockResolvedValue(testAdminResponse);
    mockFindById.mockResolvedValue(testSessionResponse);
    mockTeacherFindById.mockResolvedValue(null);
    const sessionService = new SessionService();
    await expect(
      sessionService.update(1, { teacherId: 99 }, testAdminResponse.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("participate calls createParticipation", async () => {
    mockFindById.mockResolvedValue(testSessionResponse);
    mockUserFindById.mockResolvedValue(testUserResponse);
    mockFindParticipation.mockResolvedValue(null);
    const sessionService = new SessionService();
    await sessionService.participate(1, testUserResponse.id);
    expect(mockCreateParticipation).toHaveBeenCalledWith(
      1,
      testUserResponse.id,
    );
  });

  it("participate throws 404 when session not found", async () => {
    mockFindById.mockResolvedValue(null);
    const sessionService = new SessionService();
    await expect(
      sessionService.participate(99, testUserResponse.id),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("participate throws 400 when already participating", async () => {
    mockFindById.mockResolvedValue(testSessionResponse);
    mockUserFindById.mockResolvedValue(testUserResponse);
    mockFindParticipation.mockResolvedValue({ id: 1 });
    const sessionService = new SessionService();
    await expect(
      sessionService.participate(1, testUserResponse.id),
    ).rejects.toMatchObject({ status: 400 });
  });
});
