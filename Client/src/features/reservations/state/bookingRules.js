export function normalizeBookingStatus(status) {
  const normalized = String(status || '').trim().toLowerCase().replace(/[ _-]+/g, '');
  if (normalized === 'pending') return 'Pending';
  if (normalized === 'booked' || normalized === 'reserved' || normalized === 'confirmed') return 'Booked';
  if (normalized === 'checkin' || normalized === 'checkedin') return 'Checked In';
  if (normalized === 'checkout' || normalized === 'checkedout' || normalized === 'completed') return 'Checked Out';
  if (normalized === 'cancelled' || normalized === 'canceled') return 'Cancelled';
  return 'Unknown';
}

export const isRoomBlockingBooking = (booking) =>
  ['Booked', 'Checked In'].includes(normalizeBookingStatus(booking?.status));

export const isEligibleForCheckIn = (booking) =>
  ['Booked'].includes(normalizeBookingStatus(booking?.status));

export const isCheckedIn = (booking) => normalizeBookingStatus(booking?.status) === 'Checked In';

export function parseStayDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  let year; let month; let day;
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (iso) [, year, month, day] = iso;
  else if (us) [, month, day, year] = us;
  else return null;
  year = Number(year);
  month = Number(month);
  day = Number(day);
  if (year < 100) year += year < 50 ? 2000 : 1900;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.getTime();
}

export function validateStayDates(checkIn, checkOut) {
  const start = parseStayDate(checkIn);
  const end = parseStayDate(checkOut);
  if (start === null || end === null) throw new Error('Enter valid check-in and check-out dates.');
  if (end <= start) throw new Error('Check-out must be after check-in.');
  return { start, end };
}

export function hasBookingDateOverlap(existing, requestedCheckIn, requestedCheckOut) {
  const requested = validateStayDates(requestedCheckIn, requestedCheckOut);
  const existingStart = parseStayDate(existing.checkIn);
  const existingEnd = parseStayDate(existing.checkOut);
  // Unknown legacy dates cannot safely establish that a blocking booking is clear.
  if (existingStart === null || existingEnd === null || existingEnd <= existingStart) return true;
  return existingStart < requested.end && existingEnd > requested.start;
}

export function resolveBookingReference(reference, bookings = []) {
  if (reference === undefined || reference === null || String(reference).trim() === '') return null;
  const key = String(reference).trim();
  const matches = bookings.filter((booking) => [booking.id, booking.bookingId, booking.bookingRef]
    .some((value) => value !== undefined && value !== null && String(value) === key));
  return matches.length === 1 ? matches[0] : null;
}
