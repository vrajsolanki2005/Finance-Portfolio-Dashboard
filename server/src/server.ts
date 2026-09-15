import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import portfolioRoutes from "./routes/portfolio.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigin,
  }),
);

app.use(
  express.json({
    limit: "100kb",
  }),
);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Portfolio backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/portfolio", portfolioRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
