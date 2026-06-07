import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

const VALID_PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER"] as const;

// GET all orders
router.get("/", async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET order by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
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
    const { userId, total, paymentMethod, notes, items } = req.body;

    if (!userId || !total || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paymentMethodValue = paymentMethod
      ? paymentMethod.toString().toUpperCase()
      : "CASH";

    if (!VALID_PAYMENT_METHODS.includes(paymentMethodValue as any)) {
      return res.status(400).json({
        error: `Invalid paymentMethod. Allowed values are: ${VALID_PAYMENT_METHODS.join(", ")}`,
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Transaction: validate stock for tracked products, create order, decrement stock
    const result = await prisma.$transaction(async (tx) => {
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      // Ensure all products exist
      if (dbProducts.length !== new Set(productIds).size) {
        throw new Error("One or more products not found");
      }

      // Validate stock for products that track inventory
      for (const item of items) {
        const prod = dbProducts.find((p) => p.id === item.productId)!;
        const qty = parseInt(item.quantity);
        if (prod.trackInventory && prod.quantity < qty) {
          throw new Error(`Insufficient stock for product: ${prod.name}`);
        }
      }

      // Create order with items
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          total: parseFloat(total),
          paymentMethod: paymentMethodValue,
          notes,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              subtotal: parseFloat(item.subtotal),
              discount: item.discount ? parseFloat(item.discount) : 0,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
          user: { select: { id: true, name: true } },
        },
      });

      // Decrement stock for tracked products
      for (const item of items) {
        const prod = dbProducts.find((p) => p.id === item.productId)!;
        const qty = parseInt(item.quantity);
        if (prod.trackInventory) {
          await tx.product.update({
            where: { id: prod.id },
            data: { quantity: prod.quantity - qty },
          });
        }
      }

      return order;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// UPDATE order status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: true,
        user: {
          select: { id: true, name: true },
        },
      },
    });
    res.json(order);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
