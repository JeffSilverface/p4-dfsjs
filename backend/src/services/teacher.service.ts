import { TeacherRepository } from "../repositories/teacher.repository";

const teacherRepository = new TeacherRepository();

export class TeacherService {
  async getAll() {
    const teachers = await teacherRepository.findAll();

    return teachers.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));
  }

  async getById(teacherId: number) {
    const teacher = await teacherRepository.findById(teacherId);

    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    return {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    };
  }
}
