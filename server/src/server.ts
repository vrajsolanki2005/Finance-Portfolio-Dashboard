import express from "express";
import cors from "cors";
import portfolioRoutes from "./routes/portfolio.routes.js";
import "dotenv/config";

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Portfolio backend is running",
  });
});

app.use("/api/portfolio", portfolioRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
