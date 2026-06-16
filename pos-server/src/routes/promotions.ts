import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  createPromotion,
  promotionById,
  promotions,
  updatePromotion,
} from "../controllers/promotions.controller";

const router = Router();
router.use(authMiddleware);

// GET /api/v1/promotions
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await promotions();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
});

// GET promotion by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const promotion = await promotionById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch promotion" });
  }
});

// CREATE promotion
router.post("/", requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const { code, name, description, active } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: "Code and name are required" });
    }

    const promotion = await createPromotion({
      code,
      name,
      description,
      active: active !== undefined ? Boolean(active) : true,
    });

    res.status(201).json(promotion);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Promotion code already exists" });
    }
    res.status(500).json({ error: "Failed to create promotion" });
  }
});

// UPDATE promotion
router.put(
  "/:id",
  requireRole("ADMIN"),
  async (req: Request, res: Response) => {
    try {
      const { name, description, active } = req.body;
      const data: any = {};

      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;
      if (active !== undefined) data.active = Boolean(active);

      const promotion = await updatePromotion(req.params.id, data);

      res.json(promotion);
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.status(500).json({ error: "Failed to update promotion" });
    }
  },
);

export default router;
