import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (order matters due to FKs)
  await prisma.inventoryTransaction.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // Create roles
  const roleAdmin = await prisma.role.create({
    data: { name: "ADMIN", label: "Administrator" },
  });
  const roleCashier = await prisma.role.create({
    data: { name: "CASHIER", label: "Cashier" },
  });

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: "admin@posystem.com",
      password: await bcrypt.hash("admin123", SALT_ROUNDS),
      name: "Admin User",
      roleId: roleAdmin.id,
    },
  });

  const cashier1 = await prisma.user.create({
    data: {
      email: "cashier1@posystem.com",
      password: await bcrypt.hash("cashier123", SALT_ROUNDS),
      name: "Juan Pérez",
      roleId: roleCashier.id,
    },
  });

  const cashier2 = await prisma.user.create({
    data: {
      email: "cashier2@posystem.com",
      password: await bcrypt.hash("cashier123", SALT_ROUNDS),
      name: "María García",
      roleId: roleCashier.id,
    },
  });

  // Create categories
  const catDrinks = await prisma.category.create({
    data: { name: "Bebidas calientes" },
  });
  const catPastry = await prisma.category.create({
    data: { name: "Pastelería" },
  });
  const catColdDrinks = await prisma.category.create({
    data: { name: "Bebidas frías" },
  });
  const catSandwiches = await prisma.category.create({
    data: { name: "Sándwiches" },
  });
  const catDesserts = await prisma.category.create({
    data: { name: "Postres" },
  });

  // Create products (cafetería)
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Café Espresso",
        description: "Café intenso, preparado con espresso clásico",
        price: 2.5,
        cost: 0.7,
        quantity: 120,
        categoryId: catDrinks.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Latte",
        description: "Espresso con leche vaporizada y espuma suave",
        price: 3.8,
        cost: 1.1,
        quantity: 100,
        categoryId: catDrinks.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cappuccino",
        description: "Espresso con leche y espuma cremosa, toque de cacao",
        price: 3.9,
        cost: 1.2,
        quantity: 90,
        categoryId: catDrinks.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Té Chai Latte",
        description: "Té chai especiado con leche caliente y canela",
        price: 4.2,
        cost: 1.3,
        quantity: 80,
        categoryId: catDrinks.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Matcha Latte",
        description: "Té matcha premium con leche espumosa",
        price: 4.8,
        cost: 1.6,
        quantity: 70,
        categoryId: catDrinks.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Limonada",
        description: "Limonada natural con azúcar de caña",
        price: 3.0,
        cost: 0.8,
        quantity: 60,
        categoryId: catColdDrinks.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Smoothie de Fresa",
        description: "Batido de fresa fresco con yogur",
        price: 4.5,
        cost: 1.5,
        quantity: 40,
        categoryId: catColdDrinks.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Galleta de Vainilla",
        description: "Galleta artesanal de vainilla (por pieza)",
        price: 1.5,
        cost: 0.4,
        quantity: 50,
        trackInventory: true,
        categoryId: catPastry.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Croissant",
        description: "Croissant mantequilla fresco (por pieza)",
        price: 2.2,
        cost: 0.8,
        quantity: 30,
        trackInventory: true,
        categoryId: catPastry.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sándwich de Jamón y Queso",
        description: "Sándwich caliente con jamón, queso y pan artesanal",
        price: 5.0,
        cost: 2.0,
        quantity: 25,
        categoryId: catSandwiches.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Wrap Vegetal",
        description: "Wrap con vegetales frescos y aderezo ligero",
        price: 4.7,
        cost: 1.8,
        quantity: 20,
        categoryId: catSandwiches.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Cheesecake",
        description: "Porción de cheesecake con salsa de frutos rojos",
        price: 4.2,
        cost: 1.3,
        quantity: 30,
        categoryId: catDesserts.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Brownie de Chocolate",
        description: "Brownie casero con nueces y salsa de chocolate",
        price: 3.5,
        cost: 1.0,
        quantity: 35,
        categoryId: catDesserts.id,
      },
    }),
  ]);

  // Create promotions
  const promoPercentage = await prisma.promotion.create({
    data: {
      code: "WELCOME10",
      name: "10% de descuento de bienvenida",
      discountType: "PERCENTAGE",
      discountValue: 10,
      active: true,
    },
  });
  const promoFixed = await prisma.promotion.create({
    data: {
      code: "DOLAR1",
      name: "$1 de descuento",
      discountType: "FIXED_AMOUNT",
      discountValue: 1,
      active: true,
    },
  });

  // Create sample orders (Product.price is Decimal, so it's coerced to a
  // plain number before doing arithmetic with it)
  const price0 = Number(products[0].price);
  const price1 = Number(products[1].price);
  const price2 = Number(products[2].price);
  const price3 = Number(products[3].price);

  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      userId: cashier1.id,
      total: price0 + price1,
      status: "COMPLETED",
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            unitPrice: price0,
            subtotal: price0,
          },
          {
            productId: products[1].id,
            quantity: 1,
            unitPrice: price1,
            subtotal: price1,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: price0 + price1,
            method: "CARD",
            status: "COMPLETED",
            transactionRef: "TXN-001",
          },
        ],
      },
    },
    include: { items: true, payments: true },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now() + 1}`,
      userId: cashier2.id,
      total: price3,
      status: "PENDING",
      items: {
        create: [
          {
            productId: products[3].id,
            quantity: 1,
            unitPrice: price3,
            subtotal: price3,
          },
        ],
      },
    },
    include: { items: true },
  });

  // Order using a promotion, to exercise the promotion validation flow
  const promoDiscount = Number(
    (price2 * (Number(promoPercentage.discountValue) / 100)).toFixed(2),
  );
  const order3 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now() + 2}`,
      userId: cashier1.id,
      total: price2 - promoDiscount,
      status: "PENDING",
      items: {
        create: [
          {
            productId: products[2].id,
            promotionId: promoPercentage.id,
            quantity: 1,
            unitPrice: price2,
            subtotal: price2,
            discount: promoDiscount,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log("✓ Roles created:");
  console.log(`  - ${roleAdmin.name}`);
  console.log(`  - ${roleCashier.name}`);

  console.log("\n✓ Users created:");
  console.log(`  - ${admin.email} (roleId=${admin.roleId})`);
  console.log(`  - ${cashier1.email} (roleId=${cashier1.roleId})`);
  console.log(`  - ${cashier2.email} (roleId=${cashier2.roleId})`);

  console.log(`\n✓ ${products.length} products created`);

  console.log("\n✓ Promotions created:");
  console.log(`  - ${promoPercentage.code} (${promoPercentage.discountType})`);
  console.log(`  - ${promoFixed.code} (${promoFixed.discountType})`);

  console.log(`\n✓ ${3} sample orders created (order ${order3.orderNumber} uses ${promoPercentage.code})`);
  console.log("\n✨ Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
