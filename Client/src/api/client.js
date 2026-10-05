const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const getToken = () => {
  try {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) return token;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.accessToken || user.token || null;
    }
  } catch {
    return null;
  }
  return null;
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || "GET",
    headers,
    ...options,
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");
    let data = null;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `HTTP Error ${response.status}`;
      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
      }
      throw new ApiError(response.status, errorMessage, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, err.message || "Network error. Please check backend connection.", null);
  }
};

export const api = {
  get: (url, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.append(k, v);
      }
    });
    const queryString = query.toString();
    return apiRequest(queryString ? `${url}?${queryString}` : url, { method: "GET" });
  },
  post: (url, body) => apiRequest(url, { method: "POST", body }),
  put: (url, body) => apiRequest(url, { method: "PUT", body }),
  patch: (url, body) => apiRequest(url, { method: "PATCH", body }),
  delete: (url) => apiRequest(url, { method: "DELETE" }),
};

export default api;
