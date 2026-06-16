import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { authMiddleware, signJwtToken } from "../middleware/auth";
import {
  authUserById,
  updatePassword,
  userByEmail,
  userById,
  type AuthUser,
  type PublicUser,
} from "../controllers/users.controller";

const router = Router();
const SALT_ROUNDS = 10;

const buildAuthResponse = (user: AuthUser | PublicUser) => {
  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  const token = signJwtToken({
    userId: user.id,
    email: user.email,
    roleId: user.role.id,
    roleName: user.role.name,
  });

  return { token, user: safeUser };
};

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await userByEmail(email);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Legacy case: password stored in plain text before bcrypt migration
      if (password === user.password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await updatePassword(user.id, hashedPassword);
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// GET /api/v1/auth/renew
router.get("/renew", authMiddleware, async (req: Request, res: Response) => {
  try {
    const tokenUser = req.user;

    if (!tokenUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await authUserById(tokenUser.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid user" });
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ error: "Failed to renew token" });
  }
});

// GET /api/v1/auth/me
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const tokenUser = req.user;

  if (!tokenUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await userById(tokenUser.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

export default router;
