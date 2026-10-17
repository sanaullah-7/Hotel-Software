import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../Services/NotificationService.js';
import { useSuperAdmin } from '../Context/SuperAdminContext.jsx';

export function useNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setUnreadCount } = useSuperAdmin();

  const fetchNotifications = useCallback(async () => {
     
    setLoading(true);
    setError(null);
    try {
      const res = await NotificationService.getNotifications();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setNotifications(list);
      const unread = res?.unreadCount !== undefined ? res.unreadCount : list.filter((n) => !n.read && !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await NotificationService.markAsRead(id);
     
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await NotificationService.markAllAsRead();
     
    fetchNotifications();
  };

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

export default useNotification;
