import { Router, Request, Response } from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import {
  createUser,
  updateUser,
  userById,
  users,
} from "../controllers/users.controller";

const router = Router();
router.use(authMiddleware);

// GET all users
router.get("/", adminMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await users();
    res.json(result);
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
    const user = await userById(req.params.id);
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

    const user = await createUser({ email, password, name, roleId, role });
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

    const user = await updateUser(req.params.id, {
      name,
      roleId,
      role,
      isActive,
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
