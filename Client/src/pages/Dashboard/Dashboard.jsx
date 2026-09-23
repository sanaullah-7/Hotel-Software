import React, { useState, useEffect } from 'react';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../features/reservations/state/reservationStore';
import { getRooms } from '../../features/housekeeping/pages/hkStore';
import { getRooms as getRoomInventory, ROOM_UPDATED_EVENT } from '../../features/rooms/state/roomStore';

import DashboardMetrics from './components/DashboardMetrics';
import DashboardRoomStatus from './components/DashboardRoomStatus';
import CurrentBookingsTable from './components/CurrentBookingsTable';
import DashboardStaffAttendance from './components/DashboardStaffAttendance';
import InventoryPopover, { InventoryCell } from './components/InventoryPopover';

export { InventoryPopover, InventoryCell };

export default function Dashboard() {
  const [hkRooms, setHkRooms] = useState(getRooms());
  const [roomInventory, setRoomInventory] = useState(getRoomInventory());
  const [reservations, setReservations] = useState(getReservations());

  useEffect(() => {
    const syncData = () => setHkRooms(getRooms());
    window.addEventListener('storage', syncData);
    window.addEventListener('hk_update', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('hk_update', syncData);
    };
  }, []);

  useEffect(() => {
    const syncRoomInventory = () => setRoomInventory(getRoomInventory());
    window.addEventListener(ROOM_UPDATED_EVENT, syncRoomInventory);
    window.addEventListener('storage', syncRoomInventory);
    return () => {
      window.removeEventListener(ROOM_UPDATED_EVENT, syncRoomInventory);
      window.removeEventListener('storage', syncRoomInventory);
    };
  }, []);

  useEffect(() => {
    const syncReservations = () => setReservations(getReservations());
    window.addEventListener('storage', syncReservations);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
    return () => {
      window.removeEventListener('storage', syncReservations);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
    };
  }, []);

  return (
    <div className="animate-fade-in pb-8 space-y-4">
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
      />

      {/* STAFF ATTENDANCE AND QUICK OPERATIONS ROW */}
      <DashboardStaffAttendance />
    </div>
  );
}
