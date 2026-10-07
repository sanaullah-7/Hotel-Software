import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        // Try background token refresh via HTTP-only cookie
        try {
          const refreshRes = await authService.refreshToken();
          if (refreshRes?.data?.accessToken) {
            const profileRes = await authService.getProfile();
            const profileUser = profileRes?.data;
            if (profileUser) {
              setUser(profileUser);
              setIsAuthenticated(true);
              localStorage.setItem('user', JSON.stringify(profileUser));
              localStorage.setItem('isAuthenticated', 'true');
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // No active session cookie
        }
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with backend /auth/me
      const profileRes = await authService.getProfile();
      const profileUser = profileRes?.data;
      if (profileUser) {
        setUser(profileUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(profileUser));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async ({ email, password }) => {
    const res = await authService.login({ email, password });
    const userData = res?.data?.account || res?.data?.user;
    setUser(userData);
    setIsAuthenticated(true);
    return res;
  };

  const registerAndOnboard = async ({ fullName, email, phone, password, hotelName, address, city }) => {
    // 1. Register account
    await authService.register({ fullName, email, phone, password });

    // 2. Login to get access token
    await authService.login({ email, password });

    // 3. Provision hotel tenant if hotelName is provided
    if (hotelName && hotelName.trim()) {
      await authService.onboard({
        property_name: hotelName.trim(),
        address: address?.trim() || `${hotelName.trim()} Main Road`,
        city: city?.trim() || 'Karachi',
      });
      localStorage.setItem('hotelName', hotelName.trim());
    }

    // 4. Fetch the final account profile with hotelId and HOTEL_ADMIN role
    const profileRes = await authService.getProfile();
    const finalUser = profileRes?.data;
    setUser(finalUser);
    setIsAuthenticated(true);
    return finalUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        registerAndOnboard,
        logout,
        refreshProfile: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
