import { api } from './api.js';

export async function fetchDashboardOverview() {
  const { data } = await api.get('/dashboard/overview');
  return data;
}
