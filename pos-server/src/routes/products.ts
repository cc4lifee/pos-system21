import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";

const router = Router();

// GET all products
router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: { category: { select: { id: true, name: true } } },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET product by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// CREATE product
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, price, cost, quantity, categoryId } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : undefined,
        quantity: quantity !== undefined ? parseInt(quantity) : 0,
        ...(categoryId && { categoryId }),
      },
    });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Unique constraint violation" });
    }
    res.status(500).json({ error: "Failed to create product" });
  }
});

// UPDATE product
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, description, price, cost, quantity, categoryId, isActive } =
      req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(cost !== undefined && { cost: parseFloat(cost) }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(product);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product (soft delete)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
