import { Products } from './products.interface';
import { Promotion } from './promotions.interface';

export type OrderStatusValue = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethodValue = 'CASH' | 'CARD' | 'CHECK' | 'TRANSFER';
export type PaymentStatusValue = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

interface OrderBase {
  id: string;
  orderNumber: string;
  userId: string;
  // total is a Prisma Decimal field, serialized as a numeric string by the API
  total: string;
  status: OrderStatusValue;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Orders extends OrderBase {
  user: User;
  _count: Count;
}

export interface Count {
  items: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Item {
  id: string;
  orderId: string;
  productId: string;
  promotionId: string | null;
  quantity: number;
  // Decimal fields, serialized as numeric strings by the API
  unitPrice: string;
  subtotal: string;
  discount: string;
  product: Product;
  promotion: Promotion | null;
}

export interface Product {
  id: string;
  name: string;
}

// Shape returned by GET /orders/pending: same as Orders but with the item
// lines included instead of an item count, and no `_count`.
export interface PendingOrder extends OrderBase {
  user: User;
  items: Item[];
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string | null;
  // Decimal field, serialized as a numeric string by the API
  amount: string;
  method: PaymentMethodValue;
  status: PaymentStatusValue;
  transactionRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Item shape used by GET /orders/:id, POST /orders and POST /orders/:id/pay —
// unlike `Item` above, `product` here is the full Products record (not just id/name).
export interface OrderItemDetail {
  id: string;
  orderId: string;
  productId: string;
  promotionId: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  discount: string;
  product: Products;
  promotion: Promotion | null;
}

// Full order shape returned by GET /orders/:id and POST /orders.
export interface OrderDetail extends OrderBase {
  user: User;
  items: OrderItemDetail[];
  payments: Payment[];
}

// POST /orders/:id/pay returns the order detail plus the change owed to the customer.
export interface PayOrderResult extends OrderDetail {
  change: number;
}

// Raw order item, no product/promotion join — returned by PATCH /orders/:id/status.
export interface OrderItemRaw {
  id: string;
  orderId: string;
  productId: string;
  promotionId: string | null;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  discount: string;
}

export interface OrderStatusUpdateResult extends OrderBase {
  user: User;
  items: OrderItemRaw[];
}

// Request body for POST /orders
export interface CreateOrderItemInput {
  productId: string;
  promotionId?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount?: number;
}

export interface CreateOrderPaymentInput {
  method: PaymentMethodValue;
  amount: number;
}

export interface CreateOrderInput {
  userId: string;
  total: number;
  notes?: string;
  items: CreateOrderItemInput[];
  // Optional: an order created with payments is COMPLETED immediately instead of PENDING.
  payments?: CreateOrderPaymentInput[];
}

export interface MonthlyStatsOrders {
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
}
