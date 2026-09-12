import { useState, useEffect, useCallback } from 'react';
import { HotelService } from '../Services/HotelService.js';

export function useHotel(initialParams = {}) {
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchHotels = useCallback(async () => {
     
    setLoading(true);
    setError(null);
    try {
      const res = await HotelService.getHotels(params);
      setHotels(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHotels();
  }, [fetchHotels]);

  const approveHotel = async (id) => {
    await HotelService.approveHotel(id);
     
    fetchHotels();
  };

  const rejectHotel = async (id, reason) => {
    await HotelService.rejectHotel(id, reason);
     
    fetchHotels();
  };

  const suspendHotel = async (id, reason) => {
    await HotelService.suspendHotel(id, reason);
     
    fetchHotels();
  };

  const activateHotel = async (id) => {
    await HotelService.activateHotel(id);
     
    fetchHotels();
  };

  return {
    hotels,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchHotels,
    approveHotel,
    rejectHotel,
    suspendHotel,
    activateHotel,
  };
}

export default useHotel;
