import { Request, Response } from "express";
import { SalesAnalyticsService } from "../services/SalesAnalytics.service.js";

export class SalesAnalyticsController {
  constructor(private readonly service: SalesAnalyticsService) {}

  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, categories } = req.query;

      if (!startDate || !endDate || !categories) {
        res.status(400).json({
          error: "startDate, endDate e categories são obrigatórios",
        });
        return;
      }

      const categoriesList = Array.isArray(categories)
        ? (categories as unknown as string[])
        : [categories as string];

      const result = await this.service.analyze(
        startDate as string,
        endDate as string,
        categoriesList
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.service.getAvailableCategories();
      res.json({ categories });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
