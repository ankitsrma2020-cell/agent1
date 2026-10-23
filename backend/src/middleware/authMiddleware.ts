import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authenticateToken(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured.");
    return response.status(500).json({
      success: false,
      message: "Authentication is not configured.",
    });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const userId = (payload as JwtPayload).userId;

    if (typeof userId !== "string") {
      return response.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    request.userId = userId;
    return next();
  } catch {
    return response.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}
