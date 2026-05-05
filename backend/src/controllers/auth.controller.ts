import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler.util";

const authService = new AuthService();

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });
    if (typeof email !== "string") return res.status(400).json({ message: "Email must be a string" });
    if (typeof password !== "string") return res.status(400).json({ message: "Password must be a string" });

    return res.status(200).json(await authService.login(email, password));
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });
    if (!firstName) return res.status(400).json({ message: "First name is required" });
    if (!lastName) return res.status(400).json({ message: "Last name is required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    return res.status(201).json(await authService.register(email, password, firstName, lastName));
  });
}
