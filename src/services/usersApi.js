import { api } from './api.js';

export async function fetchUsers(params = {}) {
  const { data } = await api.get('/users', { params });
  return data.items || [];
}

export async function createUser(payload) {
  const { data } = await api.post('/users', payload);
  return data.payload || data.item || payload;
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.payload || data.item || payload;
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
}
