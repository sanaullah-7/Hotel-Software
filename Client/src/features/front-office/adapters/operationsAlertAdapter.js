/**
 * Bidirectional Operations Alert Adapter
 * Translates between Backend MongoDB OperationsAlert contracts and Frontend UI models.
 */

export const CANONICAL_BACKEND_DEPARTMENTS = [
  'VIP_ARRIVALS',
  'HOUSEKEEPING',
  'MAINTENANCE',
  'FOOD_AND_BEVERAGE',
  'SECURITY_FRONT_DESK',
  'GENERAL',
];

export const BACKEND_TO_UI_DEPARTMENT_MAP = {
  VIP_ARRIVALS: 'VIP Arrivals',
  HOUSEKEEPING: 'Housekeeping',
  MAINTENANCE: 'Maintenance',
  FOOD_AND_BEVERAGE: 'Dining & F&B',
  SECURITY_FRONT_DESK: 'Security & Front Desk',
  GENERAL: 'General',
};

export const UI_TO_BACKEND_DEPARTMENT_MAP = {
  'VIP Arrivals': 'VIP_ARRIVALS',
  'vip arrivals': 'VIP_ARRIVALS',
  'VIP_ARRIVALS': 'VIP_ARRIVALS',
  'Housekeeping': 'HOUSEKEEPING',
  'housekeeping': 'HOUSEKEEPING',
  'HOUSEKEEPING': 'HOUSEKEEPING',
  'Maintenance': 'MAINTENANCE',
  'maintenance': 'MAINTENANCE',
  'MAINTENANCE': 'MAINTENANCE',
  'Dining & F&B': 'FOOD_AND_BEVERAGE',
  'dining & f&b': 'FOOD_AND_BEVERAGE',
  'Dining': 'FOOD_AND_BEVERAGE',
  'F&B': 'FOOD_AND_BEVERAGE',
  'FOOD_AND_BEVERAGE': 'FOOD_AND_BEVERAGE',
  'Security & Front Desk': 'SECURITY_FRONT_DESK',
  'security & front desk': 'SECURITY_FRONT_DESK',
  'Security': 'SECURITY_FRONT_DESK',
  'Front Desk': 'SECURITY_FRONT_DESK',
  'SECURITY_FRONT_DESK': 'SECURITY_FRONT_DESK',
  'General': 'GENERAL',
  'general': 'GENERAL',
  'GENERAL': 'GENERAL',
};

export const CANONICAL_BACKEND_SEVERITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
];

export const BACKEND_TO_UI_SEVERITY_MAP = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const UI_TO_BACKEND_SEVERITY_MAP = {
  Low: 'LOW',
  low: 'LOW',
  LOW: 'LOW',
  Medium: 'MEDIUM',
  medium: 'MEDIUM',
  MEDIUM: 'MEDIUM',
  High: 'HIGH',
  high: 'HIGH',
  HIGH: 'HIGH',
  Critical: 'CRITICAL',
  critical: 'CRITICAL',
  CRITICAL: 'CRITICAL',
  Urgent: 'CRITICAL',
  urgent: 'CRITICAL',
};

export const CANONICAL_BACKEND_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
];

export const BACKEND_TO_UI_STATUS_MAP = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export const UI_TO_BACKEND_STATUS_MAP = {
  Open: 'OPEN',
  open: 'OPEN',
  OPEN: 'OPEN',
  'In Progress': 'IN_PROGRESS',
  'in progress': 'IN_PROGRESS',
  IN_PROGRESS: 'IN_PROGRESS',
  Resolved: 'RESOLVED',
  resolved: 'RESOLVED',
  RESOLVED: 'RESOLVED',
};

const PROTECTED_FIELDS = [
  '_id',
  'alert_ref',
  'created_at',
  'updated_at',
  'resolved_at',
  'created_by',
  'is_active',
  'hotelId',
  'tenantId',
  '__v',
];

/**
 * Normalizes department from backend enum to frontend UI string.
 * @param {string} department
 * @returns {string}
 */
export function toFrontendDepartment(department) {
  if (!department) return 'General';
  const upper = String(department).trim().toUpperCase();
  return BACKEND_TO_UI_DEPARTMENT_MAP[upper] || 'General';
}

/**
 * Normalizes department from frontend string to canonical backend enum.
 * @param {string} department
 * @returns {string}
 */
export function toBackendDepartment(department) {
  if (!department) return 'GENERAL';
  const trimmed = String(department).trim();
  if (CANONICAL_BACKEND_DEPARTMENTS.includes(trimmed.toUpperCase())) {
    return trimmed.toUpperCase();
  }
  return UI_TO_BACKEND_DEPARTMENT_MAP[trimmed] || 'GENERAL';
}

/**
 * Normalizes severity/priority from backend enum to frontend display string.
 * @param {string} severity
 * @returns {string}
 */
export function toFrontendSeverity(severity) {
  if (!severity) return 'High';
  const upper = String(severity).trim().toUpperCase();
  return BACKEND_TO_UI_SEVERITY_MAP[upper] || 'High';
}

/**
 * Normalizes severity/priority from frontend string to canonical backend enum.
 * @param {string} severity
 * @returns {string}
 */
export function toBackendSeverity(severity) {
  if (!severity) return 'HIGH';
  const trimmed = String(severity).trim();
  const upper = trimmed.toUpperCase();
  if (CANONICAL_BACKEND_SEVERITIES.includes(upper)) {
    return upper;
  }
  return UI_TO_BACKEND_SEVERITY_MAP[trimmed] || 'HIGH';
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
 * Explicitly ignores legacy 'Assigned' status.
 * @param {string} status
 * @returns {string|undefined}
 */
export function toBackendStatus(status) {
  if (!status) return undefined;
  const trimmed = String(status).trim();
  // Discard legacy 'Assigned' status explicitly
  if (trimmed.toLowerCase() === 'assigned') {
    return undefined;
  }
  const upper = trimmed.toUpperCase();
  if (CANONICAL_BACKEND_STATUSES.includes(upper)) {
    return upper;
  }
  return UI_TO_BACKEND_STATUS_MAP[trimmed] || undefined;
}

/**
 * Formats a Date/timestamp into human-readable UI format (e.g. "6:00 PM (Jul 24, 2025)").
 * @param {string|Date|number} dateValue
 * @returns {string}
 */
export function formatTimeDisplay(dateValue) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return '';
  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${timeStr} (${dateStr})`;
}

/**
 * Computes a human-friendly relative time string (e.g. "5 mins ago", "Just now").
 * @param {string|Date|number} dateValue
 * @returns {string}
 */
export function formatReportedAgo(dateValue) {
  if (!dateValue) return 'Just now';
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return 'Just now';
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return 'Just now';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}

/**
 * Transforms a backend MongoDB OperationsAlert document into the frontend UI model.
 * Preserves canonical identifiers and maps fields safely.
 *
 * @param {Object} backendAlert - Raw MongoDB alert document or API response
 * @returns {Object|null} Frontend operations alert model
 */
export function toFrontendOperationsAlert(backendAlert) {
  if (!backendAlert || typeof backendAlert !== 'object') {
    return null;
  }

  // Handle wrapped API responses like { alert: { ... } }
  const raw = backendAlert.alert && typeof backendAlert.alert === 'object'
    ? backendAlert.alert
    : backendAlert;

  const rawId = raw._id || raw.id || '';
  const alertRef = raw.alert_ref || raw.alertRef || '';
  const displayId = alertRef || rawId;

  const uiDept = toFrontendDepartment(raw.department);
  const uiSeverity = toFrontendSeverity(raw.severity);
  const uiStatus = toFrontendStatus(raw.status);

  const createdAt = raw.created_at || raw.createdAt || '';
  const timeDisplay = formatTimeDisplay(createdAt);
  const reportedAgo = formatReportedAgo(createdAt);

  const defaultLocation = 'Front Desk Broadcast';
  const location = (raw.location && String(raw.location).trim()) || defaultLocation;

  const defaultGuest = 'Multiple/None';
  const guest = (raw.guest_name && String(raw.guest_name).trim()) || defaultGuest;

  const reportedBy = (raw.reported_by && String(raw.reported_by).trim()) || 'Front Office';
  const description = raw.message || raw.description || '';
  const action = (raw.action_required && String(raw.action_required).trim()) || 'Acknowledge and proceed as instructed.';
  const assignedTo = (raw.assigned_to && String(raw.assigned_to).trim()) || `${uiDept} Team`;

  return {
    id: displayId,
    _id: rawId,
    alert_ref: alertRef,
    alertRef,
    title: raw.title || '',

    // Department & classification
    department: uiDept,
    rawDepartment: raw.department || 'GENERAL',
    type: raw.type || raw.department || 'GENERAL',

    // Urgency & Status
    priority: uiSeverity,
    severity: uiSeverity,
    rawSeverity: raw.severity || 'HIGH',
    status: uiStatus,
    rawStatus: raw.status || 'OPEN',
    is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : (uiStatus !== 'Resolved'),

    // Operational Context
    time: timeDisplay,
    location,
    guest,
    guest_name: raw.guest_name || null,
    reportedBy,
    reported_by: reportedBy,
    reportedAgo,
    description,
    message: description,
    action,
    action_required: raw.action_required || null,
    assignedTo,
    assigned_to: raw.assigned_to || null,

    // Lifecycle timestamps
    expires_at: raw.expires_at || null,
    resolved_at: raw.resolved_at || null,
    created_at: createdAt,
    updated_at: raw.updated_at || raw.updatedAt || '',

    raw,
  };
}

/**
 * Transforms an array or paginated response of backend OperationsAlert documents into frontend view models.
 * @param {Array|Object} alertsResponse - Array of alerts or API response envelope
 * @returns {Array} Array of frontend operations alert view models
 */
export function toFrontendOperationsAlertList(alertsResponse) {
  if (!alertsResponse) return [];

  const rawList = Array.isArray(alertsResponse)
    ? alertsResponse
    : (Array.isArray(alertsResponse.alerts)
      ? alertsResponse.alerts
      : (Array.isArray(alertsResponse.data) ? alertsResponse.data : []));

  return rawList
    .map((item) => toFrontendOperationsAlert(item))
    .filter(Boolean);
}

/**
 * Builds a clean backend payload for POST /api/v1/hotel/operations-alerts or PATCH /api/v1/hotel/operations-alerts/:id.
 * Strips backend-owned/immutable fields and maps frontend fields to canonical backend contracts.
 *
 * @param {Object} frontendData - Form data or mutation payload
 * @param {Object} [options={}] - Mutation options ({ isUpdate: boolean })
 * @returns {Object} Clean backend payload
 */
export function toBackendOperationsAlertPayload(frontendData, options = {}) {
  if (!frontendData || typeof frontendData !== 'object' || Array.isArray(frontendData) || Object.keys(frontendData).length === 0) {
    return {};
  }

  const isUpdate = Boolean(options.isUpdate);
  const payload = {};

  // Title
  if (frontendData.title !== undefined) {
    const trimmedTitle = String(frontendData.title || '').trim();
    if (trimmedTitle || !isUpdate) {
      payload.title = trimmedTitle;
    }
  }

  // Message / Description
  const rawMsg = frontendData.message !== undefined
    ? frontendData.message
    : frontendData.description;
  if (rawMsg !== undefined) {
    const trimmedMsg = String(rawMsg || '').trim();
    if (trimmedMsg || !isUpdate) {
      payload.message = trimmedMsg;
    }
  }

  // Department
  if (frontendData.department !== undefined) {
    payload.department = toBackendDepartment(frontendData.department);
  } else if (!isUpdate) {
    payload.department = 'GENERAL';
  }

  // Type (optional)
  if (frontendData.type !== undefined) {
    const trimmedType = String(frontendData.type || '').trim();
    if (trimmedType) {
      payload.type = trimmedType;
    }
  }

  // Severity / Priority
  const rawSev = frontendData.severity !== undefined
    ? frontendData.severity
    : frontendData.priority;
  if (rawSev !== undefined) {
    payload.severity = toBackendSeverity(rawSev);
  } else if (!isUpdate) {
    payload.severity = 'HIGH';
  }

  // Status
  if (frontendData.status !== undefined) {
    const canonicalStatus = toBackendStatus(frontendData.status);
    if (canonicalStatus) {
      payload.status = canonicalStatus;
    }
  } else if (!isUpdate) {
    payload.status = 'OPEN';
  }

  // Action Required
  const rawAction = frontendData.action_required !== undefined
    ? frontendData.action_required
    : frontendData.action;
  if (rawAction !== undefined) {
    payload.action_required = rawAction ? String(rawAction).trim() : null;
  }

  // Location
  if (frontendData.location !== undefined) {
    payload.location = frontendData.location ? String(frontendData.location).trim() : null;
  }

  // Guest Name
  const rawGuest = frontendData.guest_name !== undefined
    ? frontendData.guest_name
    : frontendData.guest;
  if (rawGuest !== undefined) {
    payload.guest_name = rawGuest ? String(rawGuest).trim() : null;
  }

  // Reported By
  const rawReporter = frontendData.reported_by !== undefined
    ? frontendData.reported_by
    : frontendData.reportedBy;
  if (rawReporter !== undefined) {
    payload.reported_by = rawReporter ? String(rawReporter).trim() : null;
  }

  // Assigned To
  const rawAssignee = frontendData.assigned_to !== undefined
    ? frontendData.assigned_to
    : frontendData.assignedTo;
  if (rawAssignee !== undefined) {
    payload.assigned_to = rawAssignee ? String(rawAssignee).trim() : null;
  }

  // Expiration
  if (frontendData.expires_at !== undefined) {
    payload.expires_at = frontendData.expires_at ? new Date(frontendData.expires_at) : null;
  }

  // Strictly strip protected / backend-owned fields
  for (const field of PROTECTED_FIELDS) {
    delete payload[field];
  }

  return payload;
}
