import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { SessionService } from "../services/session.service";
import { asyncHandler } from "../utils/asyncHandler.util";

const sessionService = new SessionService();

function parseId(raw: string | string[]): number | null {
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw);
  return isNaN(id) ? null : id;
}

export class SessionController {
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    return res.status(200).json(await sessionService.getAll());
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessionId = parseId(req.params.id);
    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });

    return res.status(200).json(await sessionService.getById(sessionId));
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, date, description, teacherId } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });
    if (!description)
      return res.status(400).json({ message: "Description is required" });
    if (!teacherId)
      return res.status(400).json({ message: "Teacher ID is required" });

    return res
      .status(201)
      .json(await sessionService.create({ name, date, description, teacherId }, req.userId!));
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessionId = parseId(req.params.id);
    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });

    return res
      .status(200)
      .json(await sessionService.update(sessionId, req.body, req.userId!));
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessionId = parseId(req.params.id);
    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });

    await sessionService.delete(sessionId, req.userId!);
    return res.status(204).send();
  });

  participate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessionId = parseId(req.params.id);
    const userId = parseId(req.params.userId);

    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    await sessionService.participate(sessionId, userId);
    return res.status(200).json({ message: "Successfully joined the session" });
  });

  unparticipate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessionId = parseId(req.params.id);
    const userId = parseId(req.params.userId);

    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    await sessionService.unparticipate(sessionId, userId);
    return res.status(204).send();
  });
}
