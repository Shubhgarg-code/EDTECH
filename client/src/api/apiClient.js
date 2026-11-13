const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Convenience helpers
export const api = {
  get: (url, options) => apiClient(url, { method: 'GET', ...options }),
  post: (url, body, options) => apiClient(url, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (url, body, options) => apiClient(url, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (url, options) => apiClient(url, { method: 'DELETE', ...options })
};

