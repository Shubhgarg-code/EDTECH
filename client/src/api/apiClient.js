// Normalize API base URL: ensure no trailing slash, and ensure it ends with /api
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE = getApiBase();

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('math_token') || localStorage.getItem('zenith_token');

  // Ensure endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${cleanEndpoint}`, {
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

