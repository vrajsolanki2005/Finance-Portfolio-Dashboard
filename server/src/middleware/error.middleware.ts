import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    success: false,
    message: "An unexpected server error occurred",
  });
}
