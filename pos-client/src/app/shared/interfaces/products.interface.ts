export interface Products {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  quantity: number;
  trackInventory: boolean;
  categoryId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
}

export interface Category {
  id: string;
  name: string;
}
