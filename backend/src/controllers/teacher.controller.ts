import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { TeacherService } from "../services/teacher.service";
import { asyncHandler } from "../utils/asyncHandler.util";

const teacherService = new TeacherService();

function parseId(raw: string | string[]): number | null {
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw);
  return isNaN(id) ? null : id;
}

export class TeacherController {
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    return res.status(200).json(await teacherService.getAll());
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const teacherId = parseId(req.params.id);
    if (!teacherId)
      return res.status(400).json({ message: "Invalid teacher ID" });

    return res.status(200).json(await teacherService.getById(teacherId));
  });
}
