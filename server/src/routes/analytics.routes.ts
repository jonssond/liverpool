import { Router } from "express";
import { AppDataSource } from "../database/data-source.js";
import { Order } from "../entities/Order.entity.js";
import { SalesAnalyticsController } from "../controllers/SalesAnalytics.controller.js";
import { SalesAnalyticsService } from "../services/SalesAnalytics.service.js";
import { SalesAnalyticsRepository } from "../repositories/SalesAnalytics.repository.js";
import { seedTestOrdersForAnalytics } from "../database/test-seed.js";

const router = Router();

// Initialize repository, service, and controller
const orderRepository = AppDataSource.getRepository(Order);
const analyticsRepository = new SalesAnalyticsRepository(orderRepository);
const analyticsService = new SalesAnalyticsService(analyticsRepository);
const analyticsController = new SalesAnalyticsController(analyticsService);

// Routes
router.get("/sales", (req, res) =>
  analyticsController.analyze(req, res)
);

router.get("/categories", (req, res) =>
  analyticsController.getCategories(req, res)
);

// Test seed route (for e2e tests)
router.post("/db-seed", async (req, res) => {
  try {
    await seedTestOrdersForAnalytics();
    res.json({ message: "Test data seeded successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as analyticsRouter };
