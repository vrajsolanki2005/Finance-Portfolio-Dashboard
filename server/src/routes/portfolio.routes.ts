import { Router } from "express";

import {
  getPortfolio,
  calculatePortfolioSummary,
  calculateSectorSummaries,
} from "../services/portfolio.service.js";

const router = Router();

router.get("/", async (_req, res, next) => {
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
    next(error);
  }
});

export default router;
