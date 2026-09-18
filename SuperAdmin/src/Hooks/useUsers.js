import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../Services/UserService.js';

export function useUsers(initialParams = {}) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchUsers = useCallback(async () => {
     
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.getUsers(params);
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const activateUser = async (id) => {
    await UserService.activateUser(id);
     
    fetchUsers();
  };

  const suspendUser = async (id, reason) => {
    await UserService.suspendUser(id, reason);
     
    fetchUsers();
  };

  return {
    users,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchUsers,
    activateUser,
    suspendUser,
  };
}

export default useUsers;
