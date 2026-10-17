import { getModel } from '../../../database/hotel/modelFactory.js';
import { escapeRegex } from '../../../utils/query.js';

/**
 * Mask phone number for privacy: retains country/operator prefix and trailing digits,
 * obscuring the center digits with asterisks.
 * e.g., "+923001234567" -> "+9230****567", "03001234567" -> "0300****567"
 */
export const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  const trimmed = phone.trim();
  if (trimmed.length <= 6) {
    return trimmed.replace(/.(?=.{2})/g, '*');
  }
  const visibleStart = trimmed.startsWith('+') ? 5 : 4;
  const visibleEnd = 3;
  if (trimmed.length <= visibleStart + visibleEnd) {
    return trimmed.slice(0, 2) + '****' + trimmed.slice(-2);
  }
  const prefix = trimmed.slice(0, visibleStart);
  const suffix = trimmed.slice(-visibleEnd);
  return `${prefix}${'*'.repeat(Math.min(4, trimmed.length - visibleStart - visibleEnd))}${suffix}`;
};

/**
 * Mask National ID / CNIC for privacy:
 * Pakistani CNIC format: 35201-1234567-1 -> 35201-*******-1
 * Raw 13 digits: 3520112345671 -> 35201*******1
 */
export const maskNationalId = (id) => {
  if (!id || typeof id !== 'string') return null;
  const trimmed = id.trim();
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${'*'.repeat(parts[1].length)}-${parts[2]}`;
    }
  }
  if (trimmed.length >= 8) {
    return `${trimmed.slice(0, 5)}${'*'.repeat(trimmed.length - 6)}${trimmed.slice(-1)}`;
  }
  return trimmed.replace(/.(?=.{2})/g, '*');
};

/**
 * Execute fast, bounded, tenant-isolated multi-entity lookup across Rooms, Guests, and Reservations.
 *
 * @param {object} tenantConn - Tenant-specific database connection
 * @param {string} queryStr - User search input string
 * @param {object} options - Query options ({ limit })
 * @returns {Promise<{ rooms: Array, guests: Array, reservations: Array }>}
 */
export const quickSearch = async (tenantConn, queryStr = '', options = {}) => {
  const normalizedQuery = (queryStr || '').trim();

  // If query is shorter than 2 characters, return empty collections immediately without DB round-trips
  if (normalizedQuery.length < 2) {
    return {
      rooms: [],
      guests: [],
      reservations: [],
    };
  }

  const limit = Math.min(Math.max(Number(options.limit) || 5, 1), 20);
  const escaped = escapeRegex(normalizedQuery);
  const prefixRegex = new RegExp(`^${escaped}`, 'i');
  const containsRegex = new RegExp(escaped, 'i');

  const Room = await getModel(tenantConn, 'Room');
  const Guest = await getModel(tenantConn, 'Guest');
  const Reservation = await getModel(tenantConn, 'Reservation');
  const ReservationRoom = await getModel(tenantConn, 'ReservationRoom');

  // Concurrently execute searches using Promise.all with narrow projections and bounded limits
  const [roomDocs, guestDocs, reservationDocs] = await Promise.all([
    // 1. Rooms lookup: by room_number prefix (index-accelerated via unique index)
    Room.find({ room_number: prefixRegex })
      .select('_id room_number status housekeeping_status floor room_type_id')
      .populate('room_type_id', 'name')
      .limit(limit)
      .lean(),

    // 2. Guests lookup: by first_name, last_name, full name, phone, national_id, or guest_ref
    (() => {
      const guestOrFilters = [
        { first_name: prefixRegex },
        { last_name: prefixRegex },
        { guest_ref: prefixRegex },
      ];

      // If query contains digits, also match phone and national_id
      if (/\d/.test(normalizedQuery)) {
        guestOrFilters.push({ phone: containsRegex });
        guestOrFilters.push({ national_id: containsRegex });
      }

      // If query contains whitespace, attempt split full-name matching (e.g. "Hamza Khan")
      if (normalizedQuery.includes(' ')) {
        const parts = normalizedQuery.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
          guestOrFilters.push({
            first_name: new RegExp(`^${escapeRegex(parts[0])}`, 'i'),
            last_name: new RegExp(`^${escapeRegex(parts.slice(1).join(' '))}`, 'i'),
          });
        }
      }

      return Guest.find({ $or: guestOrFilters })
        .select('_id guest_ref first_name last_name phone national_id vip_status')
        .limit(limit)
        .lean();
    })(),

    // 3. Reservations lookup: by booking_ref prefix (index-accelerated via unique index)
    Reservation.find({ booking_ref: prefixRegex })
      .select('_id booking_ref status expected_check_in expected_check_out primary_guest_id')
      .populate('primary_guest_id', 'first_name last_name')
      .limit(limit)
      .lean(),
  ]);

  // Secondary lookup: correlate assigned physical rooms for found reservations (bounded to <= limit)
  const reservationIds = reservationDocs.map((r) => r._id);
  const reservationRoomMap = {};
  if (reservationIds.length > 0) {
    const reservationRooms = await ReservationRoom.find({
      reservation_id: { $in: reservationIds },
    })
      .select('reservation_id room_id')
      .populate('room_id', 'room_number')
      .lean();

    for (const rr of reservationRooms) {
      const resId = String(rr.reservation_id);
      if (!reservationRoomMap[resId]) reservationRoomMap[resId] = [];
      if (rr.room_id?.room_number) {
        reservationRoomMap[resId].push(rr.room_id.room_number);
      }
    }
  }

  // Transform to standardized navigation records adhering strictly to data privacy & minimal exposure
  const rooms = roomDocs.map((r) => ({
    id: String(r._id),
    type: 'ROOM',
    room_number: r.room_number,
    status: r.status,
    housekeeping_status: r.housekeeping_status,
    floor: r.floor || null,
    room_type_name: r.room_type_id?.name || null,
  }));

  const guests = guestDocs.map((g) => ({
    id: String(g._id),
    type: 'GUEST',
    guest_ref: g.guest_ref,
    first_name: g.first_name,
    last_name: g.last_name,
    full_name: `${g.first_name || ''} ${g.last_name || ''}`.trim(),
    phone: maskPhone(g.phone),
    national_id: maskNationalId(g.national_id),
    vip_status: Boolean(g.vip_status),
  }));

  const reservations = reservationDocs.map((res) => ({
    id: String(res._id),
    type: 'RESERVATION',
    booking_ref: res.booking_ref,
    status: res.status,
    expected_check_in: res.expected_check_in,
    expected_check_out: res.expected_check_out,
    guest_name: res.primary_guest_id
      ? `${res.primary_guest_id.first_name || ''} ${res.primary_guest_id.last_name || ''}`.trim()
      : null,
    room_numbers: reservationRoomMap[String(res._id)] || [],
  }));

  return {
    rooms,
    guests,
    reservations,
  };
};
