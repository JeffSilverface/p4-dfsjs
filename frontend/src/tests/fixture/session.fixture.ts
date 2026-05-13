import { Session, Teacher } from "../../types";

export const testTeacher: Teacher = {
  id: 1,
  firstName: "Marie",
  lastName: "Dupont",
};

export const testSession: Session = {
  id: "1",
  name: "Yoga du matin",
  date: "2026-06-01T09:00:00.000Z",
  description: "Session de yoga pour débutants",
  teacher: { id: 1, firstName: "Marie", lastName: "Dupont" },
  users: [],
};
