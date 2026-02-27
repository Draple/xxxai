import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWishAppBalance } from '../api/wishapp.js';

/**
 * Hook para obtener y refrescar el balance de puntos WishApp.
 * Solo hace petición si hay usuario logueado (token).
 */
export function useWishAppBalance() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    if (!token) {
      setBalance(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getWishAppBalance(token);
      setBalance(data);
      return data;
    } catch (e) {
      setError(e.message || 'Error al cargar balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}
