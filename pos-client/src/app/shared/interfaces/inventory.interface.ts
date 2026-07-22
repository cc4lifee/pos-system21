import { ProductRaw } from './products.interface';

export type InventoryType =
  | 'SALE'
  | 'ADJUSTMENT'
  | 'PURCHASE'
  | 'RETURN'
  | 'SPOILAGE'
  | 'COUNT';

export interface InventoryTransaction {
  id: string;
  productId: string;
  userId: string | null;
  change: number;
  type: InventoryType;
  reason: string | null;
  referenceId: string | null;
  quantityBefore: number;
  quantityAfter: number;
  createdAt: Date;
}

export interface AdjustInventoryInput {
  productId: string;
  newQuantity: number;
  reason?: string;
  type?: InventoryType;
}

export interface AdjustInventoryResult {
  updated: ProductRaw;
  txLog: InventoryTransaction;
}
