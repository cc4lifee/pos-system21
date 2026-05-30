import { PrismaClient } from "@prisma/client";

/**
 * Singleton pattern for PrismaClient to avoid multiple connections
 * Especially important for serverless/lambda environments
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
