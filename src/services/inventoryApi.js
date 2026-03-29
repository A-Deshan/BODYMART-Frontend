import { api } from './api.js';

export async function fetchInventory(params = {}) {
  const { data } = await api.get('/inventory', { params });
  return data.items || [];
}

export async function updateStock(productId, payload) {
  const { data } = await api.patch(`/inventory/${productId}`, payload);
  return data.item;
}

export async function fetchInventoryHistory(params = {}) {
  const { data } = await api.get('/inventory/history', { params });
  return data.items || [];
}
