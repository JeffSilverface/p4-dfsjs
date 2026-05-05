import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.util";

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError)
    return res.status(err.status).json({ message: err.message });
  return res.status(500).json({ message: "Internal server error" });
}
