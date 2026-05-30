import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  console.log("Starting happy-path order test...");

  // Find the product we want to buy
  const product = await prisma.product.findFirst({
    where: { name: "Galleta de Vainilla" },
  });
  if (!product) {
    console.error('Product "Galleta de Vainilla" not found.');
    process.exit(1);
  }

  console.log("Product before:", {
    id: product.id,
    name: product.name,
    quantity: product.quantity,
    trackInventory: product.trackInventory,
  });

  const buyQty = 2;

  // Build a request-like payload to show to the user
  // pick a cashier user to associate the order with
  const cashier = await prisma.user.findFirst({ where: { role: "CASHIER" } });
  if (!cashier) {
    console.error("No cashier user found to attach the test order to.");
    process.exit(1);
  }

  const requestBody = {
    userId: cashier.id,
    items: [{ productId: product.id, quantity: buyQty }],
    payment: { method: "CASH", amount: product.price * buyQty },
  };

  console.log("\nRequest body:");
  console.log(JSON.stringify(requestBody, null, 2));

  // Run transaction: validate stock, create order, create items, create payment, decrement stock
  const order = await prisma.$transaction(async (tx) => {
    // re-fetch product inside transaction
    const p = await tx.product.findUnique({ where: { id: product.id } });
    if (!p) throw new Error("Product disappeared during transaction");

    if (p.trackInventory && p.quantity < buyQty) {
      throw new Error("Not enough stock for product " + p.name);
    }

    const createdOrder = await tx.order.create({
      data: {
        orderNumber: `TEST-ORD-${Date.now()}`,
        user: { connect: { id: cashier.id } },
        total: product.price * buyQty,
        status: "COMPLETED",
        paymentMethod: requestBody.payment.method,
        items: {
          create: [
            {
              productId: product.id,
              quantity: buyQty,
              unitPrice: product.price,
              subtotal: product.price * buyQty,
            },
          ],
        },
        payments: {
          create: [
            {
              amount: requestBody.payment.amount,
              method: requestBody.payment.method,
              status: "COMPLETED",
              transactionRef: `TEST-TXN-${Date.now()}`,
            },
          ],
        },
      },
      include: { items: true, payments: true },
    });

    if (p.trackInventory) {
      await tx.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: buyQty } },
      });
    }

    return createdOrder;
  });

  console.log("\nOrder created (response):");
  console.log(JSON.stringify(order, null, 2));

  const productAfter = await prisma.product.findUnique({
    where: { id: product.id },
  });
  console.log("\nProduct after:", {
    id: productAfter?.id,
    name: productAfter?.name,
    quantity: productAfter?.quantity,
  });

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error("Error during happy-path test:", e);
  await prisma.$disconnect();
  process.exit(1);
});
