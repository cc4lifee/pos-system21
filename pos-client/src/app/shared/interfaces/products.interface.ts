// Raw shape returned by POST/PUT /products (no category join).
export interface ProductRaw {
  id: string;
  name: string;
  description: string | null;
  // price/cost are Prisma Decimal fields, serialized as numeric strings by the API
  price: string;
  cost: string | null;
  quantity: number;
  trackInventory: boolean;
  categoryId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shape returned by GET /products and GET /products/:id (category joined).
export interface Products extends ProductRaw {
  category: Category | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  quantity?: number;
  trackInventory?: boolean;
  categoryId?: string;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  trackInventory?: boolean;
  categoryId?: string;
  isActive?: boolean;
}
