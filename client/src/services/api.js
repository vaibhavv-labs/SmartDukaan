/**
 * KiranaMind AI — Unified Backend API Client
 * Connects frontend to the FastAPI + SQLite backend with seamless error handling.
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // If using FormData, let browser set multipart boundary
  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[API] Failed request to ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // 1. Health & Dashboard
  getHealth: () => request('/health'),
  getDashboardStats: () => request('/dashboard/stats'),

  // 2. Inventory
  getProducts: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.category && params.category !== 'All') q.append('category', params.category);
    if (params.stock_status && params.stock_status !== 'all') q.append('stock_status', params.stock_status);
    if (params.sort_by) q.append('sort_by', params.sort_by);
    if (params.sort_dir) q.append('sort_dir', params.sort_dir);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/inventory/${qs}`);
  },
  getInventoryStats: () => request('/inventory/summary/stats'),
  getProduct: (id) => request(`/inventory/${id}`),
  createProduct: (data) => request('/inventory/', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),

  // 3. Sales & Billing
  getSales: (params = {}) => {
    const q = new URLSearchParams();
    if (params.payment_mode) q.append('payment_mode', params.payment_mode);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/sales/${qs}`);
  },
  createSale: (saleData) => request('/sales/', { method: 'POST', body: saleData }),
  getSale: (id) => request(`/sales/${id}`),

  // 4. Khata Book & Udhaar
  getKhataSummary: () => request('/khata/summary'),
  getCustomers: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.tier && params.tier !== 'All') q.append('tier', params.tier);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/khata/customers${qs}`);
  },
  getCustomer: (id) => request(`/khata/customers/${id}`),
  createCustomer: (data) => request('/khata/customers', { method: 'POST', body: data }),
  updateCustomer: (id, data) => request(`/khata/customers/${id}`, { method: 'PUT', body: data }),
  addKhataTransaction: (customerId, txData) =>
    request(`/khata/customers/${customerId}/transaction`, { method: 'POST', body: txData }),
  getKhataReminder: (customerId) =>
    request(`/khata/customers/${customerId}/reminder`, { method: 'POST' }),

  // 5. Proactive Insights
  getInsights: (params = {}) => {
    const q = new URLSearchParams();
    if (params.insight_type) q.append('insight_type', params.insight_type);
    if (params.severity) q.append('severity', params.severity);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/insights/${qs}`);
  },
  recalculateInsights: () => request('/insights/recalculate', { method: 'POST' }),
  takeInsightAction: (id) => request(`/insights/${id}/action`, { method: 'POST' }),
  dismissInsight: (id) => request(`/insights/${id}`, { method: 'DELETE' }),

  // 6. AI Multi-Modal
  parseVoiceBilling: (audioText, language = 'hinglish') =>
    request('/ai/voice-billing', { method: 'POST', body: { audio_text: audioText, language } }),
  scanWholesalerBill: (formData) =>
    request('/ai/scan-bill', { method: 'POST', body: formData || {} }),
  applyScannedBill: (items) =>
    request('/ai/scan-bill/apply', { method: 'POST', body: { items } }),
  scanKhataSheet: (formData) =>
    request('/ai/scan-khata', { method: 'POST', body: formData || {} }),
  askCopilot: (message, conversationHistory = []) =>
    request('/ai/chat', { method: 'POST', body: { message, conversation_history: conversationHistory } }),
};
