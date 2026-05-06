import {
  SessionRepository,
  SessionWithDetails,
} from "../repositories/session.repository";
import { CreateSession, UpdateSession } from "../models/session.types";
import { TeacherRepository } from "../repositories/teacher.repository";
import { UserRepository } from "../repositories/user.repository";

const teacherRepository = new TeacherRepository();
const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

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
  const user = await userRepository.findById(userId);
  if (!user?.admin) {
    throw { status: 403, message: "Admin access required" };
  }
}

export class SessionService {
  async getAll() {
    const sessions = await sessionRepository.findAll();
    return sessions.map(formatSession);
  }

  async getById(sessionId: number) {
    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      throw { status: 404, message: "Session not found" };
    }

    return formatSession(session);
  }

  async create(data: CreateSession, requestingUserId: number) {
    await assertAdmin(requestingUserId);

    const teacher = await teacherRepository.findById(data.teacherId);

    if (!teacher) {
      throw { status: 404, message: "Teacher not found" };
    }

    const session = await sessionRepository.createSession(data);

    return formatSession(session);
  }

  async update(
    sessionId: number,
    data: UpdateSession,
    requestingUserId: number,
  ) {
    await assertAdmin(requestingUserId);

    const existing = await sessionRepository.findById(sessionId);
    if (!existing) {
      throw { status: 404, message: "Session not found" };
    }

    const updateData: UpdateSession = {};

    if (data.name) updateData.name = data.name;
    if (data.date) updateData.date = new Date(data.date);
    if (data.description) updateData.description = data.description;
    if (data.teacherId) {
      const teacher = await teacherRepository.findById(data.teacherId);
      if (!teacher) {
        throw { status: 404, message: "Teacher not found" };
      }
      updateData.teacherId = data.teacherId;
    }

    const session = await sessionRepository.updateSession(
      updateData,
      sessionId,
    );

    return formatSession(session);
  }

  async delete(sessionId: number, requestingUserId: number) {
    await assertAdmin(requestingUserId);

    const existing = await sessionRepository.findById(sessionId);

    if (!existing) {
      throw { status: 404, message: "Session not found" };
    }

    await sessionRepository.deleteSession(sessionId);
  }

  async participate(sessionId: number, userId: number) {
    const session = await sessionRepository.findById(sessionId);

    if (!session) {
      throw { status: 404, message: "Session not found" };
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const existing = await sessionRepository.findParticipationBySessionIdUserId(
      sessionId,
      userId,
    );

    if (existing) {
      throw {
        status: 400,
        message: "User already participating in this session",
      };
    }

    await sessionRepository.createParticipation(sessionId, userId);
  }

  async unparticipate(sessionId: number, userId: number) {
    const participation =
      await sessionRepository.findParticipationBySessionIdUserId(
        sessionId,
        userId,
      );

    if (!participation) {
      throw { status: 404, message: "Participation not found" };
    }

    await sessionRepository.deleteParticipation(sessionId, userId);
  }
}
