import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const AuditLogService = {
  /**
   * Fetch paginated audit trail logs with filters
   */
  async getLogs({ page = 1, limit = 10, action = '', entityType = '', severity = '', search = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (action) params.append('action', action);
    if (entityType) params.append('entityType', entityType);
    if (severity) params.append('severity', severity);
    if (search) params.append('search', search);

    return request('GET', `/audit-logs?${params.toString()}`);
  },

  /**
   * Fetch security events & audit telemetry statistics
   */
  async getAuditStats() {
    return request('GET', '/audit-logs/stats');
  },
};

export default AuditLogService;
