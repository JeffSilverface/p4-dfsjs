import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TeacherService {
  async getAll() {
    const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: 'desc' } });

    return teachers.map((teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt,
    }));
  }

  async getById(teacherId: number) {
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });

    if (!teacher) {
      throw { status: 404, message: 'Teacher not found' };
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
