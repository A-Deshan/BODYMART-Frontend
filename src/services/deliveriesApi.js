import { api } from './api.js';

export async function fetchDeliveries(params = {}) {
  const { data } = await api.get('/deliveries', { params });
  return data.items || [];
}

export async function createDelivery(payload) {
  const { data } = await api.post('/deliveries', payload);
  return data.payload || data.item || payload;
}

export async function updateDelivery(id, payload) {
  const { data } = await api.put(`/deliveries/${id}`, payload);
  return data.payload || data.item || payload;
}

export async function deleteDelivery(id) {
  await api.delete(`/deliveries/${id}`);
}
