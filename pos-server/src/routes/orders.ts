import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  BadRequestError,
  createOrder,
  orderById,
  orders,
  updateOrderStatus,
} from "../controllers/orders.controller";

const router = Router();
router.use(authMiddleware);

// GET all orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await orders();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET order by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const order = await orderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// CREATE order
router.post("/", async (req: Request, res: Response) => {
  try {
    const result = await createOrder(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    console.error(error);
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
});

// UPDATE order status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const order = await updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (error: any) {
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
