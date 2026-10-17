const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export class ApiError extends Error {
  constructor(status, message, data = null, errors = []) {
    super(message);
    this.status = status;
    this.data = data;
    this.errors = errors;
  }
}

export const getToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
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

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

export const apiRequest = async (endpoint, options = {}, isRetry = false) => {
  const token = getToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || "GET",
    credentials: "include", // Essential for HTTP-only cookies (refreshToken)
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object" && !isFormData) {
    config.body = JSON.stringify(options.body);
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

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
      // Check if this is an expired token (401) on an authenticated route
      const isAuthRoute = endpoint.includes("/auth/login") || endpoint.includes("/auth/register") || endpoint.includes("/auth/refresh");
      
      if (response.status === 401 && !isAuthRoute && !isRetry) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            });
            const refreshData = await refreshRes.json();
            if (refreshRes.ok && refreshData?.data?.accessToken) {
              const newToken = refreshData.data.accessToken;
              setToken(newToken);
              isRefreshing = false;
              onRefreshed(newToken);
              return apiRequest(endpoint, options, true);
            } else {
              isRefreshing = false;
              setToken(null);
              localStorage.removeItem("user");
              localStorage.removeItem("isAuthenticated");
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("auth:logout"));
              }
            }
          } catch {
            isRefreshing = false;
            setToken(null);
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("auth:logout"));
            }
          }
        } else {
          // Wait for the in-flight refresh to finish
          return new Promise((resolve) => {
            subscribeTokenRefresh(() => {
              resolve(apiRequest(endpoint, options, true));
            });
          });
        }
      }

      const rawErrors = Array.isArray(data?.errors) ? data.errors : [];
      const errorMessage = rawErrors.length > 0
        ? rawErrors.join(", ")
        : (data?.message || data?.error?.message || `HTTP Error ${response.status}`);

      throw new ApiError(response.status, errorMessage, data, rawErrors);
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
  get: (url, params = {}, options = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        query.append(k, v);
      }
    });
    const queryString = query.toString();
    return apiRequest(queryString ? `${url}?${queryString}` : url, { method: "GET", ...options });
  },
  post: (url, body, options = {}) => apiRequest(url, { method: "POST", body, ...options }),
  put: (url, body, options = {}) => apiRequest(url, { method: "PUT", body, ...options }),
  patch: (url, body, options = {}) => apiRequest(url, { method: "PATCH", body, ...options }),
  delete: (url, options = {}) => apiRequest(url, { method: "DELETE", ...options }),
};

export default api;
