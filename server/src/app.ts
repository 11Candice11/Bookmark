import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { branchesRouter } from "./routes/branches.routes.js";
import { bookingsRouter } from "./routes/bookings.routes.js";

/** Builds the Express app without listening, so tests can import it. */
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CLIENT_ORIGIN }));
  app.use(express.json());

  app.get("/api/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", db: "up" });
    } catch (err) {
      console.error(err);
      res.status(503).json({ status: "error", db: "down" });
    }
  });

  app.use("/api/branches", branchesRouter);
  app.use("/api/bookings", bookingsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
