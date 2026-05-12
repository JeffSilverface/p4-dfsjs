import { testTeacherResponse } from "./teacher.fixtures";

export const testSessionRequest = {
  name: "Yoga du soir",
  date: "2026-06-01T09:00:00.000Z",
  description: "Session de yoga pour débutants",
  teacherId: 1,
};

export const testSessionResponse = {
  id: 1,
  name: "Yoga du matin",
  date: new Date("2026-06-01T09:00:00.000Z"),
  description: "Session de yoga pour débutants",
  teacherId: 1,
  teacher: testTeacherResponse,
  participants: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const testSessionFormatted = {
  id: 1,
  name: "Yoga du matin",
  date: new Date("2026-06-01T09:00:00.000Z"),
  description: "Session de yoga pour débutants",
  teacher: {
    id: testTeacherResponse.id,
    firstName: testTeacherResponse.firstName,
    lastName: testTeacherResponse.lastName,
  },
  users: [],
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
