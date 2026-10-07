import React, { createContext, useContext, useEffect, useState } from 'react';
import roomService from '../services/roomService';
import { syncRoomsFromBackend } from '../features/rooms/state/roomStore';
import { guestService } from '../services/guestService';
import { syncGuestsFromBackend } from '../features/guests/state/guestStore';
import reservationService from '../services/reservationService';
import { syncReservationsFromBackend } from '../features/reservations/state/reservationStore';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      Promise.all([
        roomService.getRooms().catch(() => ({ data: [] })),
        guestService.getGuests().catch(() => ({ data: [] })),
        reservationService.getReservations().catch(() => ({ data: [] }))
      ]).then(([roomsRes, guestsRes, resRes]) => {
        if (!isMounted) return;
        
        syncRoomsFromBackend(roomsRes?.data || []);
        syncGuestsFromBackend(guestsRes?.data || (guestsRes?.data?.guests) || []);
        syncReservationsFromBackend(resRes?.data || []);
        
        setIsDataLoaded(true);
      });
    } else {
      setIsDataLoaded(false);
    }
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  return (
    <DataContext.Provider value={{ isDataLoaded }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
