import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);
const DEFAULT_ROLE_NAME = "CASHIER";
const SALT_ROUNDS = 10;

async function resolveRoleId(roleId?: string, roleName?: string) {
  if (roleId) {
    return roleId;
  }

  const name = roleName?.toString().toUpperCase() || DEFAULT_ROLE_NAME;
  const role = await prisma.role.findUnique({ where: { name } });

  if (!role) {
    throw new Error(`Role not found: ${name}`);
  }

  return role.id;
}

// GET all users
router.get("/", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const tokenUser = req.user;
    if (!tokenUser) return res.status(401).json({ error: "Unauthorized" });

    // only admin or the owner can fetch a specific user
    if (tokenUser.roleName !== "ADMIN" && tokenUser.userId !== req.params.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
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
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// CREATE user
router.post("/", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, password, name, roleId, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const resolvedRoleId = await resolveRoleId(roleId, role);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        roleId: resolvedRoleId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (error.message?.startsWith("Role not found")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
});

// UPDATE user
router.put("/:id", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, roleId, role, isActive } = req.body;

    const data: any = {
      ...(name && { name }),
      ...(isActive !== undefined && { isActive }),
    };

    if (roleId || role) {
      data.roleId = await resolveRoleId(roleId, role);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    res.json(user);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    if (error.message?.startsWith("Role not found")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to update user" });
  }
});

export default router;
