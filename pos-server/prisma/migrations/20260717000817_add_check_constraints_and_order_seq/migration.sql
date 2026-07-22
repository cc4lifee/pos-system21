-- Formalizes the CHECK constraints that used to live only in the ad-hoc
-- script prisma/add_constraints.ts (now removed), so they are tracked in
-- migration history and travel with `prisma migrate deploy`.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_price_non_negative') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_price_non_negative CHECK (price >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_cost_non_negative_or_null') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_cost_non_negative_or_null CHECK (cost IS NULL OR cost >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_products_quantity_non_negative') THEN
    ALTER TABLE products ADD CONSTRAINT chk_products_quantity_non_negative CHECK (quantity >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_orders_total_non_negative') THEN
    ALTER TABLE orders ADD CONSTRAINT chk_orders_total_non_negative CHECK (total >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_quantity_positive') THEN
    ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_unitprice_non_negative') THEN
    ALTER TABLE order_items ADD CONSTRAINT chk_order_items_unitprice_non_negative CHECK ("unitPrice" >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_order_items_subtotal_non_negative') THEN
    ALTER TABLE order_items ADD CONSTRAINT chk_order_items_subtotal_non_negative CHECK ("subtotal" >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payments_amount_non_negative') THEN
    ALTER TABLE payments ADD CONSTRAINT chk_payments_amount_non_negative CHECK (amount >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventory_qty_non_negative') THEN
    ALTER TABLE inventory_transactions ADD CONSTRAINT chk_inventory_qty_non_negative CHECK ("quantityBefore" >= 0 AND "quantityAfter" >= 0);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_inventory_coherent') THEN
    ALTER TABLE inventory_transactions ADD CONSTRAINT chk_inventory_coherent CHECK ("quantityAfter" = "quantityBefore" + "change");
  END IF;
END $$;

-- Sequence backing orderNumber generation, replacing the racy
-- `SELECT count(*) FROM orders` approach in orders.controller.ts.
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
