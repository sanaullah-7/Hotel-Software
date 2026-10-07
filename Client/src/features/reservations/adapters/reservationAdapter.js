/**
 * Bidirectional Reservation Adapter
 * Translates between Backend MongoDB Reservation contracts and Frontend UI/Store models.
 */

export const BACKEND_RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_HOUSE: 'IN_HOUSE',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

export const UI_RESERVATION_STATUS_MAP = {
  PENDING: 'Pending',
  CONFIRMED: 'Booked',
  IN_HOUSE: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'Cancelled',
};

export const BACKEND_STATUS_MAP = {
  Pending: 'PENDING',
  pending: 'PENDING',
  Booked: 'CONFIRMED',
  booked: 'CONFIRMED',
  Confirmed: 'CONFIRMED',
  confirmed: 'CONFIRMED',
  Reserved: 'CONFIRMED',
  reserved: 'CONFIRMED',
  'Checked In': 'IN_HOUSE',
  'checked in': 'IN_HOUSE',
  'In House': 'IN_HOUSE',
  'in house': 'IN_HOUSE',
  'Checked Out': 'CHECKED_OUT',
  'checked out': 'CHECKED_OUT',
  Cancelled: 'CANCELLED',
  cancelled: 'CANCELLED',
  Canceled: 'CANCELLED',
  canceled: 'CANCELLED',
  'No Show': 'NO_SHOW',
  'no show': 'NO_SHOW',
};

/**
 * Safely format date input (Date object, ISO string, or timestamp) to YYYY-MM-DD
 */
export function formatDateToYMD(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Transforms a canonical backend Reservation object into frontend UI model
 * @param {Object} backendRes - Raw MongoDB reservation document or populated response
 * @returns {Object} Frontend UI booking object
 */
export function toFrontendReservation(backendRes) {
  if (!backendRes) return null;

  // Handle wrapped API responses like { reservation, room_details }
  const raw = backendRes.reservation ? backendRes.reservation : backendRes;
  const roomDetails = backendRes.room_details || null;

  const rawStatus = (raw.rawStatus || BACKEND_STATUS_MAP[raw.status] || raw.status || 'PENDING').toUpperCase();
  const uiStatus = UI_RESERVATION_STATUS_MAP[rawStatus] || 'Pending';

  // Primary Guest extraction
  const guestObj = typeof raw.primary_guest_id === 'object' && raw.primary_guest_id !== null
    ? raw.primary_guest_id
    : (raw.guestObj || null);
  const guestId = guestObj ? (guestObj._id || guestObj.id) : (raw.primary_guest_id || raw.guestId || '');

  const firstName = guestObj?.first_name || raw.firstName || '';
  const lastName = guestObj?.last_name || raw.lastName || '';
  const fullName = guestObj
    ? `${firstName} ${lastName}`.trim() || raw.name || 'Guest'
    : (raw.name || raw.guestName || (firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Guest'));
  const email = guestObj?.email || raw.email || raw.guestEmail || '';
  const mobile = guestObj?.phone || raw.phone || raw.mobile || '';

  // Rooms extraction
  let roomObj = null;
  let roomTypeObj = null;
  let roomId = raw.roomId || raw.room_id || '';
  let roomTypeId = raw.roomTypeId || raw.room_type_id || '';
  let roomNo = raw.roomNo || raw.roomNumber || raw.room || '—';
  let roomType = '';

  if (Array.isArray(raw.rooms) && raw.rooms.length > 0) {
    const firstRoom = raw.rooms[0];
    if (firstRoom.room_id && typeof firstRoom.room_id === 'object') {
      roomObj = firstRoom.room_id;
      roomId = roomObj._id || '';
      roomNo = roomObj.room_number || '—';
    } else if (firstRoom.room_id) {
      roomId = firstRoom.room_id;
    }

    if (firstRoom.room_type_id && typeof firstRoom.room_type_id === 'object') {
      roomTypeObj = firstRoom.room_type_id;
      roomTypeId = roomTypeObj._id || '';
      roomType = roomTypeObj.name || roomTypeObj.code || '';
    } else if (firstRoom.room_type_id) {
      roomTypeId = firstRoom.room_type_id;
    }
  } else if (roomDetails) {
    roomId = roomDetails.room_id || roomId;
    roomTypeId = roomDetails.room_type_id || roomTypeId;
  }

  const checkInStr = formatDateToYMD(raw.expected_check_in || raw.check_in || raw.checkIn);
  const checkOutStr = formatDateToYMD(raw.expected_check_out || raw.check_out || raw.checkOut);

  const adults = Number(raw.adults ?? 1);
  const children = Number(raw.children ?? 0);
  const totalPerson = String(adults + children);

  const bookingRef = raw.booking_ref || raw.bookingRef || (raw._id ? `RES-${String(raw._id).slice(-6).toUpperCase()}` : '');

  return {
    id: raw._id || raw.id,
    _id: raw._id || raw.id,
    canonicalBookingId: raw._id || raw.id,
    bookingId: bookingRef,
    bookingRef,
    guestId,
    primary_guest_id: guestId,
    guestObj,
    name: fullName,
    firstName,
    lastName,
    email,
    mobile,
    phone: mobile,
    roomId,
    room_id: roomId,
    roomObj,
    roomNo: roomNo !== '—' ? String(roomNo) : (raw.roomNo || raw.room || '—'),
    roomNumber: roomNo !== '—' ? String(roomNo) : (raw.roomNo || raw.room || '—'),
    room: roomNo !== '—' ? String(roomNo) : (raw.roomNo || raw.room || '—'),
    roomTypeId,
    room_type_id: roomTypeId,
    roomTypeObj,
    roomType: roomType || raw.roomType || 'Standard Room',
    status: uiStatus,
    rawStatus,
    checkIn: checkInStr,
    checkOut: checkOutStr,
    expected_check_in: raw.expected_check_in,
    expected_check_out: raw.expected_check_out,
    adults,
    children,
    totalPerson,
    numRooms: '1',
    package: raw.package || 'Standard (Room Only)',
    specialRequests: raw.special_requests || raw.specialRequests || '',
    special_requests: raw.special_requests || raw.specialRequests || '',
    cancellationReason: raw.cancellation_reason || raw.cancellationReason || raw.reason || '',
    cancellation_reason: raw.cancellation_reason || raw.cancellationReason || raw.reason || '',
    reason: raw.cancellation_reason || raw.cancellationReason || raw.reason || '',
    cancellationDate: formatDateToYMD(raw.cancelled_at || raw.cancelledAt || raw.cancellationDate || (raw.status === 'CANCELLED' ? (raw.updated_at || raw.updatedAt) : '')),
    avatar: raw.avatar || `https://i.pravatar.cc/150?u=${raw._id || guestId || 'guest'}`,
    payment: raw.payment || 'Unpaid',
    dues: raw.dues !== undefined ? Number(raw.dues) : (raw.folio_balance !== undefined ? Number(raw.folio_balance) : (backendRes?.folio_balance !== undefined ? Number(backendRes.folio_balance) : undefined)),
    folio_balance: raw.folio_balance !== undefined ? Number(raw.folio_balance) : (backendRes?.folio_balance !== undefined ? Number(backendRes.folio_balance) : undefined),
    createdAt: formatDateToYMD(raw.created_at || raw.createdAt || Date.now()),
    bookingDate: formatDateToYMD(raw.created_at || raw.bookingDate || Date.now()),
    reservationDate: formatDateToYMD(raw.created_at || raw.reservationDate || Date.now()),
    raw,
  };
}

/**
 * Transforms a frontend reservation form object into backend API payload
 * @param {Object} frontendForm - Form state from AddReservation, EditReservation, or modal
 * @param {Object} options - Transformation options (e.g. { isCreate: true })
 * @returns {Object} Backend create/update payload
 */
export function toBackendReservationPayload(frontendForm, options = {}) {
  if (!frontendForm) return {};

  const guestId = frontendForm.guestId || frontendForm.primary_guest_id || frontendForm.selectedGuestId || null;
  const roomId = frontendForm.roomId || frontendForm.room || frontendForm.room_id || null;
  const roomTypeId = frontendForm.roomTypeId || frontendForm.room_type_id || null;

  const checkInDate = frontendForm.checkInDate || frontendForm.checkIn || frontendForm.expected_check_in;
  const checkOutDate = frontendForm.checkOutDate || frontendForm.checkOut || frontendForm.expected_check_out;

  const adults = Number(frontendForm.adults || frontendForm.totalPerson || 1);
  const children = Number(frontendForm.children || 0);

  const rawSpecial = frontendForm.specialRequests || frontendForm.special_requests || frontendForm.note || '';

  const payload = {
    expected_check_in: new Date(checkInDate).toISOString(),
    expected_check_out: new Date(checkOutDate).toISOString(),
    adults: Math.max(1, adults),
    children: Math.max(0, children),
    special_requests: String(rawSpecial).trim(),
  };

  if (!options.isUpdate && guestId) {
    payload.primary_guest_id = String(guestId).trim();
  }

  if (roomId && String(roomId).trim() !== '' && String(roomId).trim() !== '—') {
    payload.room_id = String(roomId).trim();
  }

  if (roomTypeId && String(roomTypeId).trim() !== '') {
    payload.room_type_id = String(roomTypeId).trim();
  }

  if (!options.isCreate && frontendForm.status) {
    const backendStatus = BACKEND_STATUS_MAP[frontendForm.status] || (Object.values(BACKEND_RESERVATION_STATUS).includes(frontendForm.status) ? frontendForm.status : undefined);
    if (backendStatus) {
      payload.status = backendStatus;
    }
  }

  if (!options.isCreate && (frontendForm.cancellationReason || frontendForm.cancellation_reason)) {
    payload.cancellation_reason = String(frontendForm.cancellationReason || frontendForm.cancellation_reason).trim();
  }

  if (!options.isUpdate && (frontendForm.ratePlanId || frontendForm.rate_plan_id)) {
    payload.rate_plan_id = String(frontendForm.ratePlanId || frontendForm.rate_plan_id).trim();
  }

  if (!options.isUpdate && (frontendForm.groupId || frontendForm.group_id)) {
    payload.group_id = String(frontendForm.groupId || frontendForm.group_id).trim();
  }

  return payload;
}

/**
 * Transforms a backend ReservationGroup document into frontend UI model
 * @param {Object} backendGroup - Raw MongoDB reservation group document
 * @returns {Object} Frontend group reservation object
 */
export function toFrontendGroupReservation(backendGroup) {
  if (!backendGroup) return null;
  const raw = backendGroup;
  const rawStatus = (raw.status || 'PENDING').toUpperCase();
  let uiStatus = 'Pending';
  if (rawStatus === 'CONFIRMED') {
    uiStatus = 'Confirmed';
  } else if (rawStatus === 'CANCELLED') {
    uiStatus = 'Cancelled';
  }

  return {
    id: raw._id || raw.id,
    _id: raw._id || raw.id,
    groupRef: raw.group_ref || '',
    groupName: raw.name || '',
    contactPerson: raw.contact_person || '',
    email: raw.email || '',
    phone: raw.phone || '',
    checkIn: formatDateToYMD(raw.expected_check_in),
    checkOut: formatDateToYMD(raw.expected_check_out),
    rooms: Number(raw.rooms_count ?? 1),
    guests: Number(raw.total_guests ?? 1),
    roomTypes: raw.room_types || '',
    status: uiStatus,
    rawStatus,
    cancellationReason: raw.cancellation_reason || '',
    totalPrice: Number(raw.total_price ?? 0),
    specialRequests: raw.billing_instructions || '',
    companyName: raw.company_name || '',
    createdAt: raw.created_at || raw.createdAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',
    raw,
  };
}

/**
 * Transforms frontend group form object into backend ReservationGroup payload
 * @param {Object} frontendForm - Form state from GroupReservationModal
 * @returns {Object} Backend create/update payload
 */
export function toBackendGroupReservationPayload(frontendForm) {
  if (!frontendForm) return {};

  const statusUpper = (frontendForm.status || 'Pending').toUpperCase();
  const backendStatus = statusUpper === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING';

  const payload = {
    name: (frontendForm.groupName || '').trim(),
    contact_person: (frontendForm.contactPerson || '').trim(),
    rooms_count: Number(frontendForm.rooms || 0),
    total_guests: Number(frontendForm.guests || 0),
    status: backendStatus,
    total_price: Number(frontendForm.totalPrice || 0),
  };

  if (frontendForm.email && String(frontendForm.email).trim() !== '') {
    payload.email = String(frontendForm.email).trim();
  } else {
    payload.email = null;
  }

  if (frontendForm.phone && String(frontendForm.phone).trim() !== '') {
    payload.phone = String(frontendForm.phone).trim();
  } else {
    payload.phone = null;
  }

  if (frontendForm.roomTypes && String(frontendForm.roomTypes).trim() !== '') {
    payload.room_types = String(frontendForm.roomTypes).trim();
  } else {
    payload.room_types = null;
  }

  if (frontendForm.specialRequests && String(frontendForm.specialRequests).trim() !== '') {
    payload.billing_instructions = String(frontendForm.specialRequests).trim();
  } else {
    payload.billing_instructions = null;
  }

  if (frontendForm.checkIn) {
    payload.expected_check_in = new Date(frontendForm.checkIn).toISOString();
  }

  if (frontendForm.checkOut) {
    payload.expected_check_out = new Date(frontendForm.checkOut).toISOString();
  }

  return payload;
}
