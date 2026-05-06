import * as bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.util";
import { HttpError } from "../utils/httpError.util";
import { AuthRepository } from "../repositories/auth.repository";

const authRepository = new AuthRepository();

export class AuthService {
  async login(email: string, password: string) {
    const user = await authRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new HttpError(401, "Invalid credentials");

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token: generateToken(user.id),
    };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    if (await authRepository.findByEmail(email))
      throw new HttpError(400, "Email already exists");

    const user = await authRepository.create({
      email,
      password: await bcrypt.hash(password, 10),
      firstName,
      lastName,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: user.admin,
      token: generateToken(user.id),
    };
  }
}
