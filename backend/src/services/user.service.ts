import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

export class UserService {
  async getById(userId: number) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw { status: 404, message: "User not found" };
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
      throw { status: 403, message: "You can only delete your own account" };
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    await userRepository.delete(userId);
  }

  async promoteSelfToAdmin(userId: number) {
    const isDev = (process.env.NODE_ENV || "development") === "development";

    if (!isDev) {
      throw { status: 403, message: "Admin self-promotion is only available in development" };
    }

    const user = await userRepository.findById(userId);

    if (!user) {
      throw { status: 404, message: "User not found" };
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

    const updated = await userRepository.promoteToAdmin(userId);

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
