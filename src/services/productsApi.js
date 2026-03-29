import { api } from './api.js';

export async function fetchProducts(params = {}) {
  const { data } = await api.get('/products', { params });
  return data.items || [];
}

export async function createProduct(payload) {
  const { data } = await api.post('/products', payload);
  return data.item;
}

export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.item;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
}
