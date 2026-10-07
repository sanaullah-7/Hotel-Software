/**
 * Bidirectional Billing & Financial Data Adapter
 * Normalizes backend contracts (snake_case, Mongo references) into frontend UI contracts (camelCase, flattened fields),
 * and formats frontend mutations into strict backend payloads.
 */

export function formatDateToYMD(value) {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const BACKEND_INVOICE_STATUS_MAP = {
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially Paid',
  UNPAID: 'Unpaid',
  VOIDED: 'Voided',
};

export const UI_INVOICE_STATUS_MAP = {
  Paid: 'PAID',
  'Partially Paid': 'PARTIALLY_PAID',
  Unpaid: 'UNPAID',
  Overdue: 'UNPAID',
  Voided: 'VOIDED',
};

export const BACKEND_PAYMENT_METHOD_MAP = {
  CREDIT_CARD: 'Credit Card',
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  WALLET: 'Digital Wallet',
  OTHER: 'Other',
};

export const UI_PAYMENT_METHOD_MAP = {
  'Credit Card': 'CREDIT_CARD',
  Cash: 'CASH',
  'Bank Transfer': 'BANK_TRANSFER',
  'Digital Wallet': 'WALLET',
  'Credit Card Reverse': 'CREDIT_CARD',
  Other: 'OTHER',
};

export const BACKEND_PAYMENT_STATUS_MAP = {
  COMPLETED: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export const BACKEND_REFUND_STATUS_MAP = {
  PROCESSED: 'Completed',
  PENDING: 'Pending Approval',
  FAILED: 'Rejected',
};

// ==========================================
// 1. INVOICE ADAPTERS
// ==========================================

export function toFrontendInvoice(backend) {
  if (!backend) return null;

  const guest = backend.guest_id || {};
  const folio = backend.folio_id || {};
  const reservation = folio.reservation_id || backend.reservation_id || {};

  const totalAmount = Number(backend.total_amount ?? backend.totalAmount ?? 0);
  const paidAmount = Number(backend.amount_paid ?? backend.paidAmount ?? 0);
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  // Status mapping
  let status = BACKEND_INVOICE_STATUS_MAP[backend.status] || backend.status || 'Unpaid';
  if (backend.status === 'UNPAID' && backend.due_date && new Date(backend.due_date) < new Date()) {
    status = 'Overdue';
  }

  const guestName = typeof guest === 'object' && guest.first_name
    ? `${guest.first_name} ${guest.last_name || ''}`.trim()
    : (backend.guestName || guest.name || 'Guest');

  const guestEmail = typeof guest === 'object' ? (guest.email || '') : (backend.guestEmail || '');
  const guestPhone = typeof guest === 'object' ? (guest.phone || '') : (backend.guestPhone || '');

  const bookingId = typeof reservation === 'object'
    ? (reservation.booking_ref || reservation._id || backend.bookingId || '')
    : (backend.bookingId || '');

  const roomNumber = backend.room_number || backend.roomNumber || 'Standard';

  const items = Array.isArray(backend.line_items)
    ? backend.line_items.map((item) => ({
        description: item.description || '',
        amount: Number(item.amount || 0),
        taxAmount: Number(item.tax_amount || 0),
      }))
    : (backend.items || []);

  const calculatedSubtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const calculatedTax = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const subtotal = Number(backend.subtotal ?? (calculatedSubtotal > 0 ? calculatedSubtotal : (totalAmount - calculatedTax)));
  const taxesAndFees = Number(backend.tax_total ?? backend.taxesAndFees ?? calculatedTax);

  const invoiceNum = backend.invoice_number || backend.invoiceNumber || backend._id || backend.id;

  return {
    id: invoiceNum,
    _id: backend._id,
    invoiceNumber: invoiceNum,
    folio: folio.folio_ref || folio._id || backend.folio || '',
    folioId: folio._id || backend.folio_id || '',
    bookingId,
    guestId: guest._id || backend.guest_id || '',
    guestName,
    guestEmail,
    guestPhone,
    roomNumber,
    subtotal,
    taxesAndFees,
    totalAmount,
    paidAmount,
    balanceDue,
    status,
    financialIntegrity: 'verified',
    items,
    issueDate: formatDateToYMD(backend.issue_date || backend.created_at || backend.createdAt),
    dueDate: formatDateToYMD(backend.due_date || backend.dueDate),
    createdAt: backend.created_at || backend.createdAt,
    updatedAt: backend.updated_at || backend.updatedAt,
  };
}

export function toFrontendInvoiceList(backendList) {
  if (!Array.isArray(backendList)) return [];
  return backendList.map(toFrontendInvoice).filter(Boolean);
}

export function toBackendInvoicePayload(frontend) {
  if (!frontend) return {};

  const line_items = (frontend.items || []).map((item) => ({
    description: item.description,
    amount: Number(item.amount || 0),
    tax_amount: Number(item.taxAmount || item.tax_amount || 0),
  }));

  return {
    folio_id: frontend.folioId || frontend.folio_id || undefined,
    reservation_id: frontend.bookingId || frontend.reservation_id || undefined,
    guest_id: frontend.guestId || frontend.guest_id || undefined,
    due_date: frontend.dueDate ? new Date(frontend.dueDate).toISOString() : undefined,
    line_items,
  };
}

// ==========================================
// 2. PAYMENT ADAPTERS
// ==========================================

export function toFrontendPayment(backend) {
  if (!backend) return null;

  const guest = backend.guest_id || {};
  const folio = backend.folio_id || {};
  const reservation = folio.reservation_id || {};
  const invoice = backend.invoice_id || {};

  const guestName = typeof guest === 'object' && guest.first_name
    ? `${guest.first_name} ${guest.last_name || ''}`.trim()
    : (backend.guestName || 'Guest');

  const paymentMethod = BACKEND_PAYMENT_METHOD_MAP[backend.payment_method] || backend.payment_method || 'Credit Card';
  const status = BACKEND_PAYMENT_STATUS_MAP[backend.status] || backend.status || 'Completed';

  const invoiceNumber = typeof invoice === 'object'
    ? (invoice.invoice_number || invoice._id || backend.invoiceId || '')
    : (backend.invoiceId || '');

  const invoiceId = typeof invoice === 'object'
    ? (invoice._id || backend.invoiceId || '')
    : (backend.invoiceId || '');

  const bookingId = typeof reservation === 'object'
    ? (reservation.booking_ref || reservation._id || backend.bookingId || '')
    : (backend.bookingId || '');

  const payRef = backend.payment_ref || backend.paymentId || backend._id || backend.id;

  return {
    id: payRef,
    _id: backend._id,
    paymentId: payRef,
    invoiceId,
    invoiceNumber,
    folioId: folio._id || backend.folio_id || '',
    bookingId,
    guestName,
    guestEmail: typeof guest === 'object' ? (guest.email || '') : '',
    amount: Number(backend.amount || 0),
    paymentMethod,
    transactionId: backend.transaction_id || '',
    refundedAmount: Number(backend.refunded_amount ?? backend.refundedAmount ?? 0),
    status,
    date: formatDateToYMD(backend.date || backend.created_at),
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  };
}

export function toFrontendPaymentList(backendList) {
  if (!Array.isArray(backendList)) return [];
  return backendList.map(toFrontendPayment).filter(Boolean);
}

export function toBackendPaymentPayload(frontend) {
  if (!frontend) return {};

  const payment_method = UI_PAYMENT_METHOD_MAP[frontend.paymentMethod] || 'CREDIT_CARD';

  const invoiceId = frontend._id || frontend.invoice_id || (frontend.invoiceId && /^[0-9a-fA-F]{24}$/.test(frontend.invoiceId) ? frontend.invoiceId : undefined);
  const folioId = frontend.folio_id || (frontend.folioId && /^[0-9a-fA-F]{24}$/.test(frontend.folioId) ? frontend.folioId : undefined);
  const guestId = frontend.guest_id || (frontend.guestId && /^[0-9a-fA-F]{24}$/.test(frontend.guestId) ? frontend.guestId : undefined);

  return {
    invoice_id: invoiceId,
    folio_id: folioId,
    guest_id: guestId,
    amount: Number(frontend.amount),
    payment_method,
    transaction_id: frontend.transactionId || frontend.transactionRef || frontend.transaction_id || undefined,
  };
}

// ==========================================
// 3. REFUND ADAPTERS
// ==========================================

export function toFrontendRefund(backend) {
  if (!backend) return null;

  const payment = backend.payment_id || {};
  const guest = payment.guest_id || {};
  const invoice = payment.invoice_id || {};

  const guestName = typeof guest === 'object' && guest.first_name
    ? `${guest.first_name} ${guest.last_name || ''}`.trim()
    : (backend.guestName || 'Guest');

  const status = BACKEND_REFUND_STATUS_MAP[backend.status] || backend.status || 'Completed';

  const refundMethod = payment.payment_method === 'CREDIT_CARD'
    ? 'Credit Card Reverse'
    : (payment.payment_method ? BACKEND_PAYMENT_METHOD_MAP[payment.payment_method] : 'Original Payment Method');

  const refId = backend.refund_ref || backend.refundId || backend._id || backend.id;
  const refundDate = formatDateToYMD(backend.date || backend.created_at);

  return {
    id: refId,
    _id: backend._id,
    refundId: refId,
    paymentId: payment.payment_ref || payment._id || backend.payment_id || '',
    paymentDocId: payment._id || backend.payment_id || '',
    invoiceId: typeof invoice === 'object' ? (invoice.invoice_number || invoice._id || '') : '',
    guestName,
    amount: Number(backend.amount || 0),
    reason: backend.reason || '',
    refundMethod,
    status,
    refundDate,
    date: refundDate,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  };
}

export function toFrontendRefundList(backendList) {
  if (!Array.isArray(backendList)) return [];
  return backendList.map(toFrontendRefund).filter(Boolean);
}

export function toBackendRefundPayload(frontend) {
  if (!frontend) return {};

  return {
    payment_id: frontend.paymentDocId || frontend.paymentId || frontend.payment_id,
    amount: Number(frontend.amount),
    reason: frontend.reason || frontend.notes || 'Guest Refund Request',
  };
}

// ==========================================
// 4. GUEST CHARGE ADAPTERS
// ==========================================

export const BACKEND_CHARGE_TYPE_MAP = {
  ROOM_RATE: 'Room Rate',
  RESTAURANT: 'Restaurant',
  SPA: 'Spa',
  MINIBAR: 'Minibar',
  LAUNDRY: 'Laundry',
  OTHER_SERVICE: 'Other Service',
  TAX: 'Tax',
  FEE: 'Fee',
  ROOM_SERVICE: 'Room Service',
  PARKING: 'Parking',
  MISCELLANEOUS: 'Miscellaneous',
};

export const UI_CHARGE_TYPE_MAP = {
  'Room Rate': 'ROOM_RATE',
  'Restaurant': 'RESTAURANT',
  'Spa': 'SPA',
  'Minibar': 'MINIBAR',
  'Laundry': 'LAUNDRY',
  'Other Service': 'OTHER_SERVICE',
  'Other': 'OTHER_SERVICE',
  'Tax': 'TAX',
  'Fee': 'FEE',
  'Room Service': 'ROOM_SERVICE',
  'Parking': 'PARKING',
  'Miscellaneous': 'MISCELLANEOUS',
  'Consumption': 'MINIBAR',
  'Damage': 'MISCELLANEOUS',
  'External Order': 'OTHER_SERVICE',
};

export function toFrontendGuestCharge(backend) {
  if (!backend) return null;

  const rawType = backend.charge_type || '';
  const displayType = BACKEND_CHARGE_TYPE_MAP[rawType] || rawType;

  return {
    id: backend._id,
    _id: backend._id,
    chargeType: rawType,
    chargeTypeDisplay: displayType,
    category: displayType,
    description: backend.description,
    amount: Number(backend.amount || 0),
    date: formatDateToYMD(backend.date || backend.created_at),
    isVoided: Boolean(backend.is_voided),
    folioId: backend.folio_id?._id || backend.folio_id || '',
    guestId: backend.folio_id?.guest_id?._id || backend.folio_id?.guest_id || '',
    bookingId: backend.folio_id?.reservation_id?.booking_ref || backend.folio_id?.reservation_id || '',
    createdAt: backend.created_at,
  };
}

export function toFrontendGuestChargeList(backendList) {
  if (!Array.isArray(backendList)) return [];
  return backendList.map(toFrontendGuestCharge).filter(Boolean);
}

export function toBackendGuestChargePayload(frontend) {
  if (!frontend) return {};

  const inputType = frontend.chargeType || frontend.charge_type || 'OTHER_SERVICE';
  const charge_type = UI_CHARGE_TYPE_MAP[inputType] || inputType.toUpperCase().replace(/\s+/g, '_');

  return {
    folio_id: frontend.folioId || frontend.folio_id,
    charge_type,
    description: frontend.description,
    amount: Number(frontend.amount),
    date: frontend.date ? new Date(frontend.date).toISOString() : undefined,
    reference_id: frontend.referenceId || frontend.reference_id || undefined,
  };
}
