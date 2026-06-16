import { OrderStatus, PaymentMethod, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

export const VALID_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "TRANSFER",
  "CHECK",
] as const;
export const VALID_ORDER_STATUS = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

const orderListArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    user: {
      select: { id: true, name: true, email: true },
    },
    items: {
      include: {
        product: {
          select: { id: true, name: true },
        },
        promotion: true,
      },
    },
  },
});

const orderDetailArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    user: {
      select: { id: true, name: true, email: true },
    },
    items: {
      include: {
        product: true,
        promotion: true,
      },
    },
  },
});

type CreateOrderItemInput = {
  productId: string;
  promotionId?: string;
  quantity: number | string;
  unitPrice: number | string;
  subtotal: number | string;
  discount?: number | string;
};

type ParsedOrderItem = {
  productId: string;
  promotionId?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
};

type CreateOrderInput = {
  userId: string;
  total: number;
  paymentMethod?: string;
  notes?: string;
  items: CreateOrderItemInput[];
};

export type OrderListItem = Prisma.OrderGetPayload<typeof orderListArgs>;
export type OrderDetail = Prisma.OrderGetPayload<typeof orderDetailArgs>;

const toUpperString = (value: unknown) =>
  value?.toString().trim().toUpperCase();

const isValidPositiveNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value) && value >= 0;

export class BadRequestError extends Error {}

export const orders = (): Promise<OrderListItem[]> => {
  return prisma.order.findMany({
    ...orderListArgs,
    orderBy: { createdAt: "desc" },
  });
};

export const orderById = (orderId: string): Promise<OrderDetail | null> => {
  return prisma.order.findUnique({
    where: { id: orderId },
    ...orderDetailArgs,
  });
};

export const createOrder = async ({
  userId,
  total,
  paymentMethod,
  notes,
  items,
}: CreateOrderInput) => {
  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError(
      "Missing required fields: userId and items are required",
    );
  }

  if (!isValidPositiveNumber(total)) {
    throw new BadRequestError("Total must be a non-negative number");
  }

  const parsedItems: ParsedOrderItem[] = items.map((item, index) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const subtotal = Number(item.subtotal);
    const discount = item.discount !== undefined ? Number(item.discount) : 0;
    const promotionId = item.promotionId
      ? item.promotionId.toString()
      : undefined;

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !isValidPositiveNumber(unitPrice) ||
      !isValidPositiveNumber(subtotal) ||
      discount < 0
    ) {
      throw new BadRequestError(
        `Invalid item data at index ${index}: quantity, unitPrice, subtotal and discount must be valid numbers`,
      );
    }

    return {
      productId: item.productId,
      quantity,
      unitPrice,
      subtotal,
      discount,
      promotionId,
    };
  });

  const paymentMethodValue = paymentMethod
    ? toUpperString(paymentMethod)
    : PaymentMethod.CASH;

  if (!VALID_PAYMENT_METHODS.includes(paymentMethodValue as PaymentMethod)) {
    throw new BadRequestError(
      `Invalid paymentMethod. Allowed values are: ${VALID_PAYMENT_METHODS.join(", ")}`,
    );
  }

  const itemSubtotalSum = parsedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  if (Math.abs(Number(total) - itemSubtotalSum) > 0.01) {
    throw new BadRequestError(
      "Order total must match the sum of item subtotals",
    );
  }

  const orderNumber = `ORD-${Date.now()}`;

  return prisma.$transaction(async (tx) => {
    const productIds = parsedItems.map((item) => item.productId);
    const dbProducts = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    if (dbProducts.length !== new Set(productIds).size) {
      throw new BadRequestError("One or more products not found");
    }

    for (const item of parsedItems) {
      const prod = dbProducts.find((p) => p.id === item.productId)!;
      if (prod.trackInventory && prod.quantity < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for product: ${prod.name}`,
        );
      }
    }

    const promotionIds = parsedItems
      .map((item) => item.promotionId)
      .filter((promotionId): promotionId is string => Boolean(promotionId));

    if (promotionIds.length > 0) {
      const promotions = await tx.promotion.findMany({
        where: { id: { in: promotionIds } },
      });

      if (promotions.length !== new Set(promotionIds).size) {
        throw new BadRequestError("One or more promotions not found");
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        total: Number(total),
        paymentMethod: paymentMethodValue as PaymentMethod,
        notes,
        items: {
          create: parsedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            discount: item.discount,
            promotionId: item.promotionId,
          })),
        },
      },
      include: {
        items: {
          include: { product: true, promotion: true },
        },
        user: { select: { id: true, name: true } },
      },
    });

    for (const item of parsedItems) {
      const prod = dbProducts.find((p) => p.id === item.productId)!;
      if (prod.trackInventory) {
        await tx.product.update({
          where: { id: prod.id },
          data: { quantity: prod.quantity - item.quantity },
        });
      }
    }

    return order;
  });
};

export const updateOrderStatus = (orderId: string, status: string) => {
  if (!status) {
    throw new BadRequestError("Status is required");
  }

  const statusValue = toUpperString(status);
  if (!VALID_ORDER_STATUS.includes(statusValue as OrderStatus)) {
    throw new BadRequestError(
      `Invalid status. Allowed values are: ${VALID_ORDER_STATUS.join(", ")}`,
    );
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: statusValue as OrderStatus },
    include: {
      items: true,
      user: {
        select: { id: true, name: true },
      },
    },
  });
};
