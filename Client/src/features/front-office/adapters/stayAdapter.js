/**
 * Bidirectional Stay & Front Office Data Adapter
 * Translates between Backend MongoDB Stay/Reservation contracts and Frontend Front Office UI models.
 */

export const BACKEND_STAY_STATUS = {
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
};

export const UI_STAY_STATUS_MAP = {
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  IN_HOUSE: 'Checked In',
  CONFIRMED: 'Booked',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'Cancelled',
};

export const BACKEND_STAY_STATUS_MAP = {
  'Checked In': 'CHECKED_IN',
  'checked in': 'CHECKED_IN',
  'In House': 'CHECKED_IN',
  'in house': 'CHECKED_IN',
  'Checked Out': 'CHECKED_OUT',
  'checked out': 'CHECKED_OUT',
};

/**
 * Safely format date input (Date object, ISO string, or timestamp) to YYYY-MM-DD
 * @param {string|Date|number} value
 * @returns {string} Formatted date string (YYYY-MM-DD) or empty string
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
 * Safely format time input to UTC HH:mm
 * @param {string|Date|number} value
 * @returns {string} Formatted time string (HH:mm) or empty string
 */
export function formatTimeToHHMM(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Transforms a backend MongoDB Stay document or API response into the Front Office view model.
 * Preserves canonical MongoDB _id references and never invents synthetic IDs.
 *
 * @param {Object} backendStay - Raw MongoDB Stay document or populated API response
 * @returns {Object|null} Front Office stay view model
 */
export function toFrontendStay(backendStay) {
  if (!backendStay || typeof backendStay !== 'object') {
    return null;
  }

  // Handle wrapped API responses like { stay: { ... } }
  const raw = backendStay.stay && typeof backendStay.stay === 'object'
    ? backendStay.stay
    : backendStay;

  const stayId = raw._id || raw.id || raw.stayId || '';
  const stayRef = raw.stay_ref || raw.stayRef || '';

  // 1. Status normalization
  const rawStatus = (raw.status || 'CHECKED_IN').toUpperCase();
  const uiStatus = UI_STAY_STATUS_MAP[rawStatus] || 'Checked In';

  // 2. Primary Guest relationship
  const guestObj = raw.primary_guest_id && typeof raw.primary_guest_id === 'object'
    ? raw.primary_guest_id
    : (raw.guestObj || (raw.guest && typeof raw.guest === 'object' ? raw.guest : null));

  const guestId = guestObj ? (guestObj._id || guestObj.id || '') : (typeof raw.primary_guest_id === 'string' ? raw.primary_guest_id : (raw.guestId || ''));
  const guestRef = guestObj?.guest_ref || guestObj?.guestRef || raw.guest_ref || raw.guestRef || '';

  const firstName = String(guestObj?.first_name || guestObj?.firstName || raw.firstName || '').trim();
  const lastName = String(guestObj?.last_name || guestObj?.lastName || raw.lastName || '').trim();
  const cleanLastName = (lastName === '.' || lastName === '—' || lastName === '-') ? '' : lastName;

  let fullName = [firstName, cleanLastName].filter(Boolean).join(' ').trim();
  if (!fullName) {
    fullName = guestObj?.name ? String(guestObj.name).trim() : (raw.name || raw.guestName || (firstName || 'Guest'));
  }

  const email = guestObj?.email || raw.email || raw.guestEmail || '';
  const phone = guestObj?.phone || guestObj?.mobile || raw.phone || raw.mobile || '';

  // 3. Reservation relationship
  const resObj = raw.reservation_id && typeof raw.reservation_id === 'object'
    ? raw.reservation_id
    : (raw.reservation && typeof raw.reservation === 'object' ? raw.reservation : null);

  const reservationId = resObj ? (resObj._id || resObj.id || '') : (typeof raw.reservation_id === 'string' ? raw.reservation_id : (raw.reservationId || ''));
  const bookingRef = resObj?.booking_ref || resObj?.bookingRef || raw.booking_ref || raw.bookingRef || (reservationId ? `RES-${String(reservationId).slice(-6).toUpperCase()}` : (stayRef || ''));

  // 4. Room relationship (from rooms array, stayRoom, or room property)
  let roomId = '';
  let roomNo = '—';
  let roomType = 'Standard';
  let roomFloor = '';
  let roomStatus = 'AVAILABLE';
  let housekeepingStatus = 'CLEAN';

  const roomItems = Array.isArray(raw.rooms) && raw.rooms.length > 0
    ? raw.rooms
    : (raw.stayRoom ? [raw.stayRoom] : (raw.stayRooms ? raw.stayRooms : []));

  if (roomItems.length > 0) {
    const primaryStayRoom = roomItems[0];
    const roomRefObj = primaryStayRoom.room_id && typeof primaryStayRoom.room_id === 'object'
      ? primaryStayRoom.room_id
      : (primaryStayRoom.room && typeof primaryStayRoom.room === 'object' ? primaryStayRoom.room : null);

    if (roomRefObj) {
      roomId = roomRefObj._id || roomRefObj.id || '';
      roomNo = roomRefObj.room_number || roomRefObj.roomNo || roomRefObj.number || '—';
      roomFloor = roomRefObj.floor || '';
      roomStatus = roomRefObj.status || 'AVAILABLE';
      housekeepingStatus = roomRefObj.housekeeping_status || 'CLEAN';

      if (roomRefObj.room_type_id && typeof roomRefObj.room_type_id === 'object') {
        roomType = roomRefObj.room_type_id.name || roomRefObj.room_type_id.code || 'Standard';
      } else if (roomRefObj.roomType) {
        roomType = roomRefObj.roomType;
      }
    } else if (primaryStayRoom.room_id) {
      roomId = typeof primaryStayRoom.room_id === 'string' ? primaryStayRoom.room_id : '';
    }
  } else if (raw.room && typeof raw.room === 'object') {
    roomId = raw.room._id || raw.room.id || '';
    roomNo = raw.room.room_number || raw.room.roomNo || raw.room.number || '—';
    roomFloor = raw.room.floor || '';
    roomStatus = raw.room.status || 'AVAILABLE';
    housekeepingStatus = raw.room.housekeeping_status || 'CLEAN';
  } else if (raw.roomNo || raw.roomNumber || raw.room) {
    roomNo = String(raw.roomNo || raw.roomNumber || raw.room);
    roomId = raw.roomId || raw.room_id || '';
    roomType = raw.roomType || 'Standard';
  }

  // 5. Dates handling
  const checkInDate = formatDateToYMD(raw.actual_check_in || resObj?.expected_check_in || raw.checkIn || raw.check_in);
  const checkOutDate = formatDateToYMD(raw.actual_check_out || resObj?.expected_check_out || raw.checkOut || raw.check_out);

  const checkInTime = formatTimeToHHMM(raw.actual_check_in);
  const checkOutTime = raw.actual_check_out ? formatTimeToHHMM(raw.actual_check_out) : '';

  const totalGuests = Number(raw.total_guests ?? resObj?.adults ?? 1);

  return {
    id: stayId || reservationId,
    _id: stayId || reservationId,
    stayId,
    stay_id: stayId,
    stayRef,
    stay_ref: stayRef,

    // Reservation IDs
    reservationId,
    reservation_id: reservationId,
    canonicalBookingId: reservationId,
    bookingId: bookingRef || stayRef || String(stayId || reservationId),
    bookingRef: bookingRef || stayRef || String(stayId || reservationId),

    // Guest IDs and Contact
    guestId,
    primary_guest_id: guestId,
    guestRef,
    guest_ref: guestRef,
    firstName,
    lastName,
    name: fullName,
    email,
    phone,
    mobile: phone,

    // Room Details
    roomId,
    room_id: roomId,
    roomNo: String(roomNo),
    roomNumber: String(roomNo),
    room: String(roomNo),
    roomType,
    roomFloor,
    roomStatus,
    housekeepingStatus,

    // Status
    status: uiStatus,
    rawStatus,

    // Dates & Times
    checkIn: checkInDate,
    checkOut: checkOutDate,
    actualCheckIn: raw.actual_check_in || null,
    actual_check_in: raw.actual_check_in || null,
    actualCheckOut: raw.actual_check_out || null,
    actual_check_out: raw.actual_check_out || null,
    checkInTime,
    checkOutTime,

    // Operational fields
    totalGuests,
    total_guests: totalGuests,
    guestCount: String(totalGuests),
    notes: raw.notes || resObj?.special_requests || '',
    isLegacyUnmapped: false,
    avatar: raw.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1b7f43&color=fff`,

    // Timestamps
    created_at: raw.created_at || raw.createdAt || '',
    updated_at: raw.updated_at || raw.updatedAt || '',

    raw,
  };
}

/**
 * Transforms an array or paginated response of backend Stay documents into frontend stay view models.
 * @param {Array|Object} staysResponse - Array of stays or { stays: [...] } response envelope
 * @returns {Array} Array of frontend stay view models
 */
export function toFrontendStayList(staysResponse) {
  if (!staysResponse) return [];

  const rawList = Array.isArray(staysResponse)
    ? staysResponse
    : (Array.isArray(staysResponse.stays)
      ? staysResponse.stays
      : (Array.isArray(staysResponse.data) ? staysResponse.data : []));

  return rawList
    .map((item) => toFrontendStay(item))
    .filter(Boolean);
}

/**
 * Unifies backend Stays and Reservations into a consolidated list for the Front Office operational view.
 * Stays represent in-house and checked-out records.
 * Non-stayed reservations represent upcoming/confirmed bookings awaiting check-in.
 *
 * @param {Array|Object} staysInput - Array or API envelope of stays
 * @param {Array|Object} reservationsInput - Array or API envelope of reservations
 * @returns {Array} Unified list of front office row objects
 */
export function toFrontendFrontOfficeRows(staysInput, reservationsInput) {
  const stays = toFrontendStayList(staysInput);

  const rawResList = Array.isArray(reservationsInput)
    ? reservationsInput
    : (Array.isArray(reservationsInput?.data?.reservations)
      ? reservationsInput.data.reservations
      : (Array.isArray(reservationsInput?.data)
        ? reservationsInput.data
        : (Array.isArray(reservationsInput?.reservations) ? reservationsInput.reservations : [])));

  // Track reservation IDs already covered by stays
  const coveredReservationIds = new Set();
  stays.forEach((stay) => {
    if (stay.reservationId) {
      coveredReservationIds.add(String(stay.reservationId));
    }
  });

  // Adapt reservations not yet in stays (e.g. Booked, Pending)
  const nonStayRows = [];
  rawResList.forEach((rawRes) => {
    const resId = String(rawRes._id || rawRes.id || '');
    if (!resId || coveredReservationIds.has(resId)) {
      return;
    }

    // Adapt reservation into front office view shape
    const guestObj = typeof rawRes.primary_guest_id === 'object' && rawRes.primary_guest_id !== null
      ? rawRes.primary_guest_id
      : null;
    const guestId = guestObj ? (guestObj._id || guestObj.id || '') : (typeof rawRes.primary_guest_id === 'string' ? rawRes.primary_guest_id : (rawRes.guestId || ''));
    const guestRef = guestObj?.guest_ref || guestObj?.guestRef || rawRes.guest_ref || rawRes.guestRef || '';

    const firstName = String(guestObj?.first_name || guestObj?.firstName || rawRes.firstName || '').trim();
    const lastName = String(guestObj?.last_name || guestObj?.lastName || rawRes.lastName || '').trim();
    const cleanLastName = (lastName === '.' || lastName === '—' || lastName === '-') ? '' : lastName;
    let fullName = [firstName, cleanLastName].filter(Boolean).join(' ').trim();
    if (!fullName) {
      fullName = guestObj?.name ? String(guestObj.name).trim() : (rawRes.name || rawRes.guestName || (firstName || 'Guest'));
    }

    const email = guestObj?.email || rawRes.email || rawRes.guestEmail || '';
    const phone = guestObj?.phone || guestObj?.mobile || rawRes.phone || rawRes.mobile || '';

    let roomId = rawRes.roomId || rawRes.room_id || '';
    let roomNo = rawRes.roomNo || rawRes.roomNumber || rawRes.room || '—';
    let roomType = 'Standard';
    let roomFloor = '';

    if (Array.isArray(rawRes.rooms) && rawRes.rooms.length > 0) {
      const firstRoom = rawRes.rooms[0];
      if (firstRoom.room_id && typeof firstRoom.room_id === 'object') {
        roomId = firstRoom.room_id._id || '';
        roomNo = firstRoom.room_id.room_number || '—';
        roomFloor = firstRoom.room_id.floor || '';
      }
      if (firstRoom.room_type_id && typeof firstRoom.room_type_id === 'object') {
        roomType = firstRoom.room_type_id.name || firstRoom.room_type_id.code || 'Standard';
      }
    }

    const rawStatus = (rawRes.status || 'PENDING').toUpperCase();
    const uiStatus = UI_STAY_STATUS_MAP[rawStatus] || 'Booked';

    const checkInDate = formatDateToYMD(rawRes.expected_check_in || rawRes.check_in || rawRes.checkIn);
    const checkOutDate = formatDateToYMD(rawRes.expected_check_out || rawRes.check_out || rawRes.checkOut);
    const bookingRef = rawRes.booking_ref || rawRes.bookingRef || `RES-${resId.slice(-6).toUpperCase()}`;

    nonStayRows.push({
      id: resId,
      _id: resId,
      stayId: '',
      stay_id: '',
      stayRef: '',
      stay_ref: '',

      reservationId: resId,
      reservation_id: resId,
      canonicalBookingId: resId,
      bookingId: bookingRef,
      bookingRef: bookingRef,

      guestId,
      primary_guest_id: guestId,
      guestRef,
      guest_ref: guestRef,
      firstName,
      lastName,
      name: fullName,
      email,
      phone,
      mobile: phone,

      roomId: String(roomId),
      room_id: String(roomId),
      roomNo: String(roomNo),
      roomNumber: String(roomNo),
      room: String(roomNo),
      roomType,
      roomFloor,
      roomStatus: 'AVAILABLE',
      housekeepingStatus: 'CLEAN',

      status: uiStatus,
      rawStatus,

      checkIn: checkInDate,
      checkOut: checkOutDate,
      actualCheckIn: null,
      actual_check_in: null,
      actualCheckOut: null,
      actual_check_out: null,
      checkInTime: '',
      checkOutTime: '',

      totalGuests: Number(rawRes.adults ?? 1),
      total_guests: Number(rawRes.adults ?? 1),
      guestCount: String(rawRes.adults ?? 1),
      notes: rawRes.special_requests || rawRes.specialRequests || rawRes.notes || '',
      isLegacyUnmapped: false,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1b7f43&color=fff`,

      created_at: rawRes.created_at || rawRes.createdAt || '',
      updated_at: rawRes.updated_at || rawRes.updatedAt || '',

      raw: rawRes,
    });
  });

  return [...stays, ...nonStayRows];
}

/**
 * Builds backend check-in payload from frontend check-in form/modal.
 * @param {Object} frontendData - Front office check-in data
 * @returns {Object} Backend payload for POST /api/v1/hotel/stays/check-in
 */
export function toBackendCheckInPayload(frontendData = {}) {
  if (!frontendData || typeof frontendData !== 'object') {
    return {};
  }

  const reservationId = frontendData.reservationId || frontendData.reservation_id || frontendData.canonicalBookingId || frontendData.id || '';
  const rawRoomId = frontendData.roomId || frontendData.room_id || null;
  const rawGuestId = frontendData.guestId || frontendData.primary_guest_id || null;
  const totalGuests = Number(frontendData.totalGuests || frontendData.total_guests || frontendData.guestCount || 1);
  const notes = String(frontendData.notes || frontendData.specialRequests || '').trim();

  const payload = {
    reservation_id: String(reservationId).trim(),
    total_guests: Math.max(1, totalGuests),
  };

  if (rawRoomId && /^[0-9a-fA-F]{24}$/.test(String(rawRoomId).trim())) {
    payload.room_id = String(rawRoomId).trim();
  }

  if (rawGuestId && /^[0-9a-fA-F]{24}$/.test(String(rawGuestId).trim())) {
    payload.primary_guest_id = String(rawGuestId).trim();
  }

  if (notes) {
    payload.notes = notes;
  }

  return payload;
}

/**
 * Builds backend check-out payload from frontend check-out modal.
 * @param {Object} frontendData - Front office check-out data
 * @returns {Object} Backend payload for POST /api/v1/hotel/stays/:id/check-out
 */
export function toBackendCheckOutPayload(frontendData = {}) {
  if (!frontendData || typeof frontendData !== 'object') {
    return {};
  }

  const stayId = frontendData.stayId || frontendData.stay_id || frontendData.id || '';
  const reservationId = frontendData.reservationId || frontendData.reservation_id || '';
  const notes = String(frontendData.notes || frontendData.checkoutNotes || '').trim();

  const payload = {};

  if (stayId && String(stayId).trim() !== '') {
    payload.stay_id = String(stayId).trim();
  } else if (reservationId && String(reservationId).trim() !== '') {
    payload.reservation_id = String(reservationId).trim();
  }

  if (notes) {
    payload.notes = notes;
  }

  return payload;
}
