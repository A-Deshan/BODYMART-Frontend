import { api } from './api.js';

export async function fetchReports(params = {}) {
  const { data } = await api.get('/reports', { params });
  return data.items || [];
}

export async function createReport(payload) {
  const { data } = await api.post('/reports', payload);
  return data.payload || data.item || payload;
}

export async function fetchAnalyticsSummary(params = {}) {
  const { data } = await api.get('/reports/analytics/summary', { params });
  return data;
}

export async function fetchRevenueTrend(params = {}) {
  const { data } = await api.get('/reports/analytics/revenue-trend', { params });
  return data.items || [];
}

export async function fetchProductPerformance(params = {}) {
  const { data } = await api.get('/reports/analytics/product-performance', { params });
  return data.items || [];
}

export async function fetchUserGrowth(params = {}) {
  const { data } = await api.get('/reports/analytics/user-growth', { params });
  return data.items || [];
}

async function downloadFromEndpoint(path, filename, params = {}) {
  const response = await api.get(path, { params, responseType: 'blob' });
  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(blobUrl);
}

export async function exportSalesCsv(params = {}) {
  await downloadFromEndpoint('/reports/export/sales.csv', 'sales-report.csv', params);
}

export async function exportInventoryCsv(params = {}) {
  await downloadFromEndpoint('/reports/export/inventory.csv', 'inventory-report.csv', params);
}
