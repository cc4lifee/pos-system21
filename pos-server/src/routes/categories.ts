import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";

const router = Router();

// GET all categories
router.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET category by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// CREATE category
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Category name already exists" });
    }
    res.status(500).json({ error: "Failed to create category" });
  }
});

// UPDATE category
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });

    res.json(category);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE category
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const productCount = await prisma.product.count({
      where: { categoryId: req.params.id },
    });

    if (productCount > 0) {
      return res.status(400).json({
        error: "Cannot delete category with assigned products",
      });
    }

    await prisma.category.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Category deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
