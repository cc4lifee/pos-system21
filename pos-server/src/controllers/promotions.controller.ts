import { Prisma, PromotionType } from "@prisma/client";
import { prisma } from "../db/prisma";

export const VALID_PROMOTION_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"] as const;

export class BadRequestError extends Error {}

type CreatePromotionInput = {
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: number | string;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  usageLimit?: number | string;
};

type UpdatePromotionInput = Partial<CreatePromotionInput>;

const toUpperString = (value: unknown) => value?.toString().trim().toUpperCase();

const isValidPositiveNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value) && value >= 0;

const parseDiscount = (discountType: unknown, discountValue: unknown) => {
  const type = toUpperString(discountType);
  if (!VALID_PROMOTION_TYPES.includes(type as PromotionType)) {
    throw new BadRequestError(
      `Invalid discountType. Allowed values are: ${VALID_PROMOTION_TYPES.join(", ")}`,
    );
  }

  const value = Number(discountValue);
  if (!isValidPositiveNumber(value) || value <= 0) {
    throw new BadRequestError("discountValue must be a positive number");
  }
  if (type === "PERCENTAGE" && value > 100) {
    throw new BadRequestError("Percentage discountValue cannot exceed 100");
  }

  return { type: type as PromotionType, value };
};

const parseDateRange = (startDate: unknown, endDate: unknown) => {
  const start = startDate ? new Date(startDate as string) : undefined;
  const end = endDate ? new Date(endDate as string) : undefined;

  if (start && Number.isNaN(start.getTime())) {
    throw new BadRequestError("Invalid startDate");
  }
  if (end && Number.isNaN(end.getTime())) {
    throw new BadRequestError("Invalid endDate");
  }
  if (start && end && end < start) {
    throw new BadRequestError("endDate must be on or after startDate");
  }

  return { start, end };
};

const parseUsageLimit = (usageLimit: unknown) => {
  if (usageLimit === undefined || usageLimit === null) return undefined;
  const value = Number(usageLimit);
  if (!Number.isInteger(value) || value <= 0) {
    throw new BadRequestError("usageLimit must be a positive integer");
  }
  return value;
};

export const promotions = () => {
  return prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const promotionById = (promotionId: string) => {
  return prisma.promotion.findUnique({
    where: { id: promotionId },
  });
};

export const createPromotion = (data: CreatePromotionInput) => {
  if (!data.code || !data.name) {
    throw new BadRequestError("code and name are required");
  }

  const { type, value } = parseDiscount(data.discountType, data.discountValue);
  const { start, end } = parseDateRange(data.startDate, data.endDate);
  const usageLimit = parseUsageLimit(data.usageLimit);

  return prisma.promotion.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description,
      discountType: type,
      discountValue: value,
      active: data.active !== undefined ? Boolean(data.active) : true,
      startDate: start,
      endDate: end,
      usageLimit,
    },
  });
};

export const updatePromotion = (
  promotionId: string,
  data: UpdatePromotionInput,
) => {
  const updateData: Prisma.PromotionUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.active !== undefined) updateData.active = Boolean(data.active);

  if (data.discountType !== undefined || data.discountValue !== undefined) {
    if (data.discountType === undefined || data.discountValue === undefined) {
      throw new BadRequestError(
        "discountType and discountValue must be updated together",
      );
    }
    const { type, value } = parseDiscount(data.discountType, data.discountValue);
    updateData.discountType = type;
    updateData.discountValue = value;
  }

  if (data.startDate !== undefined || data.endDate !== undefined) {
    const { start, end } = parseDateRange(data.startDate, data.endDate);
    updateData.startDate = start ?? null;
    updateData.endDate = end ?? null;
  }

  if (data.usageLimit !== undefined) {
    updateData.usageLimit =
      data.usageLimit === null ? null : parseUsageLimit(data.usageLimit);
  }

  return prisma.promotion.update({
    where: { id: promotionId },
    data: updateData,
  });
};
