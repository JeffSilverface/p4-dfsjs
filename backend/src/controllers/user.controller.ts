import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler.util";

const userService = new UserService();

function parseId(raw: string | string[]): number | null {
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw);
  return isNaN(id) ? null : id;
}

export class UserController {
  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = parseId(req.params.id);
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    return res.status(200).json(await userService.getById(userId));
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = parseId(req.params.id);
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    await userService.delete(userId, req.userId!);
    return res.status(204).send();
  });

  promoteSelfToAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    return res.status(200).json(await userService.promoteSelfToAdmin(req.userId));
  });
}
