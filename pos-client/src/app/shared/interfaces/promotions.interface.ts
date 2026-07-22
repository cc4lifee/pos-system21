export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: PromotionType;
  // Prisma Decimal field, serialized as a numeric string by the API
  discountValue: string;
  active: boolean;
  startDate: Date | null;
  endDate: Date | null;
  usageLimit: number | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePromotionInput {
  code: string;
  name: string;
  description?: string;
  discountType: PromotionType;
  discountValue: number;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
}

export type UpdatePromotionInput = Partial<CreatePromotionInput>;
