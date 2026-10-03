import type { Order, Coupon } from '../mockData';

const API_BASE = '/api/orders';

export async function apiGetOrders(): Promise<Order[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao buscar pedidos.');
  }
  return response.json();
}

export async function apiGetCoupons(customerId?: string): Promise<Coupon[]> {
  const url = customerId ? `${API_BASE}/coupons?customerId=${customerId}` : `${API_BASE}/coupons`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao buscar cupons.');
  }
  return response.json();
}

export async function apiCalculateFreight(state: string, totalItemsCount: number): Promise<number> {
  const response = await fetch(`${API_BASE}/freight?state=${encodeURIComponent(state)}&totalItemsCount=${totalItemsCount}`);
  if (!response.ok) {
    return 15.0;
  }
  const data = await response.json();
  return data.freight;
}

export async function apiCreateOrder(payload: any): Promise<{ order: Order; generatedExchangeCoupon?: Coupon }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao finalizar pedido.');
  }

  return response.json();
}

export async function apiUpdateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  const response = await fetch(`${API_BASE}/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao atualizar status do pedido.');
  }

  return response.json();
}
