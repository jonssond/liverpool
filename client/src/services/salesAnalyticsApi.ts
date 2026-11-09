const API_BASE_URL = "http://localhost:3001/api/analytics";

export interface SalesDataPoint {
  month: string;
  category: string;
  totalSales: number;
}

export interface SalesAnalyticsResponse {
  startDate: string;
  endDate: string;
  categories: string[];
  data: SalesDataPoint[];
  availableCategories: string[];
}

export const salesAnalyticsApi = {
  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error("Falha ao buscar categorias");
    }
    const data = await response.json();
    return data.categories;
  },

  async analyzeSales(
    startDate: string,
    endDate: string,
    categories: string[]
  ): Promise<SalesAnalyticsResponse> {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    params.append("endDate", endDate);
    categories.forEach((cat) => params.append("categories", cat));

    const response = await fetch(`${API_BASE_URL}/sales?${params.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Falha ao analisar vendas");
    }
    return response.json();
  },
};
