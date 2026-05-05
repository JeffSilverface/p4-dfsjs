import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { SessionService } from "../services/session.service";

const sessionService = new SessionService();

function parseId(raw: string | string[]): number | null {
  const id = parseInt(Array.isArray(raw) ? raw[0] : raw);
  return isNaN(id) ? null : id;
}

export class SessionController {
  async getAll(_req: AuthRequest, res: Response) {
    try {
      return res.status(200).json(await sessionService.getAll());
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    const sessionId = parseId(req.params.id);
    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });

    try {
      return res.status(200).json(await sessionService.getById(sessionId));
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Get session error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    const { name, date, description, teacherId } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });
    if (!description)
      return res.status(400).json({ message: "Description is required" });
    if (!teacherId)
      return res.status(400).json({ message: "Teacher ID is required" });

    try {
      return res
        .status(201)
        .json(
          await sessionService.create(
            { name, date, description, teacherId },
            req.userId!,
          ),
        );
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Create session error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    const sessionId = parseId(req.params.id);
    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });

    try {
      return res
        .status(200)
        .json(await sessionService.update(sessionId, req.body, req.userId!));
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Update session error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    const sessionId = parseId(req.params.id);
    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });

    try {
      await sessionService.delete(sessionId, req.userId!);
      return res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Delete session error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async participate(req: AuthRequest, res: Response) {
    const sessionId = parseId(req.params.id);
    const userId = parseId(req.params.userId);

    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    try {
      await sessionService.participate(sessionId, userId);
      return res
        .status(200)
        .json({ message: "Successfully joined the session" });
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Participate error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async unparticipate(req: AuthRequest, res: Response) {
    const sessionId = parseId(req.params.id);
    const userId = parseId(req.params.userId);

    if (!sessionId)
      return res.status(400).json({ message: "Invalid session ID" });
    if (!userId) return res.status(400).json({ message: "Invalid user ID" });

    try {
      await sessionService.unparticipate(sessionId, userId);
      return res.status(200).json({ message: "Successfully left the session" });
    } catch (error) {
      if (error.status)
        return res.status(error.status).json({ message: error.message });
      console.error("Unparticipate error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
