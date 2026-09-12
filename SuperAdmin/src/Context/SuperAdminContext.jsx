import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, THEME_KEY, SIDEBAR_KEY } from '../utils/constants.js';
import { NotificationService } from '../Services/NotificationService.js';

// =============================================================================
// Context
// =============================================================================
const SuperAdminContext = createContext(null);

// =============================================================================
// Toast types
// =============================================================================
let toastId = 0;

// =============================================================================
// Provider
// =============================================================================
export function SuperAdminProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [token, setToken]     = useState(() => localStorage.getItem(AUTH_TOKEN_KEY) || null);
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_USER_KEY)) || null; }
    catch { return null; }
  });

  const isAuthenticated = Boolean(token);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_KEY) === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => {
      const next = !c;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((o) => !o);
  }, []);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { count } = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshUnreadCount();
  }, [isAuthenticated, refreshUnreadCount]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error', 5000),
    warning: (msg) => addToast(msg, 'warning'),
    info:    (msg) => addToast(msg, 'info'),
  };

  // ─────────────────────────────────────────────────────────────────────────
  const value = {
    // auth
    token, user, isAuthenticated, login, logout,
    // theme
    theme, toggleTheme,
    // sidebar
    sidebarCollapsed, toggleSidebar,
    mobileSidebarOpen, toggleMobileSidebar, setMobileSidebarOpen,
    // notifications
    unreadCount, refreshUnreadCount, setUnreadCount,
    // toasts
    toasts, toast, removeToast,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================
export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  return ctx;
}

export default SuperAdminContext;
