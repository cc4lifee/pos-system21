import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

const categoryWithProductCountArgs =
  Prisma.validator<Prisma.CategoryDefaultArgs>()({
    include: { _count: { select: { products: true } } },
  });

export type CategoryWithProductCount = Prisma.CategoryGetPayload<
  typeof categoryWithProductCountArgs
>;

export const getCategories = () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const categoryById = (
  categoryId: string,
): Promise<CategoryWithProductCount | null> => {
  return prisma.category.findUnique({
    where: { id: categoryId },
    ...categoryWithProductCountArgs,
  });
};

export const createCategory = (data: { name: string; slug?: string }) => {
  return prisma.category.create({ data });
};

export const updateCategory = (
  categoryId: string,
  data: { name?: string; slug?: string },
) => {
  return prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
    },
  });
};

export const categoryProductCount = (categoryId: string) => {
  return prisma.product.count({
    where: { categoryId },
  });
};

export const deleteCategory = (categoryId: string) => {
  return prisma.category.delete({
    where: { id: categoryId },
  });
};
