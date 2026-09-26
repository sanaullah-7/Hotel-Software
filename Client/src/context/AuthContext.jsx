/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
      if (localStorage.getItem('isAuthenticated') === 'true') {
        return {
          email: localStorage.getItem('email') || 'admin@hotel.com',
          role: 'Admin',
          name: localStorage.getItem('fullName') || 'Admin',
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncAuth = (event) => {
      if (event.key !== null && !['user', 'isAuthenticated'].includes(event.key)) return;
      try {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
        else if (localStorage.getItem('isAuthenticated') === 'true') {
          setUser({
            email: localStorage.getItem('email') || 'admin@hotel.com',
            role: 'Admin',
            name: localStorage.getItem('fullName') || 'Admin',
          });
        } else setUser(null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    if (userData?.email) localStorage.setItem('email', userData.email);
    if (userData?.name || userData?.fullName) {
      localStorage.setItem('fullName', userData.name || userData.fullName);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const stored = localStorage.getItem('user');
    const isAuth = !!stored || localStorage.getItem('isAuthenticated') === 'true';
    return {
      user: isAuth ? (stored ? JSON.parse(stored) : { role: 'Admin', email: 'admin@hotel.com' }) : null,
      isAuthenticated: isAuth,
      login: () => {},
      logout: () => {},
    };
  }
  return context;
};
