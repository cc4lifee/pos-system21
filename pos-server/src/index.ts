import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db/prisma";
import productsRouter from "./routes/products";
import usersRouter from "./routes/users";
import ordersRouter from "./routes/orders";
import inventoryRouter from "./routes/inventory";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:4200";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CORS_ORIGIN }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

app.use(`${apiPrefix}/products`, productsRouter);
app.use(`${apiPrefix}/users`, usersRouter);
app.use(`${apiPrefix}/orders`, ordersRouter);
app.use(`${apiPrefix}/inventory`, inventoryRouter);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "POS System API",
    version: process.env.API_VERSION || "v1",
    endpoints: {
      health: "/health",
      products: `${apiPrefix}/products`,
      users: `${apiPrefix}/users`,
      orders: `${apiPrefix}/orders`,
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const start = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log("✓ Database connected");

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API at http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
};

start();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n✓ Closing database connection...");
  await prisma.$disconnect();
  process.exit(0);
});
