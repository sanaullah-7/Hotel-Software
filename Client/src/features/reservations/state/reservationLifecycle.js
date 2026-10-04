import { getGuestById } from '../../guests/state/guestStore.js';
import { getRoomById, getRoomByRoomNo, getRooms, ROOM_UPDATED_EVENT } from '../../rooms/state/roomStore.js';
import { getReservations, migrateBookingRelationships, RESERVATIONS_UPDATED_EVENT } from './reservationStore.js';
import {
  hasBookingDateOverlap,
  isCheckedIn,
  isEligibleForCheckIn,
  isRoomBlockingBooking,
  normalizeBookingStatus,
  parseStayDate,
  resolveBookingReference,
  validateStayDates,
} from './bookingRules.js';
import { getInvoices, getOrCreateBookingInvoice, reconcileBookingChargesToInvoice } from '../../payment-billing/pages/paymentBillingStore.js';

const OCCUPANCY_KEY = 'hotel_rooms';
export const OCCUPANCY_UPDATED_EVENT = 'occupancy_update';

function readOccupancyRooms() {
  try {
    const raw = localStorage.getItem(OCCUPANCY_KEY);
    if (raw === null) return [];
    const rooms = JSON.parse(raw);
    return Array.isArray(rooms) ? rooms : [];
  } catch {
    return [];
  }
}

function roomNumber(room) {
  return String(room?.roomNo ?? room?.number ?? room?.room ?? '').trim();
}

function occupancyRoomMatches(occupancyRoom, room) {
  if (occupancyRoom.roomId !== undefined && occupancyRoom.roomId !== null && occupancyRoom.roomId !== '') {
    return String(occupancyRoom.roomId) === String(room.id);
  }
  const byNumber = roomNumber(occupancyRoom);
  return Boolean(byNumber && byNumber === roomNumber(room) && getRoomByRoomNo(byNumber)?.id === room.id);
}

function isOperationalOccupancyBlock(occupancy) {
  const status = String(occupancy.status || '').trim().toUpperCase();
  return ['OCCUPIED', 'BOOKED', 'RESERVED', 'CLEANING', 'MAINTENANCE', 'OUT OF ORDER'].includes(status);
}

export function getRoomAvailability(room, checkIn, checkOut, bookings = getReservations(), excludeBookingId) {
  if (!room || room.id === undefined || room.id === null) return { available: false, reason: 'Room is not a canonical inventory room.' };
  const inventoryStatus = String(room.status || '').trim().toLowerCase();
  if (['inactive', 'maintenance', 'out of order'].includes(inventoryStatus)) {
    return { available: false, reason: `Room ${roomNumber(room)} is currently under maintenance or inactive.` };
  }
  if (!['open', 'booked', 'available'].includes(inventoryStatus)) {
    return { available: false, reason: `Room ${roomNumber(room)} is not operationally available.` };
  }

  if (checkIn && checkOut) {
    try { 
      validateStayDates(checkIn, checkOut); 
    } catch (error) { 
      return { available: false, reason: error.message }; 
    }
    const hasBookingConflict = bookings.some((booking) =>
      String(booking.id) !== String(excludeBookingId ?? '') &&
      String(booking.roomId ?? '') === String(room.id) &&
      isRoomBlockingBooking(booking) &&
      hasBookingDateOverlap(booking, checkIn, checkOut)
    );
    if (hasBookingConflict) return { available: false, reason: `Room ${roomNumber(room)} is booked for overlapping dates.` };
  } else {
    const hasBookingConflict = bookings.some((booking) =>
      String(booking.id) !== String(excludeBookingId ?? '') &&
      String(booking.roomId ?? '') === String(room.id) &&
      isRoomBlockingBooking(booking)
    );
    if (inventoryStatus === 'booked' && hasBookingConflict) {
      return { available: false, reason: `Room ${roomNumber(room)} is currently booked.` };
    }
  }

  const occupancyList = readOccupancyRooms();
  const occupancyConflict = occupancyList.some((occupancy) => {
    if (!occupancyRoomMatches(occupancy, room)) return false;
    const occStatus = String(occupancy.status || '').trim().toUpperCase();
    if (['MAINTENANCE', 'OUT OF ORDER', 'INACTIVE'].includes(occStatus)) return true;
    if (['CLEANING', 'DIRTY'].includes(occStatus)) {
      if (excludeBookingId) {
        return Boolean(occupancy.bookingId && String(occupancy.bookingId) !== String(excludeBookingId));
      }
      return true;
    }
    if (['OCCUPIED', 'BOOKED', 'RESERVED'].includes(occStatus)) {
      return String(occupancy.bookingId || '') !== String(excludeBookingId ?? '');
    }
    return false;
  });
  if (occupancyConflict) return { available: false, reason: `Room ${roomNumber(room)} has an active operational hold.` };
  return { available: true, reason: '' };
}

export function getAvailableRooms(checkIn, checkOut, excludeBookingId) {
  return getRooms().filter((room) => getRoomAvailability(room, checkIn, checkOut, getReservations(), excludeBookingId).available);
}

export function validateBookingRequest({ roomId, roomNo, checkIn, checkOut, bookings = getReservations(), excludeBookingId }) {
  validateStayDates(checkIn, checkOut);
  let room = null;
  if (roomId !== undefined && roomId !== null && roomId !== '') {
    room = getRoomById(roomId);
    if (!room) throw new Error('The selected room is not in canonical room inventory.');
  } else if (roomNo !== undefined && roomNo !== null && String(roomNo).trim()) {
    room = getRoomByRoomNo(roomNo);
    if (!room) throw new Error(`Room ${roomNo} does not identify exactly one canonical room.`);
  }
  if (room) {
    const result = getRoomAvailability(room, checkIn, checkOut, bookings, excludeBookingId);
    if (!result.available) throw new Error(result.reason);
  }
  return room;
}

function findOccupancySlots(records, room) {
  const exactId = records.filter((record) =>
    record.roomId !== undefined && record.roomId !== null && record.roomId !== '' && String(record.roomId) === String(room.id)
  );
  if (exactId.length) return exactId;
  const number = roomNumber(room);
  const exactNumber = records.filter((record) =>
    (record.roomId === undefined || record.roomId === null || record.roomId === '') && roomNumber(record) === number
  );
  return exactNumber.length === 1 && String(getRoomByRoomNo(number)?.id) === String(room.id) ? exactNumber : exactNumber;
}

function makeOccupancyRoom(room, booking, current = {}) {
  const guest = booking.guestId ? getGuestById(booking.guestId) : null;
  return {
    ...current,
    number: current.number ?? (Number(room.roomNo) || room.roomNo),
    roomId: room.id,
    type: current.type || room.roomType || 'Standard',
    status: 'OCCUPIED',
    statusColor: '#ef4444',
    guestId: booking.guestId || '',
    bookingId: booking.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guest: {
      ...(current.guest || {}),
      guestId: booking.guestId || '',
      name: guest?.name || booking.name || booking.guestName || 'Guest',
      email: guest?.email || booking.email || booking.guestEmail || '',
      phone: guest?.phone || booking.mobile || '',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      bookingRef: String(booking.id),
    },
  };
}

function commitLifecycleState({ bookings, rooms, occupancyRooms }) {
  const keys = ['hotel_reservations', 'hotel_room_inventory_v1', OCCUPANCY_KEY];
  const previous = keys.map((key) => localStorage.getItem(key));
  try {
    if (bookings) {
      const migrated = migrateBookingRelationships(bookings).bookings;
      localStorage.setItem(keys[0], JSON.stringify(migrated));
    }
    if (rooms) localStorage.setItem(keys[1], JSON.stringify(rooms));
    if (occupancyRooms) localStorage.setItem(keys[2], JSON.stringify(occupancyRooms));
  } catch (error) {
    keys.forEach((key, index) => {
      if (previous[index] === null) localStorage.removeItem(key);
      else localStorage.setItem(key, previous[index]);
    });
    throw error;
  }
  if (bookings) window.dispatchEvent(new Event(RESERVATIONS_UPDATED_EVENT));
  if (rooms) window.dispatchEvent(new Event(ROOM_UPDATED_EVENT));
  if (occupancyRooms) window.dispatchEvent(new Event(OCCUPANCY_UPDATED_EVENT));
}

function roomOperationalStatus(room, bookings, occupancy) {
  if (String(room.status || '').toLowerCase() === 'inactive') return room.status;
  const hasBlockingBooking = bookings.some((booking) => String(booking.roomId || '') === String(room.id) && isRoomBlockingBooking(booking));
  const hasActiveOccupancy = occupancy.some((record) => occupancyRoomMatches(record, room) && isOperationalOccupancyBlock(record));
  return hasBlockingBooking || hasActiveOccupancy ? 'Booked' : 'Open';
}

export function saveBookingsWithRoomState(bookings, roomIds = []) {
  const rooms = getRooms();
  const occupancy = readOccupancyRooms();
  const changedRooms = rooms.map((room) => {
    if (!roomIds.some((id) => String(id) === String(room.id))) return room;
    if (String(room.status || '').toLowerCase() === 'inactive') return room;
    const status = roomOperationalStatus(room, bookings, occupancy);
    return room.status === status ? room : { ...room, status };
  });

  const baseOccupancy = occupancy.length ? [...occupancy] : rooms.map((r) => ({
    number: Number(r.roomNo) || r.roomNo,
    roomId: r.id,
    type: r.roomType,
    status: r.status === 'Booked' ? 'BOOKED' : (r.status === 'Inactive' ? 'INACTIVE' : 'AVAILABLE'),
    statusColor: r.status === 'Booked' ? '#f59e0b' : '#1b7f43'
  }));

  const updatedOccupancy = baseOccupancy.map((record) => {
    const canonicalRoom = rooms.find((r) => occupancyRoomMatches(record, r));
    if (!canonicalRoom) return record;
    const matchingBooking = bookings.find((b) =>
      String(b.roomId || '') === String(canonicalRoom.id) && isRoomBlockingBooking(b)
    );
    if (matchingBooking) {
      return {
        ...record,
        roomId: canonicalRoom.id,
        bookingId: matchingBooking.id,
        status: matchingBooking.status === 'Checked In' ? 'OCCUPIED' : 'BOOKED',
        statusColor: matchingBooking.status === 'Checked In' ? '#ef4444' : '#f59e0b',
        guest: {
          ...(record.guest || {}),
          name: matchingBooking.name,
          checkIn: matchingBooking.checkIn,
          checkOut: matchingBooking.checkOut
        }
      };
    }
    return record;
  });

  commitLifecycleState({ bookings, rooms: changedRooms, occupancyRooms: updatedOccupancy.length ? updatedOccupancy : undefined });
  return bookings;
}

export function checkInBooking(bookingId) {
  const bookings = getReservations();
  const matches = bookings.filter((booking) => String(booking.id) === String(bookingId));
  if (matches.length !== 1) throw new Error('The canonical booking could not be uniquely resolved.');
  const booking = matches[0];
  if (!isEligibleForCheckIn(booking)) throw new Error(`Booking cannot be checked in from status ${booking.status || 'Unknown'}.`);
  if (!booking.id || !booking.roomId) throw new Error('This booking is missing its canonical booking or room ID.');
  const room = getRoomById(booking.roomId);
  if (!room) throw new Error('The booking room no longer exists in canonical room inventory.');
  validateStayDates(booking.checkIn, booking.checkOut);
  const availability = getRoomAvailability(room, booking.checkIn, booking.checkOut, bookings, booking.id);
  if (!availability.available) throw new Error(availability.reason);

  const occupancy = readOccupancyRooms();
  const slots = findOccupancySlots(occupancy, room);
  if (slots.length > 1) throw new Error(`Room ${roomNumber(room)} has multiple occupancy records.`);
  const current = slots[0];
  if (current?.bookingId && String(current.bookingId) !== String(booking.id) && isOperationalOccupancyBlock(current)) {
    throw new Error(`Room ${roomNumber(room)} is linked to another active occupancy.`);
  }
  const nextOccupancy = current
    ? occupancy.map((record) => record === current ? makeOccupancyRoom(room, booking, current) : record)
    : [...occupancy, makeOccupancyRoom(room, booking)];
  const nextBookings = bookings.map((item) => String(item.id) === String(booking.id) ? { ...item, status: 'Checked In' } : item);
  const nextRooms = getRooms().map((item) => String(item.id) === String(room.id) ? { ...item, status: 'Booked' } : item);
  commitLifecycleState({ bookings: nextBookings, rooms: nextRooms, occupancyRooms: nextOccupancy });

  let invoiceResult;
  try {
    invoiceResult = getOrCreateBookingInvoice(booking.id);
  } catch (err) {
    invoiceResult = { success: false, reason: err?.message || 'Failed to initialize stay invoice for checked-in booking.' };
  }

  if (!invoiceResult || !invoiceResult.success) {
    // Phase 7 Job 22 Consistency Fix:
    // Operational check-in state was committed before invoice initialization failed.
    // Restore pre-check-in operational state ONLY for what this check-in operation modified.
    const currentBookings = getReservations();
    const currentRooms = getRooms();
    const currentOccupancy = readOccupancyRooms();

    const revertedBookings = currentBookings.map((item) =>
      String(item.id) === String(booking.id) ? { ...item, status: booking.status } : item
    );

    const revertedRooms = currentRooms.map((item) =>
      String(item.id) === String(room.id) ? { ...item, status: room.status } : item
    );

    let revertedOccupancy;
    if (current) {
      revertedOccupancy = currentOccupancy.map((record) =>
        (String(record.bookingId || '') === String(booking.id) && String(record.roomId ?? '') === String(room.id)) ||
        record === current ||
        slots.some((s) => s === record || (s.roomId && String(s.roomId) === String(record.roomId)))
          ? current
          : record
      );
    } else {
      revertedOccupancy = currentOccupancy.filter((record) =>
        !(String(record.bookingId || '') === String(booking.id) && String(record.roomId ?? '') === String(room.id))
      );
    }

    commitLifecycleState({
      bookings: revertedBookings,
      rooms: revertedRooms,
      occupancyRooms: revertedOccupancy
    });

    throw new Error(invoiceResult?.reason || 'Failed to initialize stay invoice for checked-in booking.');
  }

  const updatedBooking = nextBookings.find((item) => String(item.id) === String(booking.id));
  return {
    ...updatedBooking,
    invoice: invoiceResult.invoice || invoiceResult
  };
}

export function checkOutBooking(bookingId) {
  const bookings = getReservations();
  const matches = bookings.filter((booking) => String(booking.id) === String(bookingId));
  if (matches.length !== 1 || !isCheckedIn(matches[0])) throw new Error('Only a checked-in canonical booking can be checked out.');
  const booking = matches[0];
  const room = getRoomById(booking.roomId);
  if (!room) throw new Error('The checked-in booking has no valid canonical room.');

  const occupancy = readOccupancyRooms();
  const active = occupancy.filter((record) => String(record.bookingId || '') === String(booking.id) && String(record.roomId ?? '') === String(room.id));
  if (active.length !== 1 || !isOperationalOccupancyBlock(active[0])) {
    throw new Error('The checked-in booking does not have exactly one active linked occupancy record.');
  }

  // Ensure an invoice exists if somehow missing for this checked-in booking (e.g. legacy test fixture)
  const invoices = getInvoices();
  const linkedInvoices = invoices.filter((inv) => String(inv.bookingId) === String(booking.id));
  if (linkedInvoices.length === 0) {
    const invResult = getOrCreateBookingInvoice(booking.id);
    if (!invResult || !invResult.success) {
      throw new Error(invResult?.reason || 'Failed to initialize invoice before checkout reconciliation.');
    }
  }

  // Phase 7 Job 22: Reconcile eligible folio charges into booking invoice before checkout processing
  const reconResult = reconcileBookingChargesToInvoice(booking.id);
  if (!reconResult || !reconResult.success) {
    throw new Error(reconResult?.reason || 'Failed to reconcile folio charges for booking before checkout.');
  }

  const nextOccupancy = occupancy.map((record) => active.includes(record)
    ? { ...record, status: 'AVAILABLE', statusColor: '#1b7f43', bookingId: '', guestId: '', checkIn: '', checkOut: '', guest: null }
    : record);
  const todayStr = new Date().toISOString().split('T')[0];
  const nextBookings = bookings.map((item) =>
    String(item.id) === String(booking.id)
      ? { ...item, status: 'Checked Out', checkedOutAt: todayStr, checkoutDate: todayStr }
      : item
  );
  const nextRooms = getRooms().map((item) => String(item.id) === String(room.id)
    ? { ...item, status: roomOperationalStatus(item, nextBookings, nextOccupancy) }
    : item);
  commitLifecycleState({ bookings: nextBookings, rooms: nextRooms, occupancyRooms: nextOccupancy });
  const updatedBooking = nextBookings.find((item) => String(item.id) === String(booking.id));
  return {
    ...updatedBooking,
    reconciliation: reconResult
  };
}

export function cancelBooking(bookingId, fallbackBookings) {
  const stored = getReservations();
  const bookings = stored.length ? stored : (fallbackBookings || stored);
  const matches = bookings.filter((booking) => String(booking.id) === String(bookingId));
  if (matches.length !== 1) throw new Error('The canonical booking could not be uniquely resolved.');
  const booking = matches[0];
  if (!['Booked', 'Pending'].includes(normalizeBookingStatus(booking.status))) {
    throw new Error(`Booking cannot be cancelled from status ${booking.status || 'Unknown'}.`);
  }
  const next = bookings.map((item) => String(item.id) === String(booking.id) ? { ...item, status: 'Cancelled' } : item);
  saveBookingsWithRoomState(next, booking.roomId ? [booking.roomId] : []);
  return next.find((item) => String(item.id) === String(booking.id));
}

export function buildFrontOfficeRows(bookings, legacyRows) {
  const legacy = legacyRows.filter((row) => !resolveBookingReference(row.bookingId || row.id, bookings))
    .map((row) => ({ ...row, isLegacyUnmapped: true }));
  const canonical = bookings.map((booking) => {
    const room = booking.roomId ? getRoomById(booking.roomId) : null;
    const guest = booking.guestId ? getGuestById(booking.guestId) : null;
    const status = normalizeBookingStatus(booking.status);
    return {
      ...booking,
      id: booking.id,
      canonicalBookingId: booking.id,
      bookingId: booking.bookingRef || booking.bookingId || String(booking.id),
      name: guest?.name || booking.name || booking.guestName || 'Guest',
      email: guest?.email || booking.email || booking.guestEmail || '',
      room: room?.roomNo || booking.roomNo || booking.roomNumber || booking.room || '',
      roomType: room?.roomType || booking.roomType || '',
      status,
      isLegacyUnmapped: false,
    };
  });
  return [...canonical, ...legacy];
}

export { parseStayDate };
