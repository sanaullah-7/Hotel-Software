import React, { useState, useEffect, useCallback } from 'react';
import {
  getReservations,
  syncReservationsFromBackend,
  RESERVATIONS_UPDATED_EVENT
} from '../../features/reservations/state/reservationStore';
import {
  getRooms as getRoomInventory,
  ROOM_UPDATED_EVENT
} from '../../features/rooms/state/roomStore';
import {
  getInvoices,
  getPayments,
  saveInvoices,
  savePayments,
  syncInvoicesFromBackend,
  syncPaymentsFromBackend,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../features/payment-billing/pages/paymentBillingStore';

import reservationService from '../../services/reservationService';
import roomService from '../../services/roomService';
import billingService from '../../services/billingService';
import { toFrontendReservation } from '../../features/reservations/adapters/reservationAdapter';
import {
  toFrontendInvoiceList,
  toFrontendPaymentList
} from '../../features/payment-billing/adapters/billingAdapter';

import DashboardMetrics from './components/DashboardMetrics';
import DashboardRoomStatus from './components/DashboardRoomStatus';
import CurrentBookingsTable from './components/CurrentBookingsTable';
import DashboardStaffAttendance from './components/DashboardStaffAttendance';
import InventoryPopover, { InventoryCell } from './components/InventoryPopover';

export { InventoryPopover, InventoryCell };

export default function Dashboard() {
  const [hkRooms, setHkRooms] = useState(() => getRoomInventory());
  const [roomInventory, setRoomInventory] = useState(() => getRoomInventory());
  const [reservations, setReservations] = useState(() => getReservations());
  const [invoices, setInvoices] = useState(() => getInvoices());
  const [payments, setPayments] = useState(() => getPayments());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authoritative Backend Data Fetching
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resRes, roomRes, invRes, payRes] = await Promise.allSettled([
        reservationService.getReservations({ limit: 100 }),
        roomService.getRooms({ limit: 100 }),
        billingService.getInvoices({ limit: 100 }),
        billingService.getPayments({ limit: 100 }),
      ]);

      // 1. Authoritative Reservations
      if (resRes.status === 'fulfilled') {
        const rawList = Array.isArray(resRes.value?.data?.reservations)
          ? resRes.value.data.reservations
          : Array.isArray(resRes.value?.data)
            ? resRes.value.data
            : Array.isArray(resRes.value?.reservations)
              ? resRes.value.reservations
              : (Array.isArray(resRes.value) ? resRes.value : null);

        if (rawList !== null) {
          const adapted = rawList.map(toFrontendReservation).filter(Boolean);
          setReservations(adapted);
          syncReservationsFromBackend(rawList);
        }
      }

      // 2. Authoritative Rooms
      if (roomRes.status === 'fulfilled') {
        const rawRooms = Array.isArray(roomRes.value?.data?.rooms)
          ? roomRes.value.data.rooms
          : Array.isArray(roomRes.value?.data)
            ? roomRes.value.data
            : Array.isArray(roomRes.value?.rooms)
              ? roomRes.value.rooms
              : (Array.isArray(roomRes.value) ? roomRes.value : null);

        if (rawRooms !== null) {
          setRoomInventory(rawRooms);
          setHkRooms(rawRooms);
        }
      }

      // 3. Authoritative Invoices
      if (invRes.status === 'fulfilled') {
        const rawInvs = Array.isArray(invRes.value?.data?.invoices)
          ? invRes.value.data.invoices
          : Array.isArray(invRes.value?.data)
            ? invRes.value.data
            : Array.isArray(invRes.value?.invoices)
              ? invRes.value.invoices
              : (Array.isArray(invRes.value) ? invRes.value : null);

        if (rawInvs !== null) {
          const adapted = toFrontendInvoiceList(rawInvs);
          setInvoices(adapted);
          saveInvoices(adapted);
        }
      }

      // 4. Authoritative Payments
      if (payRes.status === 'fulfilled') {
        const rawPays = Array.isArray(payRes.value?.data?.payments)
          ? payRes.value.data.payments
          : Array.isArray(payRes.value?.data)
            ? payRes.value.data
            : Array.isArray(payRes.value?.payments)
              ? payRes.value.payments
              : (Array.isArray(payRes.value) ? payRes.value : null);

        if (rawPays !== null) {
          const adapted = toFrontendPaymentList(rawPays);
          setPayments(adapted);
          savePayments(adapted);
        }
      }
    } catch (err) {
      console.warn('[Dashboard] Data sync error:', err);
      setError(err?.message || 'Failed to sync dashboard data with server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Synchronize state when compatibility/domain events fire
  useEffect(() => {
    const syncRoomData = () => {
      setRoomInventory(getRoomInventory());
      setHkRooms(getRoomInventory());
    };
    window.addEventListener(ROOM_UPDATED_EVENT, syncRoomData);
    window.addEventListener('storage', syncRoomData);
    return () => {
      window.removeEventListener(ROOM_UPDATED_EVENT, syncRoomData);
      window.removeEventListener('storage', syncRoomData);
    };
  }, []);

  useEffect(() => {
    const syncRes = () => {
      setReservations(getReservations());
    };
    window.addEventListener('storage', syncRes);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, syncRes);
    window.addEventListener(INVOICES_UPDATED_EVENT, syncRes);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, syncRes);
    window.addEventListener(REFUNDS_UPDATED_EVENT, syncRes);
    return () => {
      window.removeEventListener('storage', syncRes);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, syncRes);
      window.removeEventListener(INVOICES_UPDATED_EVENT, syncRes);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, syncRes);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, syncRes);
    };
  }, []);

  return (
    <div className="animate-fade-in pt-1 pb-4 space-y-3">
      {/* 6 TOP METRIC CARDS */}
      <DashboardMetrics
        reservations={reservations}
        roomInventory={roomInventory}
      />

      {/* SECOND ROW CARDS / ROOM STATUS */}
      <DashboardRoomStatus
        roomInventory={roomInventory}
        hkRooms={hkRooms}
      />

      {/* CURRENT BOOKINGS TABLE */}
      <CurrentBookingsTable
        title="Current Booking"
        showDateFilter={true}
        onMutationSuccess={fetchDashboardData}
      />

      {/* STAFF ATTENDANCE AND QUICK OPERATIONS ROW */}
      <DashboardStaffAttendance />
    </div>
  );
}

