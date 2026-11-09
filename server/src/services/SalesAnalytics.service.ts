import { SalesAnalyticsRepository, SalesDataPoint } from "../repositories/SalesAnalytics.repository.js";

export interface SalesAnalyticsResponse {
  startDate: string;
  endDate: string;
  categories: string[];
  data: SalesDataPoint[];
  availableCategories: string[];
}

export class SalesAnalyticsService {
  constructor(private readonly repository: SalesAnalyticsRepository) {}

  async analyze(
    startDate: string,
    endDate: string,
    categories: string[]
  ): Promise<SalesAnalyticsResponse> {
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Data inválida fornecida");
    }

    if (start > end) {
      throw new Error("Data inicial não pode ser maior que data final");
    }

    if (categories.length === 0) {
      throw new Error("Selecione pelo menos uma categoria");
    }

    // Set time to end of day for endDate
    end.setHours(23, 59, 59, 999);

    // Get sales data
    const data = await this.repository.getSalesByPeriodAndCategories(
      start,
      end,
      categories
    );

    // Get available categories
    const availableCategories = await this.repository.getAvailableCategories();

    return {
      startDate,
      endDate,
      categories,
      data,
      availableCategories,
    };
  }

  async getAvailableCategories(): Promise<string[]> {
    return this.repository.getAvailableCategories();
  }
}
