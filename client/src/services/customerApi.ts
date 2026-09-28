import type { Customer } from '../mockData';

const API_BASE = '/api/customers';
const ADMIN_TOKEN = 'admin-secret-token';

const defaultHeaders = {
  'Content-Type': 'application/json',
  Authorization: ADMIN_TOKEN,
};

export async function apiGetCustomers(): Promise<Customer[]> {
  const response = await fetch(API_BASE, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao buscar clientes.');
  }

  return response.json();
}

export async function apiGetCustomerById(id: string): Promise<Customer> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao buscar cliente.');
  }

  return response.json();
}

export async function apiCreateCustomer(customerData: any): Promise<Customer> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao cadastrar cliente.');
  }

  return response.json();
}

export async function apiUpdateCustomer(id: string, customerData: any): Promise<Customer> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify(customerData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao atualizar dados do cliente.');
  }

  return response.json();
}

export async function apiUpdateCustomerStatus(
  id: string,
  active: boolean,
  reason?: string
): Promise<Customer> {
  const response = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: JSON.stringify({ active, reason }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao alterar status do cliente.');
  }

  return response.json();
}

export async function apiDeleteCustomer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Falha ao remover cliente.');
  }
}
