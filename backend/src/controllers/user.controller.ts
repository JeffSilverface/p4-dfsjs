import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";

const userService = new UserService();

function parseId(raw: string | string[]): number | null {
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw);
  return isNaN(id) ? null : id;
}

export class UserController {
  async getById(req: AuthRequest, res: Response) {
    const userId = parseId(req.params.id);
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    try {
      return res.status(200).json(await userService.getById(userId));
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    const userId = parseId(req.params.id);
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    try {
      await userService.delete(userId, req.userId!);
      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Delete user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async promoteSelfToAdmin(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      return res
        .status(200)
        .json(await userService.promoteSelfToAdmin(req.userId));
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Promote user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
