import { api } from './api.js';

export async function fetchMemberships(params = {}) {
  const { data } = await api.get('/memberships', { params });
  return data.items || [];
}

export async function fetchMembershipPlans() {
  const { data } = await api.get('/memberships/plans');
  return data.items || [];
}

export async function createMembershipPlan(payload) {
  const { data } = await api.post('/memberships/plans', payload);
  return data.item;
}

export async function updateMembershipPlan(id, payload) {
  const { data } = await api.put(`/memberships/plans/${id}`, payload);
  return data.item;
}

export async function deleteMembershipPlan(id) {
  await api.delete(`/memberships/plans/${id}`);
}

export async function createMembership(payload) {
  const { data } = await api.post('/memberships', payload);
  return data.item;
}

export async function updateMembership(id, payload) {
  const { data } = await api.put(`/memberships/${id}`, payload);
  return data.item;
}

export async function deleteMembership(id) {
  await api.delete(`/memberships/${id}`);
}
