import api, { setToken, getToken } from "../api/client.js";

export const authService = {
  login: async ({ email, password }) => {
    const res = await api.post("/auth/login", { email: email?.trim()?.toLowerCase(), password });
    if (res?.data?.accessToken) {
      setToken(res.data.accessToken);
      const user = res.data.account || res.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
      if (user?.fullName) localStorage.setItem("fullName", user.fullName);
      if (user?.email) localStorage.setItem("email", user.email);
      if (user?.hotelName) localStorage.setItem("hotelName", user.hotelName);
    }
    return res;
  },

  register: async ({ fullName, email, phone, password }) => {
    const payload = {
      fullName: fullName?.trim(),
      email: email?.trim()?.toLowerCase(),
      password,
    };
    if (phone && phone.trim()) {
      payload.phone = phone.trim();
    }
    return api.post("/auth/register", payload);
  },

  registerHotel: async ({ fullName, email, phone, password, hotelName, address, city, subscriptionPlan }) => {
    return api.post("/auth/register-hotel", {
      fullName: fullName?.trim(),
      email: email?.trim()?.toLowerCase(),
      phone: phone && phone.trim() ? phone.trim() : undefined,
      password,
      hotelName: hotelName?.trim(),
      address: address?.trim() || `${hotelName?.trim()} Main Road`,
      city: city?.trim() || "Karachi",
      subscriptionPlan: subscriptionPlan || "STANDARD",
    });
  },

  onboard: async ({ property_name, address, city }) => {
    return api.post("/provisioning/onboard", {
      property_name: property_name?.trim(),
      address: address?.trim(),
      city: city?.trim(),
    });
  },

  getProfile: async () => {
    return api.get("/auth/me");
  },

  refreshToken: async () => {
    const res = await api.post("/auth/refresh");
    if (res?.data?.accessToken) {
      setToken(res.data.accessToken);
    }
    return res;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore API errors during logout
    } finally {
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("email");
    }
  },

  getToken,
};

export default authService;
