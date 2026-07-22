export interface Categories {
  id: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Shape returned by GET /categories/:id (product count joined).
export interface CategoryDetail extends Categories {
  _count: { products: number };
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
}
