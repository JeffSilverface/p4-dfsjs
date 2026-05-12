export const testUserRequest = {
  email: "user@test.com",
  password: "myfavoritepassword",
  firstName: "Jean",
  lastName: "Peuplu",
};

export const testLoginRequest = {
  email: "user@test.com",
  password: "myfavoritepassword",
};

export const testUserResponse = {
  id: 2,
  email: "user@test.com",
  firstName: "Jean",
  lastName: "Peuplu",
  admin: false,
  password: "hashedpassword",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export const testAdminResponse = {
  id: 1,
  email: "admin@test.com",
  firstName: "Jean",
  lastName: "Peuplu",
  admin: true,
  password: "hashedpassword",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
