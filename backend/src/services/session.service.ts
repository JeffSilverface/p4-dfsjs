import { PrismaClient, Prisma } from "@prisma/client";

type SessionWithDetails = Prisma.SessionGetPayload<{
  include: typeof sessionInclude;
}>;

const prisma = new PrismaClient();

const sessionInclude = {
  teacher: true,
  participants: { include: { user: true } },
};

function formatSession(session: SessionWithDetails) {
  return {
    id: session.id,
    name: session.name,
    date: session.date,
    description: session.description,
    teacher: {
      id: session.teacher.id,
      firstName: session.teacher.firstName,
      lastName: session.teacher.lastName,
    },
    users: session.participants.map((p) => p.user.id),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

async function assertAdmin(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.admin) {
    throw { status: 403, message: "Admin access required" };
  }
}

export class SessionService {
  async getAll() {
    const sessions = await prisma.session.findMany({ include: sessionInclude });
    return sessions.map(formatSession);
  }

  async getById(sessionId: number) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: sessionInclude,
    });

    if (!session) {
      throw { status: 404, message: "Session not found" };
    }

    return formatSession(session);
  }

  async create(
    data: {
      name: string;
      date: string;
      description: string;
      teacherId: number;
    },
    requestingUserId: number,
  ) {
    await assertAdmin(requestingUserId);

    const teacher = await prisma.teacher.findUnique({
      where: { id: data.teacherId },
    });
    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    const session = await prisma.session.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        description: data.description,
        teacherId: data.teacherId,
      },
      include: { teacher: true, participants: { include: { user: true } } },
    });

    return formatSession(session);
  }

  async update(
    sessionId: number,
    data: {
      name?: string;
      date?: string;
      description?: string;
      teacherId?: number;
    },
    requestingUserId: number,
  ) {
    await assertAdmin(requestingUserId);

    const existing = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!existing) {
      throw { status: 404, message: "Session not found" };
    }

    const updateData: Prisma.SessionUncheckedUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.date) updateData.date = new Date(data.date);
    if (data.description) updateData.description = data.description;
    if (data.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: data.teacherId },
      });
      if (!teacher) {
        throw { status: 404, message: "Teacher not found" };
      }
      updateData.teacherId = data.teacherId;
    }

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: updateData,
      include: sessionInclude,
    });

    return formatSession(session);
  }

  async delete(sessionId: number, requestingUserId: number) {
    await assertAdmin(requestingUserId);

    const existing = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!existing) {
      throw { status: 404, message: "Session not found" };
    }

    await prisma.session.delete({ where: { id: sessionId } });
  }

  async participate(sessionId: number, userId: number) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw { status: 404, message: "Session not found" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const existing = await prisma.sessionParticipation.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });

    if (existing) {
      throw {
        status: 400,
        message: "User already participating in this session",
      };
    }

    await prisma.sessionParticipation.create({ data: { sessionId, userId } });
  }

  async unparticipate(sessionId: number, userId: number) {
    const participation = await prisma.sessionParticipation.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    });

    if (!participation) {
      throw { status: 404, message: "Participation not found" };
    }

    await prisma.sessionParticipation.delete({
      where: { sessionId_userId: { sessionId, userId } },
    });
  }
}
