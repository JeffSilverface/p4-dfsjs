import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {
  async getById(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async delete(userId: number, requestingUserId: number) {
    if (requestingUserId !== userId) {
      throw { status: 403, message: 'You can only delete your own account' };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    await prisma.user.delete({ where: { id: userId } });
  }

  async promoteSelfToAdmin(userId: number) {
    const isDev = (process.env.NODE_ENV || 'development') === 'development';

    if (!isDev) {
      throw { status: 403, message: 'Admin self-promotion is only available in development' };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    if (user.admin) {
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        admin: user.admin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { admin: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      admin: updated.admin,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
