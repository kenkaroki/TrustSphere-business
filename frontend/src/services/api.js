import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';

// Business APIs
export const businessAPI = {
  create: (data) => axios.post('/api/business/', data),
  list: () => axios.get('/api/business/'),
  get: (id) => axios.get(`/api/business/${id}`),
  addMetric: (data) => axios.post('/api/business/metrics', data),
  getMetrics: (businessId) => axios.get(`/api/business/${businessId}/metrics`),
  addMetricsBatch: (data) => axios.post('/api/business/metrics/batch', data),
  getKpis: (businessId) => axios.get(`/api/business/${businessId}/kpis`),
  getRevenueTrends: (businessId) => axios.get(`/api/business/${businessId}/revenue-trends`),
  getGrowthByCategory: (businessId) => axios.get(`/api/business/${businessId}/growth-by-category`),
};

// AI APIs
export const aiAPI = {
  getInsights: (businessId) => axios.post(`/api/ai/insights/${businessId}`),
  analyzeMetrics: (businessId) => axios.post(`/api/ai/analyze-metrics/${businessId}`),
  generateGrowthPlan: (businessId, timeframe = '6 months') => 
    axios.post(`/api/ai/growth-plan/${businessId}?timeframe=${encodeURIComponent(timeframe)}`),
  getMarketInsights: (industry) => axios.get(`/api/ai/market-insights/${encodeURIComponent(industry)}`),
  askQuestion: (data) => axios.post('/api/ai/ask', data),
  getRecommendations: (businessId, focusArea = 'general') => 
    axios.post(`/api/ai/recommendations/${businessId}?focus_area=${focusArea}`),
  getHistory: (businessId, limit = 10) => 
    axios.get(`/api/ai/history/${businessId}?limit=${limit}`),
};

export default axios;
