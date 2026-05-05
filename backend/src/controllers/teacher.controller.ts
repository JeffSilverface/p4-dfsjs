import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { TeacherService } from "../services/teacher.service";

const teacherService = new TeacherService();

function isServiceError(
  err: unknown,
): err is { status: number; message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  );
}

function parseId(raw: string | string[]): number | null {
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw);
  return isNaN(id) ? null : id;
}

export class TeacherController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      return res.status(200).json(await teacherService.getAll());
    } catch (err) {
      console.error("Get teachers error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    const teacherId = parseId(req.params.id);
    if (!teacherId)
      return res.status(400).json({ message: "Invalid teacher ID" });

    try {
      return res.status(200).json(await teacherService.getById(teacherId));
    } catch (err) {
      if (isServiceError(err))
        return res.status(err.status).json({ message: err.message });
      console.error("Get teacher error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
