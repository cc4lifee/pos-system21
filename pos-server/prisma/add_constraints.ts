import { prisma } from "../src/db/prisma";

async function applyConstraint(name: string, sql: string) {
  const check = `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${name}') THEN ${sql}; END IF; END $$;`;
  console.log(`Applying constraint ${name}...`);
  await prisma.$executeRawUnsafe(check);
  console.log(`Constraint ${name} applied (or already existed).`);
}

async function main() {
  // Products
  await applyConstraint(
    "chk_products_price_non_negative",
    "ALTER TABLE products ADD CONSTRAINT chk_products_price_non_negative CHECK (price >= 0)",
  );

  await applyConstraint(
    "chk_products_cost_non_negative_or_null",
    "ALTER TABLE products ADD CONSTRAINT chk_products_cost_non_negative_or_null CHECK (cost IS NULL OR cost >= 0)",
  );

  await applyConstraint(
    "chk_products_quantity_non_negative",
    "ALTER TABLE products ADD CONSTRAINT chk_products_quantity_non_negative CHECK (quantity >= 0)",
  );

  // Orders
  await applyConstraint(
    "chk_orders_total_non_negative",
    "ALTER TABLE orders ADD CONSTRAINT chk_orders_total_non_negative CHECK (total >= 0)",
  );

  // Order Items
  await applyConstraint(
    "chk_order_items_quantity_positive",
    "ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0)",
  );

  await applyConstraint(
    "chk_order_items_unitprice_non_negative",
    'ALTER TABLE order_items ADD CONSTRAINT chk_order_items_unitprice_non_negative CHECK ("unitPrice" >= 0)',
  );

  await applyConstraint(
    "chk_order_items_subtotal_non_negative",
    'ALTER TABLE order_items ADD CONSTRAINT chk_order_items_subtotal_non_negative CHECK ("subtotal" >= 0)',
  );

  // Payments
  await applyConstraint(
    "chk_payments_amount_non_negative",
    "ALTER TABLE payments ADD CONSTRAINT chk_payments_amount_non_negative CHECK (amount >= 0)",
  );

  // Inventory transactions
  await applyConstraint(
    "chk_inventory_qty_non_negative",
    'ALTER TABLE inventory_transactions ADD CONSTRAINT chk_inventory_qty_non_negative CHECK ("quantityBefore" >= 0 AND "quantityAfter" >= 0)',
  );

  await applyConstraint(
    "chk_inventory_coherent",
    'ALTER TABLE inventory_transactions ADD CONSTRAINT chk_inventory_coherent CHECK ("quantityAfter" = "quantityBefore" + "change")',
  );

  console.log("All constraints applied.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
