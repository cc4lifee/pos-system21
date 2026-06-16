import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

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

export const createPromotion = (data: Prisma.PromotionCreateInput) => {
  return prisma.promotion.create({ data });
};

export const updatePromotion = (
  promotionId: string,
  data: Prisma.PromotionUpdateInput,
) => {
  return prisma.promotion.update({
    where: { id: promotionId },
    data,
  });
};
