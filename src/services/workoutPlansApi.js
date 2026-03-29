import { api } from './api.js';

export async function fetchWorkoutPlanRequests(params = {}) {
  const { data } = await api.get('/workout-plans', { params });
  return data.items || [];
}

export async function updateWorkoutPlanRequest(id, payload) {
  const { data } = await api.put(`/workout-plans/${id}`, payload);
  return data.item;
}
