import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { salesAnalyticsApi } from "../../services/salesAnalyticsApi";
import type { SalesDataPoint } from "../../services/salesAnalyticsApi";
import Button from "../../components/Button";
import { Input } from "../../components/Input";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
  "#a4de6c",
  "#ffa07a",
];

export function SalesAnalytics() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [data, setData] = useState<
    Array<{
      month: string;
      [key: string]: string | number;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseTime, setResponseTime] = useState(0);

  // Load available categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await salesAnalyticsApi.getCategories();
        setAvailableCategories(categories);
      } catch (err: any) {
        setError("Erro ao carregar categorias: " + err.message);
      }
    };
    loadCategories();
  }, []);

  // Initialize dates to today and 30 days ago
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  const handleAnalyze = async () => {
    if (!startDate || !endDate) {
      setError("Preencha as datas de início e fim");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Selecione pelo menos uma categoria");
      return;
    }

    setLoading(true);
    setError("");
    const startTime = performance.now();

    try {
      const result = await salesAnalyticsApi.analyzeSales(
        startDate,
        endDate,
        selectedCategories
      );
      const endTime = performance.now();
      setResponseTime(Number((endTime - startTime).toFixed(2)));

      // Transform data for the chart
      const chartData: Array<{
        month: string;
        [key: string]: string | number;
      }> = [];
      const monthsSet = new Set<string>();

      result.data.forEach((point: SalesDataPoint) => {
        monthsSet.add(point.month);
      });

      Array.from(monthsSet)
        .sort()
        .forEach((month) => {
          const monthData: {
            month: string;
            [key: string]: string | number;
          } = { month };

          result.data.forEach((point: SalesDataPoint) => {
            if (point.month === month) {
              monthData[point.category] = point.totalSales;
            }
          });

          chartData.push(monthData);
        });

      setData(chartData);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Análise de Vendas
        </h1>

        {/* Filters Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Filtros</h2>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <Input
              label="Data Inicial"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Data Final"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Categories Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Categorias
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full px-4 py-2 font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Analisando..." : "Analisar Vendas"}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* Response Time */}
        {responseTime > 0 && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
            Tempo de resposta: {responseTime}ms
          </div>
        )}

        {/* Chart Section */}
        {data.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Histórico de Vendas por Categoria
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  label={{ value: "Mês/Ano", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  label={{ value: "Vendas (R$)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return `R$ ${value.toFixed(2)}`;
                    }
                    return value;
                  }}
                />
                <Legend />
                {selectedCategories.map((category, index) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stroke={COLORS[index % COLORS.length]}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>

            {/* Data Summary Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-100">
                    <th className="px-4 py-3 text-left font-semibold">Mês</th>
                    {selectedCategories.map((category) => (
                      <th
                        key={category}
                        className="px-4 py-3 text-right font-semibold"
                      >
                        {category}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{row.month}</td>
                      {selectedCategories.map((category) => (
                        <td
                          key={`${idx}-${category}`}
                          className="px-4 py-3 text-right"
                        >
                          R${" "}
                          {typeof row[category] === "number"
                            ? row[category].toFixed(2)
                            : "0.00"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
