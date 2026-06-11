import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthTokenPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
}

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be defined in production");
    }
    return "dev_jwt_secret";
  }
  return secret;
};

export const signJwtToken = (payload: AuthTokenPayload) => {
  return jwt.sign(
    payload,
    getJwtSecret() as jwt.Secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    } as jwt.SignOptions,
  );
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      getJwtSecret() as jwt.Secret,
    ) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.roleName)) {
      return res.status(403).json({ error: "Insufficient privileges" });
    }
    next();
  };

export const adminMiddleware = requireRole("ADMIN");
