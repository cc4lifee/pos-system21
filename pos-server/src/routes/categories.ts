import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getCategories,
  categoryById,
  categoryProductCount,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/categories.controller";

const router = Router();
router.use(authMiddleware);

// GET all categories
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await getCategories();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET category by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const category = await categoryById(req.params.id);

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

    const category = await createCategory({ name, slug });

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

    const category = await updateCategory(req.params.id, { name, slug });

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
    const productCount = await categoryProductCount(req.params.id);

    if (productCount > 0) {
      return res.status(400).json({
        error: "Cannot delete category with assigned products",
      });
    }

    await deleteCategory(req.params.id);

    res.json({ message: "Category deleted" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
