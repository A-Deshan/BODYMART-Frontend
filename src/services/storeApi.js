import { api } from './api.js';

export async function loginStoreAccount(payload) {
  const { data } = await api.post('/store/auth/login', payload);
  return data;
}

export async function registerStoreAccount(payload) {
  const { data } = await api.post('/store/auth/register', payload);
  return data;
}

export async function fetchStoreProducts(params = {}) {
  const { data } = await api.get('/store/products', { params });
  return data.items || [];
}

export async function fetchStoreHighlights() {
  const { data } = await api.get('/store/highlights');
  return data.items || [];
}

export async function fetchMembershipPlans() {
  const { data } = await api.get('/store/memberships/plans');
  return data.items || [];
}

export async function purchaseMembership(payload) {
  const { data } = await api.post('/store/memberships', payload);
  return data.item;
}

export async function createStoreOrder(payload) {
  const { data } = await api.post('/store/orders', payload);
  return data.item;
}

export async function submitWorkoutPlanRequest(payload) {
  const { data } = await api.post('/store/workout-plans', payload);
  return data.item;
}
