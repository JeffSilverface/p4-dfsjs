import { AuthResponse, RegisterData, User } from "../../types";

export const testUserRequest: RegisterData = {
  email: "user@test.com",
  password: "myfavoritepassword",
  firstName: "Jessica",
  lastName: "Dopourtoi",
};

export const testUserResponse: User = {
  id: 1,
  email: "user@test.com",
  firstName: "Ivan",
  lastName: "Desfrites",
  admin: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const testAuthResponse: AuthResponse = {
  id: 1,
  email: "user@test.com",
  firstName: "Ivan",
  lastName: "Desfrites",
  admin: false,
  token: "fake-token",
};
