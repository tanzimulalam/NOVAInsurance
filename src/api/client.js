const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('lri_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const authApi = {
  login: (username, password) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  verify: () => request('/api/auth/verify'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
};

export const leadsApi = {
  getAll: () => request('/api/leads'),
  create: (type, data = {}) =>
    request('/api/leads', { method: 'POST', body: JSON.stringify({ type, data }) }),
  update: (id, payload) =>
    request(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  delete: (id) => request(`/api/leads/${id}`, { method: 'DELETE' }),
  streamUrl: () => `${API_BASE}/api/leads/stream`,
};
