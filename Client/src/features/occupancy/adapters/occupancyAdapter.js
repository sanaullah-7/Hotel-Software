/**
 * Bidirectional Occupancy Data Adapter
 * Translates between Backend Rooms + Stays + Reservations contracts and Frontend Occupancy UI models.
 */

export const OCCUPANCY_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  CLEANING: 'CLEANING',
  MAINTENANCE: 'MAINTENANCE',
  OUT_OF_ORDER: 'OUT OF ORDER',
  RESERVED: 'RESERVED',
  BOOKED: 'BOOKED',
};

export const STATUS_COLORS = {
  AVAILABLE: '#1b7f43',
  OCCUPIED: '#ef4444',
  CLEANING: '#3b82f6',
  RESERVED: '#f97316',
  BOOKED: '#f59e0b',
  MAINTENANCE: '#8b5cf6',
  'OUT OF ORDER': '#6b7280',
};

export const HK_COLORS = {
  Clean: '#1b7f43',
  Dirty: '#ef4444',
  Inspected: '#3b82f6',
  'Out of Order': '#6b7280',
};

export const UI_HK_MAP = {
  CLEAN: 'Clean',
  DIRTY: 'Dirty',
  INSPECTED: 'Inspected',
  OUT_OF_ORDER: 'Out of Order',
};

/**
 * Safely format date input to YYYY-MM-DD
 */
export function formatDateToYMD(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalizes an array envelope response (supports raw array, { rooms: [...] }, { stays: [...] }, { data: [...] })
 */
function extractArray(envelope, key) {
  if (!envelope) return [];
  if (Array.isArray(envelope)) return envelope;
  if (key && Array.isArray(envelope[key])) return envelope[key];
  if (Array.isArray(envelope.data)) return envelope.data;
  if (envelope.data && typeof envelope.data === 'object' && key && Array.isArray(envelope.data[key])) {
    return envelope.data[key];
  }
  return [];
}

/**
 * Transforms backend Rooms, Stays, and Reservations into authoritative Occupancy UI view models.
 * Preserves canonical MongoDB ObjectIds and NEVER invents synthetic IDs.
 *
 * @param {Array|Object} roomsInput - Backend rooms response
 * @param {Array|Object} staysInput - Backend stays response
 * @param {Array|Object} reservationsInput - Backend reservations response
 * @returns {Array} Array of occupancy room view models
 */
export function toFrontendOccupancyRooms(roomsInput, staysInput = [], reservationsInput = []) {
  const rooms = extractArray(roomsInput, 'rooms');
  if (rooms.length === 0) {
    return [];
  }

  const stays = extractArray(staysInput, 'stays');
  const reservations = extractArray(reservationsInput, 'reservations');

  // Index active stays (CHECKED_IN) by room id and room number
  const activeStays = stays.filter((s) => (s.status || 'CHECKED_IN').toUpperCase() === 'CHECKED_IN');
  const stayByRoomId = new Map();
  const stayByRoomNo = new Map();
  const stayByResId = new Map();

  activeStays.forEach((stay) => {
    const resId = stay.reservation_id?._id || stay.reservation_id?.id || (typeof stay.reservation_id === 'string' ? stay.reservation_id : '');
    if (resId) {
      stayByResId.set(String(resId), stay);
    }

    const roomItems = Array.isArray(stay.rooms) && stay.rooms.length > 0
      ? stay.rooms
      : (stay.stayRoom ? [stay.stayRoom] : (stay.stayRooms ? stay.stayRooms : []));

    roomItems.forEach((item) => {
      const rId = item.room_id?._id || item.room_id?.id || (typeof item.room_id === 'string' ? item.room_id : item.roomId);
      const rNo = item.room_id?.room_number || item.room_id?.roomNo || item.roomNo || item.roomNumber;
      if (rId) stayByRoomId.set(String(rId), stay);
      if (rNo) stayByRoomNo.set(String(rNo).trim(), stay);
    });

    if (stay.room_id) {
      const rId = typeof stay.room_id === 'object' ? stay.room_id._id : stay.room_id;
      if (rId) stayByRoomId.set(String(rId), stay);
    }
  });

  // Index active/confirmed reservations (CONFIRMED, PENDING, IN_HOUSE, BOOKED) by room
  const activeReservations = reservations.filter((r) =>
    ['CONFIRMED', 'PENDING', 'IN_HOUSE', 'BOOKED', 'RESERVED'].includes((r.status || '').toUpperCase())
  );
  const resByRoomId = new Map();
  const resByRoomNo = new Map();

  activeReservations.forEach((res) => {
    const resId = String(res._id || res.id || '');
    if (Array.isArray(res.rooms) && res.rooms.length > 0) {
      res.rooms.forEach((item) => {
        const rId = item.room_id?._id || item.room_id?.id || (typeof item.room_id === 'string' ? item.room_id : item.roomId);
        const rNo = item.room_id?.room_number || item.room_id?.roomNo || item.roomNo;
        if (rId && !resByRoomId.has(String(rId))) resByRoomId.set(String(rId), res);
        if (rNo && !resByRoomNo.has(String(rNo).trim())) resByRoomNo.set(String(rNo).trim(), res);
      });
    }
    if (res.room_id) {
      const rId = typeof res.room_id === 'object' ? res.room_id._id : res.room_id;
      if (rId && !resByRoomId.has(String(rId))) resByRoomId.set(String(rId), res);
    }
    if (res.roomId && !resByRoomId.has(String(res.roomId))) {
      resByRoomId.set(String(res.roomId), res);
    }
    if (res.roomNo && !resByRoomNo.has(String(res.roomNo).trim())) {
      resByRoomNo.set(String(res.roomNo).trim(), res);
    }
  });

  return rooms.map((room) => {
    const roomId = String(room._id || room.id || room.roomId || '');
    const roomNoStr = String(room.room_number || room.roomNo || room.number || '').trim();
    const roomNumberVal = Number(roomNoStr) || roomNoStr;

    const roomTypeObj = typeof room.room_type_id === 'object' && room.room_type_id !== null ? room.room_type_id : null;
    const roomTypeName = roomTypeObj?.name || roomTypeObj?.code || room.roomType || room.type || 'Standard';
    const floor = Number(room.floor) || (room.floor ? parseInt(room.floor) : 1) || 1;
    const price = Number(roomTypeObj?.base_price ?? room.price ?? room.rent ?? 0);
    const maxOccupancy = Number(roomTypeObj?.max_occupancy ?? room.maxOccupancy ?? 4);
    const baseOccupancy = Number(roomTypeObj?.base_occupancy ?? room.adults ?? 2);

    // Bed inference
    let bed = room.bed || room.bedType || '';
    if (!bed) {
      const typeLower = roomTypeName.toLowerCase();
      if (typeLower.includes('suite') || typeLower.includes('super deluxe') || typeLower.includes('executive')) {
        bed = 'King Bed';
      } else if (typeLower.includes('deluxe') || typeLower.includes('double')) {
        bed = 'Queen Bed';
      } else if (typeLower.includes('single')) {
        bed = 'Single Bed';
      } else {
        bed = 'Double Bed';
      }
    }

    // Amenities
    const amenities = Array.isArray(room.amenities) && room.amenities.length > 0
      ? room.amenities
      : (Array.isArray(roomTypeObj?.amenities) && roomTypeObj.amenities.length > 0
        ? roomTypeObj.amenities.map(a => typeof a === 'object' && a.amenity_id?.name ? a.amenity_id.name.toLowerCase() : (a.name || 'wifi'))
        : ['wifi', 'ac', 'bar']);

    // Housekeeping status
    const rawHk = (room.housekeeping_status || room.housekeeping || 'CLEAN').toUpperCase();
    const hkText = UI_HK_MAP[rawHk] || (rawHk === 'DIRTY' ? 'Dirty' : (rawHk === 'INSPECTED' ? 'Inspected' : 'Clean'));
    const hkColor = HK_COLORS[hkText] || '#1b7f43';

    // Find linked stay or reservation
    let matchingStay = stayByRoomId.get(roomId) || stayByRoomNo.get(roomNoStr) || null;
    let matchingRes = resByRoomId.get(roomId) || resByRoomNo.get(roomNoStr) || null;

    if (!matchingStay && matchingRes) {
      const resId = String(matchingRes._id || matchingRes.id || '');
      if (stayByResId.has(resId)) {
        matchingStay = stayByResId.get(resId);
      }
    }

    // Determine room status and guest info
    const rawRoomStatus = (room.status || 'AVAILABLE').toUpperCase();
    let status = 'AVAILABLE';
    let guest = null;
    let stayId = '';
    let reservationId = '';
    let bookingId = '';
    let note = room.note || '';

    if (matchingStay) {
      status = 'OCCUPIED';
      stayId = String(matchingStay._id || matchingStay.id || matchingStay.stayId || '');
      const stayRes = matchingStay.reservation_id && typeof matchingStay.reservation_id === 'object'
        ? matchingStay.reservation_id
        : (matchingRes || null);
      reservationId = stayRes ? String(stayRes._id || stayRes.id || '') : (typeof matchingStay.reservation_id === 'string' ? matchingStay.reservation_id : '');
      bookingId = stayRes?.booking_ref || stayRes?.bookingRef || matchingStay.stay_ref || reservationId;

      const gObj = matchingStay.primary_guest_id && typeof matchingStay.primary_guest_id === 'object'
        ? matchingStay.primary_guest_id
        : (matchingStay.guest && typeof matchingStay.guest === 'object' ? matchingStay.guest : (stayRes?.primary_guest_id || null));

      const firstName = String(gObj?.first_name || gObj?.firstName || '').trim();
      const lastName = String(gObj?.last_name || gObj?.lastName || '').trim();
      const cleanLastName = (lastName === '.' || lastName === '—' || lastName === '-') ? '' : lastName;
      let fullName = [firstName, cleanLastName].filter(Boolean).join(' ').trim();
      if (!fullName) {
        fullName = gObj?.name ? String(gObj.name).trim() : (matchingStay.name || 'Guest');
      }

      const checkInFormatted = formatDateToYMD(matchingStay.actual_check_in || stayRes?.expected_check_in || stayRes?.check_in);
      const checkOutFormatted = formatDateToYMD(matchingStay.actual_check_out || stayRes?.expected_check_out || stayRes?.check_out);

      guest = {
        name: fullName,
        vip: Boolean(gObj?.vip || String(matchingStay.notes || '').toLowerCase().includes('vip')),
        id: String(gObj?.passport_number || gObj?.guest_ref || gObj?.idNumber || gObj?._id || ''),
        guestId: String(gObj?._id || gObj?.id || ''),
        email: gObj?.email || '',
        phone: gObj?.phone || gObj?.mobile || '',
        address: gObj?.address || '',
        nationality: gObj?.nationality || 'American',
        checkIn: checkInFormatted,
        checkOut: checkOutFormatted,
        bookingRef: bookingId,
        bookingId,
        stayId,
        bookingSource: stayRes?.booking_source || 'direct',
        paymentStatus: stayRes?.payment_status || 'paid',
        totalAmount: stayRes?.total_amount || (price ? price * 7 : 2240),
        specialRequests: matchingStay.notes || stayRes?.special_requests || '',
        loyaltyPoints: gObj?.loyalty_points || (gObj?.vip ? 1250 : 150),
      };

      note = matchingStay.notes || room.note || '';
    } else if (rawRoomStatus === 'OCCUPIED') {
      status = 'OCCUPIED';
      if (room.guest) {
        guest = { ...room.guest };
      }
    } else if (rawRoomStatus === 'CLEANING') {
      status = 'CLEANING';
    } else if (rawRoomStatus === 'MAINTENANCE') {
      status = 'MAINTENANCE';
    } else if (rawRoomStatus === 'OUT_OF_ORDER' || rawRoomStatus === 'OUT OF ORDER') {
      status = 'OUT OF ORDER';
    } else if (matchingRes && ['CONFIRMED', 'BOOKED', 'RESERVED'].includes((matchingRes.status || '').toUpperCase())) {
      status = 'RESERVED';
      reservationId = String(matchingRes._id || matchingRes.id || '');
      bookingId = matchingRes.booking_ref || matchingRes.bookingRef || reservationId;

      const gObj = typeof matchingRes.primary_guest_id === 'object' && matchingRes.primary_guest_id !== null
        ? matchingRes.primary_guest_id
        : null;
      const firstName = String(gObj?.first_name || gObj?.firstName || '').trim();
      const lastName = String(gObj?.last_name || gObj?.lastName || '').trim();
      const cleanLastName = (lastName === '.' || lastName === '—' || lastName === '-') ? '' : lastName;
      let fullName = [firstName, cleanLastName].filter(Boolean).join(' ').trim();
      if (!fullName) fullName = gObj?.name ? String(gObj.name).trim() : 'Reserved Guest';

      guest = {
        name: fullName,
        vip: Boolean(gObj?.vip),
        id: String(gObj?.passport_number || gObj?.guest_ref || gObj?._id || ''),
        guestId: String(gObj?._id || gObj?.id || ''),
        email: gObj?.email || '',
        phone: gObj?.phone || '',
        address: gObj?.address || '',
        nationality: gObj?.nationality || 'American',
        checkIn: formatDateToYMD(matchingRes.expected_check_in),
        checkOut: formatDateToYMD(matchingRes.expected_check_out),
        bookingRef: bookingId,
        bookingId,
        stayId: '',
        bookingSource: matchingRes.booking_source || 'direct',
        paymentStatus: matchingRes.payment_status || 'pending',
        totalAmount: matchingRes.total_amount || (price ? price * 7 : 2100),
        specialRequests: matchingRes.special_requests || '',
        loyaltyPoints: gObj?.loyalty_points || 150,
      };
    } else {
      status = 'AVAILABLE';
    }

    const statusColor = STATUS_COLORS[status] || '#1b7f43';

    return {
      id: roomId,
      _id: roomId,
      roomId,
      number: roomNumberVal,
      roomNo: roomNoStr,
      type: roomTypeName,
      floor,
      bed,
      adults: baseOccupancy,
      children: 0,
      maxOccupancy,
      price,
      status,
      statusColor,
      housekeeping: hkText,
      housekeepingColor: hkColor,
      amenities,
      guest,
      stayId,
      reservationId,
      bookingId,
      note,
      rawRoom: room,
      rawStay: matchingStay,
      rawReservation: matchingRes,
    };
  });
}

/**
 * Computes summary statistics from authoritative occupancy view models.
 * @param {Array} occupancyRooms - Frontend occupancy models
 * @returns {Object} Summary counts and rate
 */
export function toFrontendOccupancySummary(occupancyRooms = []) {
  const total = occupancyRooms.length;
  const available = occupancyRooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupied = occupancyRooms.filter((r) => r.status === 'OCCUPIED').length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return {
    totalRooms: total,
    availableRooms: available,
    occupiedRooms: occupied,
    occupancyRate,
  };
}
