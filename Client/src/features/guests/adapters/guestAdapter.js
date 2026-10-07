/**
 * Bidirectional Guest Adapter
 * Translates between Backend MongoDB Guest contracts and Frontend UI/Store models.
 */

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
 * Splits a full name string into deterministic first_name and last_name tokens.
 * @param {string} fullName
 * @returns {{ first_name: string, last_name: string }}
 */
export function splitFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return { first_name: '', last_name: '' };
  }
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { first_name: '', last_name: '' };
  }
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '' };
  }
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  };
}

/**
 * Transforms a canonical backend MongoDB Guest document into the frontend Guest UI model.
 * @param {Object} backendGuest - Raw MongoDB guest document or wrapped API response
 * @returns {Object|null} Frontend Guest model
 */
export function toFrontendGuest(backendGuest) {
  if (!backendGuest || typeof backendGuest !== 'object') {
    return null;
  }

  // Handle wrapped API responses like { guest: { ... } }
  const raw = backendGuest.guest && typeof backendGuest.guest === 'object'
    ? backendGuest.guest
    : backendGuest;

  const rawId = raw._id || raw.id || raw.guestId || '';
  const guestRef = raw.guest_ref || raw.guestRef || '';

  const firstName = String(raw.first_name || raw.firstName || '').trim();
  const lastName = String(raw.last_name || raw.lastName || '').trim();

  // Normalize placeholder last names (e.g. '.' or '—') used for single-name guests
  const cleanLastName = (lastName === '.' || lastName === '—' || lastName === '-') ? '' : lastName;
  
  let displayName = [firstName, cleanLastName].filter(Boolean).join(' ').trim();
  if (!displayName) {
    displayName = raw.name ? String(raw.name).trim() : (firstName || 'Guest');
  }

  const isVip = Boolean(raw.vip_status ?? raw.vipStatus ?? (String(raw.status || '').toUpperCase() === 'VIP'));
  const uiStatus = isVip ? 'VIP' : (raw.status && raw.status !== 'VIP' ? String(raw.status) : 'Active');

  const passportNumber = raw.passport_number || raw.passportNumber || raw.passport || '';
  const nationalId = raw.national_id || raw.nationalId || raw.cnic || '';

  const formattedDob = raw.date_of_birth ? formatDateToYMD(raw.date_of_birth) : (raw.dateOfBirth ? formatDateToYMD(raw.dateOfBirth) : (raw.dob ? formatDateToYMD(raw.dob) : ''));

  return {
    id: rawId,
    _id: rawId,
    guestId: rawId,
    guest_ref: guestRef,
    guestRef: guestRef,
    first_name: firstName,
    last_name: lastName,
    firstName,
    lastName,
    name: displayName,
    email: raw.email || '',
    phone: raw.phone || raw.mobile || '',
    mobile: raw.phone || raw.mobile || '',
    address: raw.address || '',
    city: raw.city || '',
    country: raw.country || '',
    nationality: raw.nationality || '',
    passport_number: passportNumber,
    passportNumber: passportNumber,
    passport: passportNumber,
    national_id: nationalId,
    nationalId: nationalId,
    cnic: nationalId,
    vip_status: isVip,
    vipStatus: isVip,
    status: uiStatus,
    totalStays: Number(raw.totalStays ?? raw.total_stays ?? 0),
    notes: raw.notes || '',
    date_of_birth: formattedDob,
    dateOfBirth: formattedDob,
    dob: formattedDob,
    created_at: raw.created_at || raw.createdAt || '',
    createdAt: raw.created_at || raw.createdAt || '',
    updated_at: raw.updated_at || raw.updatedAt || '',
    updatedAt: raw.updated_at || raw.updatedAt || '',
  };
}

/**
 * Transforms a frontend guest form or object into a backend API payload.
 * Follows Joi validation schemas and sparse-index rules.
 * @param {Object} frontendGuest - Frontend guest form or object
 * @param {Object} [options={}] - Options (e.g. { isUpdate: true })
 * @returns {Object} Clean backend payload
 */
export function toBackendGuestPayload(frontendGuest, options = {}) {
  if (!frontendGuest || typeof frontendGuest !== 'object') {
    return {};
  }

  const isUpdate = Boolean(options.isUpdate);
  const payload = {};

  // 1. Name Handling
  let firstName = '';
  let lastName = '';

  if (frontendGuest.first_name !== undefined || frontendGuest.firstName !== undefined) {
    firstName = String(frontendGuest.first_name ?? frontendGuest.firstName ?? '').trim();
  }
  if (frontendGuest.last_name !== undefined || frontendGuest.lastName !== undefined) {
    lastName = String(frontendGuest.last_name ?? frontendGuest.lastName ?? '').trim();
  }

  if (!firstName && !lastName && (frontendGuest.name || frontendGuest.fullName)) {
    const split = splitFullName(frontendGuest.name || frontendGuest.fullName);
    firstName = split.first_name;
    lastName = split.last_name;
  }

  if (isUpdate) {
    if (firstName) payload.first_name = firstName;
    if (lastName) payload.last_name = lastName;
  } else {
    payload.first_name = firstName;
    // Backend Joi create schema requires last_name: required()
    payload.last_name = lastName || '.';
  }

  // 2. Email & Phone Handling
  const rawEmail = frontendGuest.email !== undefined ? String(frontendGuest.email).trim().toLowerCase() : undefined;
  if (rawEmail !== undefined) {
    if (rawEmail) {
      payload.email = rawEmail;
    } else if (isUpdate) {
      payload.email = null;
    }
  }

  const rawPhone = frontendGuest.phone !== undefined ? String(frontendGuest.phone).trim() : (frontendGuest.mobile !== undefined ? String(frontendGuest.mobile).trim() : undefined);
  if (rawPhone !== undefined) {
    if (rawPhone) {
      payload.phone = rawPhone;
    } else if (isUpdate) {
      payload.phone = null;
    }
  }

  // 3. Sparse Identity Fields (passport_number & national_id)
  // CRITICAL RULE: In create mode, empty strings MUST NOT be sent (sparse index collision protection).
  const rawPassport = frontendGuest.passport_number !== undefined
    ? frontendGuest.passport_number
    : (frontendGuest.passportNumber !== undefined ? frontendGuest.passportNumber : frontendGuest.passport);

  if (rawPassport !== undefined) {
    const cleanPassport = String(rawPassport || '').trim().toUpperCase();
    if (cleanPassport) {
      payload.passport_number = cleanPassport;
    } else if (isUpdate) {
      payload.passport_number = null;
    }
  }

  const rawNationalId = frontendGuest.national_id !== undefined
    ? frontendGuest.national_id
    : (frontendGuest.nationalId !== undefined ? frontendGuest.nationalId : frontendGuest.cnic);

  if (rawNationalId !== undefined) {
    const cleanNationalId = String(rawNationalId || '').trim().toUpperCase();
    if (cleanNationalId) {
      payload.national_id = cleanNationalId;
    } else if (isUpdate) {
      payload.national_id = null;
    }
  }

  // 4. Address / City / Country / Nationality / Notes
  const textFields = [
    { key: 'address', val: frontendGuest.address },
    { key: 'city', val: frontendGuest.city },
    { key: 'country', val: frontendGuest.country },
    { key: 'nationality', val: frontendGuest.nationality },
    { key: 'notes', val: frontendGuest.notes },
  ];

  for (const { key, val } of textFields) {
    if (val !== undefined) {
      const cleanVal = String(val || '').trim();
      if (cleanVal) {
        payload[key] = cleanVal;
      } else if (isUpdate) {
        payload[key] = null;
      }
    }
  }

  // 5. Date of Birth
  const rawDob = frontendGuest.date_of_birth !== undefined
    ? frontendGuest.date_of_birth
    : (frontendGuest.dateOfBirth !== undefined ? frontendGuest.dateOfBirth : frontendGuest.dob);

  if (rawDob !== undefined) {
    const formatted = formatDateToYMD(rawDob);
    if (formatted) {
      payload.date_of_birth = formatted;
    } else if (isUpdate) {
      payload.date_of_birth = null;
    }
  }

  // 6. VIP Status
  if (frontendGuest.vip_status !== undefined) {
    payload.vip_status = Boolean(frontendGuest.vip_status);
  } else if (frontendGuest.vipStatus !== undefined) {
    payload.vip_status = Boolean(frontendGuest.vipStatus);
  } else if (frontendGuest.status !== undefined) {
    payload.vip_status = String(frontendGuest.status).toUpperCase() === 'VIP';
  } else if (!isUpdate) {
    payload.vip_status = false;
  }

  return payload;
}
