// PATH: frontend/src/services/dashboardService.ts
import { apiClient } from './apiClient';

export async function fetchDashboardStats(period = 30) {
  const res = await apiClient.get(`/api/dashboard/stats?period=${period}`);
  return res.data.stats;
}

export async function fetchDashboardTrends(period = 90) {
  const res = await apiClient.get(`/api/dashboard/trends?period=${period}`);
  return res.data.trends;
}

export async function fetchDashboardAchievements() {
  const res = await apiClient.get(`/api/dashboard/achievements`);
  return res.data.achievements;
}

export async function fetchDashboardRecommendations() {
  const res = await apiClient.get(`/api/dashboard/recommendations`);
  return res.data.recommendations;
}

export async function fetchDashboardComparison() {
  const res = await apiClient.get(`/api/dashboard/comparison`);
  return res.data.comparison;
}

export async function fetchDashboardWeeklySummary() {
  const res = await apiClient.get(`/api/dashboard/weekly-summary`);
  return res.data.summary;
}
// EOF
