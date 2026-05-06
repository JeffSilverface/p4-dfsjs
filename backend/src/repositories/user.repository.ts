import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
  async findById(userId: number) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async delete(userId: number) {
    return prisma.user.delete({ where: { id: userId } });
  }

  async promoteToAdmin(userId: number) {
    return prisma.user.update({ where: { id: userId }, data: { admin: true } });
  }
}
