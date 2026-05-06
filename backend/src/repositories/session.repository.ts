import { Prisma, PrismaClient } from "@prisma/client";
import { CreateSession, UpdateSession } from "../models/session.types";

const prisma = new PrismaClient();

const sessionInclude = {
  teacher: true,
  participants: { include: { user: true } },
};

export type SessionWithDetails = Prisma.SessionGetPayload<{
  include: typeof sessionInclude;
}>;

export class SessionRepository {
  async findByUserId(userId: number) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  async findAll() {
    return prisma.session.findMany({ include: sessionInclude });
  }

  async findBySessionId(sessionId: number) {
    return prisma.session.findUnique({
      where: { id: sessionId },
      include: sessionInclude,
    });
  }

  async findByTeacherId(teacherId: number) {
    return prisma.teacher.findUnique({
      where: { id: teacherId },
    });
  }

  async findParticipationBySessionIdUserId(sessionId: number, userId: number) {
    return prisma.sessionParticipation.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });
  }

  async createSession(data: CreateSession) {
    return prisma.session.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        description: data.description,
        teacherId: data.teacherId,
      },
      include: sessionInclude,
    });
  }

  async createParticipation(sessionId: number, userId: number) {
    return prisma.sessionParticipation.create({ data: { sessionId, userId } });
  }

  async updateSession(data: UpdateSession, sessionId: number) {
    return prisma.session.update({
      where: { id: sessionId },
      data,
      include: sessionInclude,
    });
  }

  async deleteSession(sessionId: number) {
    return prisma.session.delete({
      where: { id: sessionId },
    });
  }
  async deleteParticipation(sessionId: number, userId: number) {
    return prisma.sessionParticipation.delete({
      where: { sessionId_userId: { sessionId, userId } },
    });
  }
}
