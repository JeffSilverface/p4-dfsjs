import { describe, expect, it, vi } from "vitest";
import { TeacherService } from "../../services/teacher.service";
import { testTeacherResponse } from "../fixtures/teacher.fixtures";

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

describe("TeacherService", () => {
  it("getAll returns all teachers", async () => {
    mockFindAll.mockResolvedValue([testTeacherResponse]);
    const teacherService = new TeacherService();
    const result = await teacherService.getAll();
    expect(result).toEqual([testTeacherResponse]);
  });

  it("getById returns teacher", async () => {
    mockFindById.mockResolvedValue(testTeacherResponse);
    const teacherService = new TeacherService();
    const result = await teacherService.getById(1);
    expect(result).toEqual(testTeacherResponse);
  });

  it("getById throws 404 when teacher not found", async () => {
    mockFindById.mockResolvedValue(null);
    const teacherService = new TeacherService();
    await expect(teacherService.getById(99)).rejects.toMatchObject({ status: 404 });
  });
});
