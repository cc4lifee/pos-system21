import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

const VALID_PAYMENT_METHODS = ["CASH", "CARD", "TRANSFER", "CHECK"] as const;
const VALID_ORDER_STATUS = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

const toUpperString = (value: any) => value?.toString().trim().toUpperCase();

const isValidPositiveNumber = (value: any) =>
  typeof value === "number" && !Number.isNaN(value) && value >= 0;

class BadRequestError extends Error {}

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
            promotion: true,
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
            promotion: true,
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

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError(
        "Missing required fields: userId and items are required",
      );
    }

    if (!isValidPositiveNumber(total)) {
      throw new BadRequestError("Total must be a non-negative number");
    }

    const parsedItems = items.map((item: any, index: number) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const subtotal = Number(item.subtotal);
      const discount = item.discount !== undefined ? Number(item.discount) : 0;
      const promotionId = item.promotionId
        ? item.promotionId.toString()
        : undefined;

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !isValidPositiveNumber(unitPrice) ||
        !isValidPositiveNumber(subtotal) ||
        discount < 0
      ) {
        throw new BadRequestError(
          `Invalid item data at index ${index}: quantity, unitPrice, subtotal and discount must be valid numbers`,
        );
      }

      return {
        productId: item.productId,
        quantity,
        unitPrice,
        subtotal,
        discount,
        promotionId,
      };
    });

    const paymentMethodValue = paymentMethod
      ? toUpperString(paymentMethod)
      : "CASH";

    if (!VALID_PAYMENT_METHODS.includes(paymentMethodValue as any)) {
      throw new BadRequestError(
        `Invalid paymentMethod. Allowed values are: ${VALID_PAYMENT_METHODS.join(", ")}`,
      );
    }

    const itemSubtotalSum = parsedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    if (Math.abs(Number(total) - itemSubtotalSum) > 0.01) {
      throw new BadRequestError(
        "Order total must match the sum of item subtotals",
      );
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
        throw new BadRequestError("One or more products not found");
      }

      // Validate stock for products that track inventory
      for (const item of parsedItems) {
        const prod = dbProducts.find((p) => p.id === item.productId)!;
        if (prod.trackInventory && prod.quantity < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for product: ${prod.name}`,
          );
        }
      }

      // Validate promotions if referenced
      const promotionIds = parsedItems
        .map((item: any) => item.promotionId)
        .filter(Boolean);

      if (promotionIds.length > 0) {
        const promotions = await tx.promotion.findMany({
          where: { id: { in: promotionIds } },
        });

        if (promotions.length !== new Set(promotionIds).size) {
          throw new BadRequestError("One or more promotions not found");
        }
      }

      // Create order with items
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          total: Number(total),
          paymentMethod: paymentMethodValue,
          notes,
          items: {
            create: parsedItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              discount: item.discount,
              promotionId: item.promotionId,
            })),
          },
        },
        include: {
          items: {
            include: { product: true, promotion: true },
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
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const statusValue = toUpperString(status);
    if (!VALID_ORDER_STATUS.includes(statusValue as any)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values are: ${VALID_ORDER_STATUS.join(", ")}`,
      });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: statusValue as any },
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
