import { InventoryType } from "@prisma/client";
import { prisma } from "../db/prisma";

export const adjustInventory = ({
  productId,
  newQuantity,
  reason,
  type,
  userId,
}: {
  productId: string;
  newQuantity: number;
  reason?: string;
  type?: InventoryType;
  userId: string | null;
}) => {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    const quantityBefore = product.quantity;
    const change = newQuantity - quantityBefore;

    const updated = await tx.product.update({
      where: { id: productId },
      data: { quantity: newQuantity },
    });

    const txLog = await tx.inventoryTransaction.create({
      data: {
        productId,
        userId,
        change,
        type: type || InventoryType.ADJUSTMENT,
        reason,
        quantityBefore,
        quantityAfter: newQuantity,
      },
    });

    return { updated, txLog };
  });
};

export const inventoryTransactionsByProduct = (productId: string) => {
  return prisma.inventoryTransaction.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
};
