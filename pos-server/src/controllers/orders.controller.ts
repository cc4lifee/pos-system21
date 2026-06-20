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
      select: { id: true, name: true },
    },
    _count: {
      select: {
        items: true,
      },
    },
  },
});

const pendingOrderArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        promotion: true,
      },
    },
  },
});

const orderDetailArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    user: {
      select: { id: true, name: true },
    },
    items: {
      include: {
        product: true,
        promotion: true,
      },
    },
    payments: true,
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

type CreateOrderPaymentInput = {
  method: string;
  amount: number;
};

type CreateOrderInput = {
  userId: string;
  total: number;
  payments?: CreateOrderPaymentInput[];
  notes?: string;
  items: CreateOrderItemInput[];
};

export type OrderListItem = Prisma.OrderGetPayload<typeof orderListArgs>;
export type OrderDetail = Prisma.OrderGetPayload<typeof orderDetailArgs>;

const startOfMonth = new Date(
  new Date().getFullYear(),
  new Date().getMonth(),
  1,
);

const toUpperString = (value: unknown) =>
  value?.toString().trim().toUpperCase();

const isValidPositiveNumber = (value: unknown) =>
  typeof value === "number" && !Number.isNaN(value) && value >= 0;

export class BadRequestError extends Error {}

export const getOrders = (): Promise<OrderListItem[]> => {
  return prisma.order.findMany({
    //! eventualmente con filtros...
    // where: {
    //   status: {
    //     not: "PENDING",
    //   },
    // },
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
  payments,
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

  // ✅ Solo parsea si vienen payments, no lanza error si no vienen
  const parsedPayments =
    payments && Array.isArray(payments) && payments.length > 0
      ? payments.map((payment, index) => {
          const method = toUpperString(payment.method);
          const amount = Number(payment.amount);

          if (!VALID_PAYMENT_METHODS.includes(method as PaymentMethod)) {
            throw new BadRequestError(
              `Invalid payment method at index ${index}`,
            );
          }
          if (!isValidPositiveNumber(amount) || amount <= 0) {
            throw new BadRequestError(
              `Invalid payment amount at index ${index}`,
            );
          }

          return { method: method as PaymentMethod, amount };
        })
      : [];

  // ✅ Solo valida el total si vienen payments
  if (parsedPayments.length > 0) {
    const paymentTotal = parsedPayments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(paymentTotal - Number(total)) > 0.01) {
      throw new BadRequestError("Payment total must match order total");
    }
  }

  return prisma.$transaction(async (tx) => {
    const orderCount = await tx.order.count();
    const orderNumber = `${String(orderCount + 1).padStart(4, "0")}`;

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

    const hasPayments = parsedPayments.length > 0;

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        total: Number(total),
        status: hasPayments ? "COMPLETED" : "PENDING",
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
        payments: hasPayments
          ? {
              create: parsedPayments.map((payment) => ({
                amount: payment.amount,
                method: payment.method,
                status: "COMPLETED" as const,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: { product: true, promotion: true },
        },
        payments: true,
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

export const payOrder = async (
  orderId: string,
  payments: CreateOrderPaymentInput[],
) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new BadRequestError("Order not found");
  if (order.status !== "PENDING")
    throw new BadRequestError("Only pending orders can be paid");

  if (!payments || !Array.isArray(payments) || payments.length === 0) {
    throw new BadRequestError("At least one payment is required");
  }

  const parsedPayments = payments.map((payment, index) => {
    const method = toUpperString(payment.method);
    const amount = Number(payment.amount);

    if (!VALID_PAYMENT_METHODS.includes(method as PaymentMethod)) {
      throw new BadRequestError(`Invalid payment method at index ${index}`);
    }
    if (!isValidPositiveNumber(amount) || amount <= 0) {
      throw new BadRequestError(`Invalid payment amount at index ${index}`);
    }

    return { method: method as PaymentMethod, amount };
  });

  const paymentTotal = parsedPayments.reduce((sum, p) => sum + p.amount, 0);

  // ✅ No puede pagar menos del total
  if (paymentTotal - order.total < -0.01) {
    throw new BadRequestError("Payment total is less than order total");
  }

  const change = paymentTotal - order.total;

  return prisma.$transaction(async (tx) => {
    await tx.payment.createMany({
      data: parsedPayments.map((p) => ({
        orderId,
        amount: p.amount,
        method: p.method,
        status: "COMPLETED" as const,
      })),
    });

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: "COMPLETED" },
      ...orderDetailArgs,
    });

    return {
      ...updatedOrder,
      change: change > 0.01 ? Number(change.toFixed(2)) : 0,
    };
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

  // ✅ COMPLETED solo se puede hacer a través de payOrder
  if (statusValue === "COMPLETED") {
    throw new BadRequestError("Use the pay endpoint to complete an order");
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

export const orderStats = async () => {
  const [totalOrders, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: revenue._sum.total ?? 0,
  };
};

export const pendingOrders = () => {
  return prisma.order.findMany({
    where: {
      status: "PENDING",
    },
    ...pendingOrderArgs,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const orderMontlyStats = async () => {
  const [completedOrders, cancelledOrders, revenue] = await Promise.all([
    prisma.order.count({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "CANCELLED",
        createdAt: {
          gte: startOfMonth,
        },
      },
    }),

    prisma.order.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  return {
    completedOrders,
    cancelledOrders,
    totalRevenue: revenue._sum.total ?? 0,
  };
};
