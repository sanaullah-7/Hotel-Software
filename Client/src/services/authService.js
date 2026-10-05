import api from "../api/client.js";

export const authService = {
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    if (res.data && res.data.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res.data.account || res.data.user));
      localStorage.setItem("isAuthenticated", "true");
    }
    return res;
  },

  register: async (userData) => {
    return api.post("/auth/register", userData);
  },

  onboard: async (propertyData) => {
    return api.post("/provisioning/onboard", propertyData);
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout API failures
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
    }
  },

  getProfile: async () => {
    return api.get("/auth/me");
  },
};

export default authService;
