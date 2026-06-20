export interface Orders {
  id: string;
  orderNumber: string;
  userId: string;
  total: number;
  status: string;
  notes: null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  _count: Count;
}

export interface Count {
  items: number;
}

export interface User {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  orderId: string;
  productId: string;
  promotionId: null | string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  product: Product;
  promotion: Promotion | null;
}

export interface Product {
  id: string;
  name: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MontlyStatsOrders {
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
}
