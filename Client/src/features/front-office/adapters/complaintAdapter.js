/**
 * Bidirectional Complaint Adapter
 * Translates between Backend MongoDB Complaint contracts and Frontend UI/Store models.
 */

export const CANONICAL_BACKEND_CATEGORIES = [
  'GENERAL',
  'PLUMBING',
  'ELECTRICAL',
  'HOUSEKEEPING',
  'NOISE',
  'AIR_CONDITIONING',
  'ROOM_SERVICE',
  'AMENITIES',
];

export const BACKEND_TO_UI_CATEGORY_MAP = {
  GENERAL: 'General',
  PLUMBING: 'Plumbing',
  ELECTRICAL: 'Electrical',
  HOUSEKEEPING: 'Housekeeping',
  NOISE: 'Noise',
  AIR_CONDITIONING: 'Air Conditioning',
  ROOM_SERVICE: 'Room Service',
  AMENITIES: 'Amenities Request',
};

export const UI_TO_BACKEND_CATEGORY_MAP = {
  General: 'GENERAL',
  'general': 'GENERAL',
  'General / Front Desk': 'GENERAL',
  'Front Desk': 'GENERAL',
  Plumbing: 'PLUMBING',
  'plumbing': 'PLUMBING',
  Electrical: 'ELECTRICAL',
  'electrical': 'ELECTRICAL',
  Housekeeping: 'HOUSEKEEPING',
  'housekeeping': 'HOUSEKEEPING',
  Noise: 'NOISE',
  'noise': 'NOISE',
  'Air Conditioning': 'AIR_CONDITIONING',
  'air conditioning': 'AIR_CONDITIONING',
  'Air condition': 'AIR_CONDITIONING',
  'AC': 'AIR_CONDITIONING',
  'A/C': 'AIR_CONDITIONING',
  'Room Service': 'ROOM_SERVICE',
  'room service': 'ROOM_SERVICE',
  'Amenities Request': 'AMENITIES',
  'Amenities': 'AMENITIES',
  'amenities': 'AMENITIES',
};

export const BACKEND_TO_UI_SEVERITY_MAP = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const UI_TO_BACKEND_SEVERITY_MAP = {
  Low: 'LOW',
  low: 'LOW',
  Medium: 'MEDIUM',
  medium: 'MEDIUM',
  High: 'HIGH',
  high: 'HIGH',
  Critical: 'CRITICAL',
  critical: 'CRITICAL',
  Urgent: 'CRITICAL',
  urgent: 'CRITICAL',
};

export const BACKEND_TO_UI_STATUS_MAP = {
  OPEN: 'Open',
  INVESTIGATING: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const UI_TO_BACKEND_STATUS_MAP = {
  Open: 'OPEN',
  open: 'OPEN',
  'In Progress': 'INVESTIGATING',
  'in progress': 'INVESTIGATING',
  Investigating: 'INVESTIGATING',
  investigating: 'INVESTIGATING',
  Resolved: 'RESOLVED',
  resolved: 'RESOLVED',
  Closed: 'CLOSED',
  closed: 'CLOSED',
};

/**
 * Normalizes category from backend enum to frontend display string.
 * @param {string} category
 * @returns {string}
 */
export function toFrontendCategory(category) {
  if (!category) return 'General';
  const upper = String(category).trim().toUpperCase();
  return BACKEND_TO_UI_CATEGORY_MAP[upper] || 'General';
}

/**
 * Normalizes category from frontend string to canonical backend enum.
 * @param {string} category
 * @returns {string}
 */
export function toBackendCategory(category) {
  if (!category) return 'GENERAL';
  const trimmed = String(category).trim();
  if (CANONICAL_BACKEND_CATEGORIES.includes(trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  return UI_TO_BACKEND_CATEGORY_MAP[trimmed] || 'GENERAL';
}

/**
 * Normalizes severity/priority from backend enum to frontend display string.
 * @param {string} severity
 * @returns {string}
 */
export function toFrontendSeverity(severity) {
  if (!severity) return 'Medium';
  const upper = String(severity).trim().toUpperCase();
  return BACKEND_TO_UI_SEVERITY_MAP[upper] || 'Medium';
}

/**
 * Normalizes severity/priority from frontend string to canonical backend enum.
 * @param {string} severity
 * @returns {string}
 */
export function toBackendSeverity(severity) {
  if (!severity) return 'MEDIUM';
  const trimmed = String(severity).trim();
  const upper = trimmed.toUpperCase();
  if (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(upper)) {
    return upper;
  }
  return UI_TO_BACKEND_SEVERITY_MAP[trimmed] || 'MEDIUM';
}

/**
 * Normalizes status from backend enum to frontend display string.
 * @param {string} status
 * @returns {string}
 */
export function toFrontendStatus(status) {
  if (!status) return 'Open';
  const upper = String(status).trim().toUpperCase();
  return BACKEND_TO_UI_STATUS_MAP[upper] || 'Open';
}

/**
 * Normalizes status from frontend string to canonical backend enum.
 * @param {string} status
 * @returns {string}
 */
export function toBackendStatus(status) {
  if (!status) return 'OPEN';
  const trimmed = String(status).trim();
  const upper = trimmed.toUpperCase();
  if (['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'].includes(upper)) {
    return upper;
  }
  return UI_TO_BACKEND_STATUS_MAP[trimmed] || 'OPEN';
}

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
 * Transforms a backend MongoDB Complaint document into the frontend UI model.
 * Preserves canonical MongoDB _id references and never invents synthetic IDs.
 *
 * @param {Object} backendComplaint - Raw MongoDB document or populated API response
 * @returns {Object|null} Frontend complaint view model
 */
export function toFrontendComplaint(backendComplaint) {
  if (!backendComplaint || typeof backendComplaint !== 'object') {
    return null;
  }

  // Handle wrapped API responses like { complaint: { ... } }
  const raw = backendComplaint.complaint && typeof backendComplaint.complaint === 'object'
    ? backendComplaint.complaint
    : backendComplaint;

  const rawId = raw._id || raw.id || '';
  const complaintRef = raw.complaint_ref || raw.complaintRef || '';

  // 1. Guest relationship
  const guestObj = raw.guest_id && typeof raw.guest_id === 'object' ? raw.guest_id : null;
  const guestId = guestObj ? (guestObj._id || guestObj.id || '') : (typeof raw.guest_id === 'string' ? raw.guest_id : (raw.guestId || ''));
  const guestRef = guestObj?.guest_ref || guestObj?.guestRef || raw.guest_ref || raw.guestRef || '';

  const firstName = String(guestObj?.first_name || guestObj?.firstName || raw.firstName || '').trim();
  const lastName = String(guestObj?.last_name || guestObj?.lastName || raw.lastName || '').trim();
  const cleanLastName = (lastName === '.' || lastName === '—' || lastName === '-') ? '' : lastName;
  let fullName = [firstName, cleanLastName].filter(Boolean).join(' ').trim();
  if (!fullName) {
    fullName = guestObj?.name ? String(guestObj.name).trim() : (raw.name || raw.guestName || (firstName || 'Guest'));
  }
  const guestEmail = guestObj?.email || raw.email || raw.guestEmail || '';
  const guestPhone = guestObj?.phone || guestObj?.mobile || raw.phone || raw.mobile || '';

  // 2. Room relationship
  const roomObj = raw.room_id && typeof raw.room_id === 'object' ? raw.room_id : null;
  const roomId = roomObj ? (roomObj._id || roomObj.id || '') : (typeof raw.room_id === 'string' ? raw.room_id : (raw.roomId || ''));
  const roomNo = roomObj ? (roomObj.room_number || roomObj.roomNo || roomObj.number || '—') : (raw.roomNo || raw.roomNumber || raw.room || '—');
  const roomFloor = roomObj?.floor || raw.roomFloor || raw.floor || '';
  const roomStatus = roomObj?.status || raw.roomStatus || 'AVAILABLE';

  // 3. Reservation relationship
  const resObj = raw.reservation_id && typeof raw.reservation_id === 'object' ? raw.reservation_id : null;
  const reservationId = resObj ? (resObj._id || resObj.id || '') : (typeof raw.reservation_id === 'string' ? raw.reservation_id : (raw.reservationId || ''));
  const bookingRef = resObj?.booking_ref || resObj?.bookingRef || raw.booking_ref || raw.bookingRef || '';
  const reservationStatus = resObj?.status || raw.reservationStatus || '';

  // 4. Assigned Employee relationship
  const empObj = raw.assigned_to && typeof raw.assigned_to === 'object' ? raw.assigned_to : null;
  const assignedTo = empObj ? (empObj._id || empObj.id || '') : (typeof raw.assigned_to === 'string' ? raw.assigned_to : (raw.assignedTo || ''));
  const empFirstName = String(empObj?.first_name || '').trim();
  const empLastName = String(empObj?.last_name || '').trim();
  const assignedEmployeeName = [empFirstName, empLastName].filter(Boolean).join(' ').trim() || (raw.assignedEmployeeName || '');
  const assignedEmployeeRef = empObj?.employee_ref || raw.assignedEmployeeRef || '';
  const assignedEmployeeJobTitle = empObj?.job_title || raw.assignedEmployeeJobTitle || '';

  // 5. Category, Severity, Status
  const uiCategory = toFrontendCategory(raw.category);
  const uiSeverity = toFrontendSeverity(raw.severity);
  const uiStatus = toFrontendStatus(raw.status);

  // 6. Dates & Timestamps
  const createdAt = raw.created_at || raw.createdAt || '';
  const formattedDate = formatDateToYMD(createdAt || raw.date) || formatDateToYMD(new Date());

  return {
    id: rawId,
    _id: rawId,
    complaintId: rawId,
    complaint_ref: complaintRef,
    complaintRef,
    ticketNo: complaintRef || rawId,

    // Guest details
    guestId,
    guest_id: guestId,
    guestRef,
    guestName: fullName,
    name: fullName,
    firstName,
    lastName,
    guestEmail,
    email: guestEmail,
    guestPhone,
    phone: guestPhone,

    // Room details
    roomId,
    room_id: roomId,
    roomNo: String(roomNo),
    roomNumber: String(roomNo),
    room: String(roomNo),
    roomFloor,
    roomStatus,

    // Reservation details
    reservationId,
    reservation_id: reservationId,
    bookingRef,
    reservationStatus,

    // Staff details
    assignedTo,
    assigned_to: assignedTo,
    assignedEmployeeName,
    assignedEmployeeRef,
    assignedEmployeeJobTitle,

    // Classification & Lifecycle
    category: uiCategory,
    type: uiCategory,
    rawCategory: raw.category,
    severity: uiSeverity,
    priority: uiSeverity,
    rawSeverity: raw.severity,
    status: uiStatus,
    rawStatus: raw.status,

    // Content
    description: raw.description || '',
    resolution_notes: raw.resolution_notes || '',
    resolutionNotes: raw.resolution_notes || '',
    compensation_offered: raw.compensation_offered || '',
    compensationOffered: raw.compensation_offered || '',
    resolved_at: raw.resolved_at || null,
    resolvedAt: raw.resolved_at || null,

    // Dates
    date: formattedDate,
    created_at: createdAt,
    createdAt,
    updated_at: raw.updated_at || raw.updatedAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',

    raw,
  };
}

/**
 * Transforms an array or paginated response of backend Complaint documents into frontend complaint view models.
 * @param {Array|Object} complaintsResponse - Array of complaints or API response envelope
 * @returns {Array} Array of frontend complaint view models
 */
export function toFrontendComplaintList(complaintsResponse) {
  if (!complaintsResponse) return [];

  const rawList = Array.isArray(complaintsResponse)
    ? complaintsResponse
    : (Array.isArray(complaintsResponse.complaints)
      ? complaintsResponse.complaints
      : (Array.isArray(complaintsResponse.data) ? complaintsResponse.data : []));

  return rawList
    .map((item) => toFrontendComplaint(item))
    .filter(Boolean);
}

/**
 * Builds a clean backend payload for POST /api/v1/hotel/complaints or PATCH /api/v1/hotel/complaints/:id.
 * Enforces immutable fields and standard validation rules.
 *
 * @param {Object} frontendData - Form data or mutation payload
 * @param {Object} [options={}] - Mutation options ({ isUpdate: boolean })
 * @returns {Object} Clean backend payload
 */
export function toBackendComplaintPayload(frontendData = {}, options = {}) {
  if (!frontendData || typeof frontendData !== 'object') {
    return {};
  }

  const isUpdate = Boolean(options.isUpdate);
  const payload = {};

  // 1. Guest ID (Required on create, IMMUTABLE on update)
  if (!isUpdate) {
    const rawGuestId = frontendData.guest_id || frontendData.guestId || '';
    if (rawGuestId && /^[0-9a-fA-F]{24}$/.test(String(rawGuestId).trim())) {
      payload.guest_id = String(rawGuestId).trim();
    }
  }

  // 2. Room ID (Optional ObjectId)
  if (frontendData.room_id !== undefined || frontendData.roomId !== undefined) {
    const rawRoomId = frontendData.room_id !== undefined ? frontendData.room_id : frontendData.roomId;
    if (rawRoomId && /^[0-9a-fA-F]{24}$/.test(String(rawRoomId).trim())) {
      payload.room_id = String(rawRoomId).trim();
    } else if (rawRoomId === null || rawRoomId === '') {
      payload.room_id = null;
    }
  }

  // 3. Reservation ID (Optional ObjectId)
  if (frontendData.reservation_id !== undefined || frontendData.reservationId !== undefined) {
    const rawResId = frontendData.reservation_id !== undefined ? frontendData.reservation_id : frontendData.reservationId;
    if (rawResId && /^[0-9a-fA-F]{24}$/.test(String(rawResId).trim())) {
      payload.reservation_id = String(rawResId).trim();
    } else if (rawResId === null || rawResId === '') {
      payload.reservation_id = null;
    }
  }

  // 4. Assigned Employee ID (Optional ObjectId)
  if (frontendData.assigned_to !== undefined || frontendData.assignedTo !== undefined) {
    const rawEmpId = frontendData.assigned_to !== undefined ? frontendData.assigned_to : frontendData.assignedTo;
    if (rawEmpId && /^[0-9a-fA-F]{24}$/.test(String(rawEmpId).trim())) {
      payload.assigned_to = String(rawEmpId).trim();
    } else if (rawEmpId === null || rawEmpId === '') {
      payload.assigned_to = null;
    }
  }

  // 5. Category (Normalized to canonical backend enum)
  const rawCat = frontendData.category || frontendData.type;
  if (rawCat !== undefined) {
    payload.category = toBackendCategory(rawCat);
  }

  // 6. Severity / Priority (Normalized to canonical backend enum)
  const rawSev = frontendData.severity || frontendData.priority;
  if (rawSev !== undefined) {
    payload.severity = toBackendSeverity(rawSev);
  }

  // 7. Status (Normalized to canonical backend enum)
  const rawStat = frontendData.status;
  if (rawStat !== undefined) {
    payload.status = toBackendStatus(rawStat);
  }

  // 8. Description
  if (frontendData.description !== undefined) {
    payload.description = String(frontendData.description || '').trim();
  }

  // 9. Resolution Notes & Compensation
  if (frontendData.resolution_notes !== undefined || frontendData.resolutionNotes !== undefined) {
    const notes = frontendData.resolution_notes !== undefined ? frontendData.resolution_notes : frontendData.resolutionNotes;
    payload.resolution_notes = notes ? String(notes).trim() : null;
  }

  if (frontendData.compensation_offered !== undefined || frontendData.compensationOffered !== undefined) {
    const comp = frontendData.compensation_offered !== undefined ? frontendData.compensation_offered : frontendData.compensationOffered;
    payload.compensation_offered = comp ? String(comp).trim() : null;
  }

  // Explicitly ensure IMMUTABLE and backend-controlled fields are NEVER attached
  delete payload._id;
  delete payload.id;
  delete payload.complaint_ref;
  delete payload.complaintRef;
  delete payload.resolved_at;
  delete payload.resolvedAt;
  delete payload.created_at;
  delete payload.createdAt;
  delete payload.updated_at;
  delete payload.updatedAt;
  delete payload.hotelId;
  delete payload.tenantId;

  return payload;
}
