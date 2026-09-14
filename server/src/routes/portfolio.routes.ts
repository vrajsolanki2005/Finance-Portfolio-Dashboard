import { Router } from "express";
import {
  getPortfolio,
  calculatePortfolioSummary,
  calculateSectorSummaries,
} from "../services/portfolio.service.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const portfolio = await getPortfolio();
    const summary = calculatePortfolioSummary(portfolio);
    const sectors = calculateSectorSummaries(portfolio);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: portfolio.length,
      summary,
      sectors,
      data: portfolio,
    });
  } catch (error) {
    console.error("Portfolio error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load portfolio data",
    });
  }
});

export default router;
