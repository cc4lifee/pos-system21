import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// POST /api/v1/inventory/adjust
router.post("/adjust", async (req: Request, res: Response) => {
  try {
    const { productId, newQuantity, reason, type } = req.body;
    const userId = req.user?.userId || null;

    if (!productId || typeof newQuantity !== "number") {
      return res
        .status(400)
        .json({ error: "productId and newQuantity are required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");

      const quantityBefore = product.quantity;
      const change = newQuantity - quantityBefore;

      const updated = await tx.product.update({
        where: { id: productId },
        data: { quantity: newQuantity },
      });

      const txLog = await tx.inventoryTransaction.create({
        data: {
          productId,
          userId,
          change,
          type: type || "ADJUSTMENT",
          reason,
          quantityBefore,
          quantityAfter: newQuantity,
        },
      });

      return { updated, txLog };
    });

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// GET /api/v1/inventory/:productId/transactions
router.get("/:productId/transactions", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const transactions = await prisma.inventoryTransaction.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    res.json(transactions);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

export default router;
