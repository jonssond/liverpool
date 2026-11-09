import { Repository } from "typeorm";
import { Order } from "../entities/Order.entity.js";

export interface SalesDataPoint {
  month: string; // MM/YYYY
  category: string;
  totalSales: number;
}

export class SalesAnalyticsRepository {
  constructor(private readonly ormRepo: Repository<Order>) {}

  async getSalesByPeriodAndCategories(
    startDate: Date,
    endDate: Date,
    categories: string[]
  ): Promise<SalesDataPoint[]> {
    const orders = await this.ormRepo.find({
      where: {
        status: "ENTREGUE",
      },
      order: { createdAt: "ASC" },
    });

    const result: Map<string, number> = new Map();

    orders.forEach((order) => {
      // Filter by date in memory (TypeORM limitations with custom types)
      if (order.createdAt < startDate || order.createdAt > endDate) {
        return;
      }

      order.items.forEach((item) => {
        // Filter by selected categories
        if (!categories.includes(item.category)) {
          return;
        }

        const month = this.formatMonth(order.createdAt);
        const key = `${month}|${item.category}`;
        const itemTotal = item.price * item.quantity;

        result.set(key, (result.get(key) || 0) + itemTotal);
      });
    });

    const dataPoints: SalesDataPoint[] = Array.from(result.entries()).map(
      ([key, totalSales]) => {
        const [month, category] = key.split("|");
        return { month, category, totalSales };
      }
    );

    return dataPoints.sort((a, b) => {
      const monthDiff = this.parseMonth(a.month) - this.parseMonth(b.month);
      return monthDiff !== 0 ? monthDiff : a.category.localeCompare(b.category);
    });
  }

  async getAvailableCategories(): Promise<string[]> {
    const orders = await this.ormRepo.find();
    const categoriesSet = new Set<string>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        categoriesSet.add(item.category);
      });
    });

    return Array.from(categoriesSet).sort();
  }

  private formatMonth(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${year}`;
  }

  private parseMonth(monthStr: string): number {
    const [month, year] = monthStr.split("/");
    return parseInt(year) * 12 + parseInt(month);
  }
}
