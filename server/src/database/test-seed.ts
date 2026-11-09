import { AppDataSource } from "./data-source.js";
import { Order } from "../entities/Order.entity.js";

export async function seedTestOrdersForAnalytics() {
  const orderRepo = AppDataSource.getRepository(Order);

  // Clear existing orders
  await orderRepo.delete({});

  // Test data: orders with various categories, dates, and statuses
  const categories = ["Rock", "Jazz", "Pop", "Electronic", "Classical"];
  const baseDate = new Date("2026-08-09");
  const orders: Partial<Order>[] = [];

  // Create test orders across multiple months
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const monthDate = new Date(baseDate);
    monthDate.setMonth(monthDate.getMonth() + monthOffset);

    // Create multiple orders per month for each category
    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
      const category = categories[catIndex];

      // ENTREGUE orders (should be counted)
      for (let i = 0; i < 2; i++) {
        const orderDate = new Date(monthDate);
        orderDate.setDate(Math.min(10 + i * 5, 28)); // Spread within month

        orders.push({
          id: `test-order-${monthOffset}-${catIndex}-entregue-${i}`,
          customerId: "c1",
          customerName: "Diogo Jonsson",
          items: [
            {
              vinylId: `vinyl-${catIndex}-${i}`,
              title: `Album ${category} ${i + 1}`,
              artist: `Artist ${category}`,
              category: category,
              price: 100 + catIndex * 10 + i * 5,
              quantity: 1,
            },
          ],
          subtotal: 100 + catIndex * 10 + i * 5,
          freight: 20,
          discount: 0,
          total: 120 + catIndex * 10 + i * 5,
          status: "ENTREGUE" as const,
          paymentDetails: "Cartão de Crédito",
          deliveryAddress: {
            logradouro: "Av. Paulista",
            numero: "1000",
            cep: "01310-100",
            cidade: "São Paulo",
            estado: "SP",
          },
          createdAt: orderDate,
          updatedAt: orderDate,
        });
      }

      // EM PROCESSAMENTO orders (should NOT be counted)
      orders.push({
        id: `test-order-${monthOffset}-${catIndex}-processing`,
        customerId: "c2",
        customerName: "John Doe",
        items: [
          {
            vinylId: `vinyl-${catIndex}-processing`,
            title: `Album ${category} Processing`,
            artist: `Artist ${category}`,
            category: category,
            price: 150,
            quantity: 1,
          },
        ],
        subtotal: 150,
        freight: 20,
        discount: 0,
        total: 170,
        status: "EM PROCESSAMENTO" as const,
        paymentDetails: "Cartão de Crédito",
        deliveryAddress: {
          logradouro: "Rua Copacabana",
          numero: "450",
          cep: "22020-001",
          cidade: "Rio de Janeiro",
          estado: "RJ",
        },
        createdAt: new Date(monthDate.getTime() + 1000 * 60 * 60 * 12), // 12 hours after
        updatedAt: new Date(monthDate.getTime() + 1000 * 60 * 60 * 12),
      });

      // CANCELADO orders (should NOT be counted)
      orders.push({
        id: `test-order-${monthOffset}-${catIndex}-canceled`,
        customerId: "c1",
        customerName: "Diogo Jonsson",
        items: [
          {
            vinylId: `vinyl-${catIndex}-canceled`,
            title: `Album ${category} Canceled`,
            artist: `Artist ${category}`,
            category: category,
            price: 80,
            quantity: 1,
          },
        ],
        subtotal: 80,
        freight: 20,
        discount: 0,
        total: 100,
        status: "CANCELADO" as const,
        paymentDetails: "Cartão de Débito",
        deliveryAddress: {
          logradouro: "Av. Paulista",
          numero: "1000",
          cep: "01310-100",
          cidade: "São Paulo",
          estado: "SP",
        },
        createdAt: new Date(monthDate.getTime() + 1000 * 60 * 60 * 18),
        updatedAt: new Date(monthDate.getTime() + 1000 * 60 * 60 * 20),
      });
    }
  }

  // Save all orders
  const savedOrders = await orderRepo.save(orders);

  return savedOrders;
}
