import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";
import { authMiddleware, signJwtToken } from "../middleware/auth";

const router = Router();
const SALT_ROUNDS = 10;

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("llega aqui");

    let isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Legacy case: password stored in plain text before bcrypt migration
      if (password === user.password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

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

    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to authenticate user" });
  }
});

// GET /api/v1/auth/me
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  const tokenUser = req.user;

  if (!tokenUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

export default router;
