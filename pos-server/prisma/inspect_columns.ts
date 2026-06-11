import { prisma } from "../src/db/prisma";

async function inspect(table: string) {
  console.log(`Columns for table ${table}:`);
  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position`,
  );
  for (const r of rows) console.log(` - ${r.column_name}`);
}

async function main() {
  await inspect("order_items");
  await inspect("inventory_transactions");
  await inspect("products");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
