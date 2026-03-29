import { api } from './api.js';

export async function fetchOrders(params = {}) {
  const { data } = await api.get('/orders', { params });
  return data.items || [];
}

export async function createOrder(payload) {
  const { data } = await api.post('/orders', payload);
  return data.item;
}

export async function updateOrder(id, payload) {
  const { data } = await api.put(`/orders/${id}`, payload);
  return data.item;
}

export async function updateOrderStatus(id, orderStatus) {
  const { data } = await api.patch(`/orders/${id}/status`, { orderStatus });
  return data.item;
}

export async function deleteOrder(id) {
  await api.delete(`/orders/${id}`);
}
