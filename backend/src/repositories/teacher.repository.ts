import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class TeacherRepository {
  async findAll() {
    return prisma.teacher.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(teacherId: number) {
    return prisma.teacher.findUnique({ where: { id: teacherId } });
  }
}
