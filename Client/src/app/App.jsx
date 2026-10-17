import React, { useEffect } from 'react';
import { AppProviders } from './providers';
import AppRoutes from './routes';

// Security: Clean up any sensitive database collections leaked into localStorage by legacy mock stores
const purgeSensitiveLocalStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const SENSITIVE_STORAGE_KEYS = [
    'hm_invoices_v2',
    'hm_payments_v2',
    'hm_refunds_v2',
    'hm_inventory_items',
    'hotel_inventory_incidents_v2',
    'hotel_guest_charges_v2',
    'hotel_guests',
    'hotel_guests_v1',
    'hotel_reservations',
    'hotel_room_inventory_v1',
    'hk_rooms',
    'hk_staff',
    'hk_maintenance',
    'hotel_staff_data',
  ];
  SENSITIVE_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
};

export default function App() {
  useEffect(() => {
    purgeSensitiveLocalStorage();
  }, []);

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
