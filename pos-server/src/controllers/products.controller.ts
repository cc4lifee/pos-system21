import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

const productWithCategoryArgs = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { category: { select: { id: true, name: true } } },
});

export type ProductWithCategory = Prisma.ProductGetPayload<
  typeof productWithCategoryArgs
>;

export const products = (): Promise<ProductWithCategory[]> => {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    ...productWithCategoryArgs,
  });
};

export const productById = (
  productId: string,
): Promise<ProductWithCategory | null> => {
  return prisma.product.findUnique({
    where: { id: productId },
    ...productWithCategoryArgs,
  });
};

export const createProduct = (data: Prisma.ProductUncheckedCreateInput) => {
  return prisma.product.create({ data });
};

export const updateProduct = (
  productId: string,
  data: Prisma.ProductUncheckedUpdateInput,
) => {
  return prisma.product.update({
    where: { id: productId },
    data,
  });
};

export const softDeleteProduct = (productId: string) => {
  return prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });
};
