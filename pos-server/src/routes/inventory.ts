import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../middleware/auth";
import {
  adjustInventory,
  inventoryTransactionsByProduct,
} from "../controllers/inventory.controller";

const router = Router();
router.use(authMiddleware);

// POST /api/v1/inventory/adjust
router.post(
  "/adjust",
  requireRole("ADMIN", "MANAGER", "STOCK"),
  async (req: Request, res: Response) => {
    try {
      const { productId, newQuantity, reason, type } = req.body;
      const userId = req.user?.userId || null;

      if (!productId || typeof newQuantity !== "number") {
        return res
          .status(400)
          .json({ error: "productId and newQuantity are required" });
      }

      const result = await adjustInventory({
        productId,
        newQuantity,
        reason,
        type,
        userId,
      });

      res.json(result);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Internal error" });
    }
  },
);

// GET /api/v1/inventory/:productId/transactions
router.get("/:productId/transactions", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const transactions = await inventoryTransactionsByProduct(productId);
    res.json(transactions);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

export default router;
