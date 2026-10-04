import { addAuditLog } from '../../audit/state/auditStore.js';
import { INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_REFUNDS } from '../data/paymentBillingDemoData.js';
import { getReservations } from '../../reservations/state/reservationStore.js';
import { getGuestCharges, updateGuestCharge } from '../../inventory/pages/inventoryStore.js';
import { getRoomById } from '../../rooms/state/roomStore.js';
import { normalizeBookingStatus, parseStayDate } from '../../reservations/state/bookingRules.js';

export { INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_REFUNDS };

const STORAGE_KEYS = {
  INVOICES: 'hm_invoices_v2',
  PAYMENTS: 'hm_payments_v2',
  REFUNDS: 'hm_refunds_v2',
};

export const INVOICES_UPDATED_EVENT = 'invoices_update';
export const PAYMENTS_UPDATED_EVENT = 'payments_update';
export const REFUNDS_UPDATED_EVENT = 'refunds_update';

export const INVOICE_UPDATED_EVENT = INVOICES_UPDATED_EVENT;
export const PAYMENT_UPDATED_EVENT = PAYMENTS_UPDATED_EVENT;
export const REFUND_UPDATED_EVENT = REFUNDS_UPDATED_EVENT;

export function dispatchFinancialEvent(eventName, detail = {}) {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      const event = typeof CustomEvent === 'function'
        ? new CustomEvent(eventName, { detail })
        : new Event(eventName);
      window.dispatchEvent(event);
    } catch {
      try {
        window.dispatchEvent(new Event(eventName));
      } catch {}
    }
  }
}

// Invoices CRUD
export const getInvoices = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    const invoices = JSON.parse(raw);
    if (!Array.isArray(invoices)) return [];
    const bookings = getReservations();
    let changed = false;
    const migrated = invoices.map((invoice) => {
      if (!invoice.bookingId) return invoice;
      const matches = bookings.filter((booking) =>
        booking.bookingId && String(booking.bookingId) === String(invoice.bookingId)
      );
      if (matches.length !== 1) return invoice;
      changed = true;
      return { ...invoice, bookingId: matches[0].id };
    });
    if (changed) localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
};

export const saveInvoices = (invoices, options = {}) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  if (!options?.silent) {
    dispatchFinancialEvent(INVOICES_UPDATED_EVENT, {
      domain: 'invoices',
      action: options?.action || 'save',
      count: Array.isArray(invoices) ? invoices.length : 0,
      ...options?.detail,
    });
  }
};

const successfulPayment = (payment) => ['completed', 'partially refunded', 'refunded'].includes(String(payment.status || '').toLowerCase());
const completedRefund = (refund) => String(refund.status || '').toLowerCase() === 'completed';

export function getInvoiceFinancialState(invoiceId) {
  const invoice = getInvoices().find((item) => String(item.id || item.invoiceNumber) === String(invoiceId));
  if (!invoice) return { integrity: 'unresolved', reason: 'Invoice not found.', effectivePaid: null, due: null };
  const payments = getPayments().filter((payment) => String(payment.invoiceId || payment.invoiceNumber) === String(invoice.id || invoice.invoiceNumber));
  const refunds = getRefunds();
  let conflict = '';
  if (!payments.length && Number(invoice.paidAmount || 0) > 0) conflict = 'Invoice records paid funds without canonical payment ledger entries.';
  for (const payment of payments) {
    const linkedRefunds = refunds.filter((refund) => String(refund.paymentId) === String(payment.id || payment.paymentId));
    const refunded = linkedRefunds.filter(completedRefund).reduce((sum, refund) => sum + Number(refund.amount ?? refund.refundAmount ?? 0), 0);
    if (Math.abs(refunded - Number(payment.refundedAmount || 0)) > 0.01) conflict ||= `Refund ledger does not agree with payment ${payment.id || payment.paymentId}.`;
    if (payment.bookingId && invoice.bookingId && String(payment.bookingId) !== String(invoice.bookingId)) conflict ||= `Payment ${payment.id || payment.paymentId} links to a different booking.`;
  }
  const grossPaid = payments.filter(successfulPayment).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const effectiveRefunds = payments.filter(successfulPayment).reduce((sum, payment) => {
    const linkedId = payment.id || payment.paymentId;
    return sum + refunds.filter((refund) => String(refund.paymentId) === String(linkedId) && completedRefund(refund))
      .reduce((refundSum, refund) => refundSum + Number(refund.amount ?? refund.refundAmount ?? 0), 0);
  }, 0);
  const effectivePaid = Math.max(0, grossPaid - effectiveRefunds);
  const due = Number(invoice.totalAmount || 0) - effectivePaid;
  if (Math.abs(Number(invoice.paidAmount || 0) - effectivePaid) > 0.01) conflict ||= 'Invoice paid snapshot does not agree with payments and completed refunds.';
  if (Math.abs(Number(invoice.balanceDue || 0) - due) > 0.01) conflict ||= 'Invoice balance snapshot does not agree with payments and completed refunds.';
  return conflict
    ? { integrity: 'unresolved', reason: conflict, effectivePaid: null, due: null }
    : { integrity: 'verified', reason: '', effectivePaid, due: Math.max(0, due) };
}

export const getInvoiceWithFinancialState = (invoice) => {
  const state = getInvoiceFinancialState(invoice.id || invoice.invoiceNumber);
  return { ...invoice,
    ...(state.integrity === 'verified' ? { paidAmount: state.effectivePaid, balanceDue: state.due } : {}),
    financialIntegrity: state.integrity, financialIssue: state.reason, effectivePaid: state.effectivePaid, effectiveDue: state.due };
};

export const addInvoice = (newInvoice) => {
  const invoices = getInvoices();
  const nextNum = invoices.length + 1;
  const idStr = String(nextNum).padStart(3, '0');
  const invoiceId = `INV-2026-${idStr}`;

  const subtotal = Number(newInvoice.subtotal) || 0;
  const discount = Number(newInvoice.discount) || 0;
  const taxesAndFees = Number(newInvoice.taxesAndFees) || Number(newInvoice.tax) || 0;
  const total = Number(newInvoice.totalAmount) || Math.max(0, subtotal - discount + taxesAndFees);
  const paid = Number(newInvoice.paidAmount) || 0;
  const balance = Math.max(0, total - paid);

  let status = newInvoice.status || 'Unpaid';
  if (paid >= total && total > 0) status = 'Paid';
  else if (paid > 0 && balance > 0) status = 'Partially Paid';

  const invoiceWithId = {
    id: invoiceId,
    invoiceNumber: invoiceId,
    guestName: newInvoice.guestName || 'Guest',
    guestEmail: newInvoice.guestEmail || '',
    guestPhone: newInvoice.guestPhone || '',
    bookingId: newInvoice.bookingId || '',
    roomNumber: newInvoice.roomNumber || '101',
    roomType: newInvoice.roomType || 'Standard Room',
    checkIn: newInvoice.checkIn || new Date().toISOString().split('T')[0],
    checkOut: newInvoice.checkOut || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    issueDate: newInvoice.issueDate || new Date().toISOString().split('T')[0],
    dueDate: newInvoice.dueDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: newInvoice.currency || 'USD',
    subtotal,
    discount,
    taxesAndFees,
    tax: taxesAndFees,
    totalAmount: total,
    paidAmount: paid,
    balanceDue: balance,
    status,
    notes: newInvoice.notes || '',
    items: newInvoice.items || [],
    payments: newInvoice.payments || [],
  };

  const updated = [invoiceWithId, ...invoices];
  saveInvoices(updated, { action: 'create', detail: { invoiceId: invoiceWithId.id, bookingId: invoiceWithId.bookingId } });
  try { addAuditLog({ module: 'Payment & Billing', action: 'Created Invoice', recordId: invoiceWithId.invoiceNumber, description: `Invoice ${invoiceWithId.invoiceNumber} created.`, importance: 'Important' }); } catch(e) {}
  return updated;
};

export const updateInvoice = (invoiceId, updatedFields) => {
  const invoices = getInvoices();
  const updated = invoices.map((inv) => {
    if (inv.id === invoiceId || inv.invoiceNumber === invoiceId) {
      const merged = { ...inv, ...updatedFields };
      const total = Number(merged.totalAmount);
      const paid = Number(merged.paidAmount);
      merged.balanceDue = Math.max(0, total - paid);
      if (merged.balanceDue === 0 && total > 0) merged.status = 'Paid';
      else if (paid > 0 && merged.balanceDue > 0) merged.status = 'Partially Paid';
      return merged;
    }
    return inv;
  });
  saveInvoices(updated, { action: 'update', detail: { invoiceId } });
  try { addAuditLog({ module: 'Payment & Billing', action: 'Updated Invoice', recordId: invoiceId, description: `Invoice ${invoiceId} updated.`, importance: 'Normal' }); } catch(e) {}
  return updated;
};

export const deleteInvoice = (invoiceId) => {
  const invoices = getInvoices();
  const updated = invoices.filter((inv) => inv.id !== invoiceId && inv.invoiceNumber !== invoiceId);
  saveInvoices(updated, { action: 'delete', detail: { invoiceId } });
  return updated;
};

// Record a Payment against an Invoice
export const recordInvoicePayment = (firstArg, secondArg) => {
  let invoiceId = '';
  let paymentDetails = {};

  if (typeof firstArg === 'string') {
    invoiceId = firstArg;
    paymentDetails = secondArg || {};
  } else if (typeof firstArg === 'object' && firstArg !== null) {
    paymentDetails = firstArg;
    invoiceId = firstArg.invoiceId || firstArg.invoiceNumber;
  }

  if (!invoiceId || !String(invoiceId).trim()) {
    throw new Error('A valid invoiceId is required to record a payment.');
  }

  const amount = Number(paymentDetails.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Payment amount must be greater than 0.');
  }

  const invoices = getInvoices();
  const targetInvoice = invoices.find((inv) => inv.id === invoiceId || inv.invoiceNumber === invoiceId);

  if (!targetInvoice) {
    throw new Error(`Invoice with ID ${invoiceId} was not found.`);
  }

  const financialState = getInvoiceFinancialState(targetInvoice.id || targetInvoice.invoiceNumber);
  if (financialState.integrity !== 'verified') throw new Error(`Payment cannot be recorded: ${financialState.reason}`);
  if (amount > financialState.due + 0.001) {
    throw new Error(`Payment amount of $${amount.toFixed(2)} exceeds remaining balance due of $${financialState.due.toFixed(2)}.`);
  }

  const payments = getPayments();
  let candidateNum = payments.length + 1;
  let paymentId = `PAY-2026-${String(candidateNum).padStart(3, '0')}`;
  while (payments.some((p) => p && (String(p.id) === paymentId || String(p.paymentId) === paymentId))) {
    candidateNum += 1;
    paymentId = `PAY-2026-${String(candidateNum).padStart(3, '0')}`;
  }

  const newPaymentRecord = {
    id: paymentId,
    paymentId,
    invoiceId: targetInvoice.id,
    invoiceNumber: targetInvoice.id,
    bookingId: targetInvoice.bookingId,
    guestName: targetInvoice.guestName,
    guestEmail: targetInvoice.guestEmail,
    guestPhone: targetInvoice.guestPhone,
    roomNumber: targetInvoice.roomNumber,
    roomType: targetInvoice.roomType,
    paymentDate: paymentDetails.date || paymentDetails.paymentDate || new Date().toISOString().replace('T', ' ').slice(0, 16),
    amount,
    refundedAmount: 0.00,
    currency: targetInvoice.currency || 'USD',
    paymentMethod: paymentDetails.paymentMethod || 'Credit Card',
    transactionRef: paymentDetails.transactionRef || `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    gateway: paymentDetails.gateway || 'Front Desk POS Terminal',
    status: 'Completed',
    cashier: paymentDetails.cashier || paymentDetails.recordedBy || 'Front Desk Staff',
    recordedBy: paymentDetails.recordedBy || paymentDetails.cashier || 'Front Desk Staff',
    notes: paymentDetails.notes || '',
  };

  // 1. Update Invoice
  const newPaid = Number((financialState.effectivePaid + amount).toFixed(2));
  const rawBalance = Number((Number(targetInvoice.totalAmount) - newPaid).toFixed(2));
  const newBalance = rawBalance <= 0.001 ? 0 : rawBalance;
  let nextStatus = 'Partially Paid';
  if (newBalance === 0) nextStatus = 'Paid';

  let updatedTargetInvoice = null;
  const updatedInvoices = invoices.map((inv) => {
    if (inv.id === targetInvoice.id || inv.invoiceNumber === targetInvoice.id) {
      updatedTargetInvoice = {
        ...inv,
        paidAmount: newPaid,
        balanceDue: newBalance,
        status: nextStatus,
        payments: [
          ...(inv.payments || []),
          {
            paymentId,
            paymentDate: newPaymentRecord.paymentDate,
            amount,
            paymentMethod: newPaymentRecord.paymentMethod,
            transactionRef: newPaymentRecord.transactionRef,
            recordedBy: newPaymentRecord.recordedBy,
          },
        ],
      };
      return updatedTargetInvoice;
    }
    return inv;
  });

  // 2. Update Payments ledger
  const updatedPayments = [newPaymentRecord, ...payments];

  // Capture snapshots for safe rollback if any storage write fails
  const prevInvoicesRaw = localStorage.getItem(STORAGE_KEYS.INVOICES);
  const prevPaymentsRaw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);

  try {
    saveInvoices(updatedInvoices, { silent: true });
    savePayments(updatedPayments, { silent: true });
  } catch (persistErr) {
    // Safe recovery: rollback to pre-operation snapshots
    try {
      if (prevInvoicesRaw !== null) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, prevInvoicesRaw);
      } else {
        localStorage.removeItem(STORAGE_KEYS.INVOICES);
      }
      if (prevPaymentsRaw !== null) {
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, prevPaymentsRaw);
      } else {
        localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      }
    } catch {}
    throw new Error(`Payment persistence failed and was rolled back: ${persistErr.message || 'Storage write error'}`, { cause: persistErr });
  }

  dispatchFinancialEvent(INVOICES_UPDATED_EVENT, {
    domain: 'invoices',
    action: 'record_payment',
    invoiceId: targetInvoice.id,
    bookingId: targetInvoice.bookingId,
    amount,
    status: nextStatus,
  });
  dispatchFinancialEvent(PAYMENTS_UPDATED_EVENT, {
    domain: 'payments',
    action: 'record_payment',
    paymentId: newPaymentRecord.id,
    invoiceId: targetInvoice.id,
    bookingId: targetInvoice.bookingId,
    amount,
  });

  // Synchronize reservation payment status in hotel_reservations
  if (targetInvoice.bookingId) {
    try {
      const rawBookings = localStorage.getItem('hotel_reservations');
      if (rawBookings) {
        const bookingsList = JSON.parse(rawBookings);
        if (Array.isArray(bookingsList)) {
          const updatedBookingsList = bookingsList.map((b) => {
            if (String(b.id) === String(targetInvoice.bookingId) || String(b.bookingId) === String(targetInvoice.bookingId)) {
              return { ...b, payment: nextStatus };
            }
            return b;
          });
          localStorage.setItem('hotel_reservations', JSON.stringify(updatedBookingsList));
          window.dispatchEvent(new Event('reservations_update'));
        }
      }
    } catch {}
  }

  try {
    addAuditLog({
      module: 'Payment & Billing',
      action: 'Recorded Payment',
      recordId: targetInvoice.id,
      description: `Payment of $${amount.toFixed(2)} recorded for invoice ${targetInvoice.id} (${nextStatus}).`,
      importance: 'Important',
    });
  } catch {}

  return {
    updatedInvoices,
    updatedPayments,
    newPayment: newPaymentRecord,
    updatedInvoice: updatedTargetInvoice,
  };
};

// Payments CRUD
export const getPayments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    const payments = JSON.parse(raw);
    if (!Array.isArray(payments)) return [];
    const invoices = getInvoices();
    let changed = false;
    const migrated = payments.map((payment) => {
      const invoiceMatches = invoices.filter((invoice) =>
        String(invoice.id) === String(payment.invoiceId || payment.invoiceNumber || '')
      );
      if (invoiceMatches.length !== 1 || !invoiceMatches[0].bookingId) return payment;
      if (String(payment.bookingId || '') === String(invoiceMatches[0].bookingId)) return payment;
      changed = true;
      return { ...payment, bookingId: invoiceMatches[0].bookingId };
    });
    if (changed) localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
};

export const savePayments = (payments, options = {}) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  if (!options?.silent) {
    dispatchFinancialEvent(PAYMENTS_UPDATED_EVENT, {
      domain: 'payments',
      action: options?.action || 'save',
      count: Array.isArray(payments) ? payments.length : 0,
      ...options?.detail,
    });
  }
};

export const deletePayment = (paymentId) => {
  const payments = getPayments();
  const updated = payments.filter((p) => p.id !== paymentId && p.paymentId !== paymentId);
  savePayments(updated, { action: 'delete', detail: { paymentId } });
  return updated;
};

// Refunds CRUD
export const getRefunds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REFUNDS);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(INITIAL_REFUNDS));
      return INITIAL_REFUNDS;
    }
    const refunds = JSON.parse(raw);
    return Array.isArray(refunds) ? refunds : [];
  } catch {
    return [];
  }
};

export const saveRefunds = (refunds, options = {}) => {
  localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));
  if (!options?.silent) {
    dispatchFinancialEvent(REFUNDS_UPDATED_EVENT, {
      domain: 'refunds',
      action: options?.action || 'save',
      count: Array.isArray(refunds) ? refunds.length : 0,
      ...options?.detail,
    });
  }
};

export const processRefund = (refundData) => {
  const rawPaymentId = refundData.paymentId;
  if (!rawPaymentId || !String(rawPaymentId).trim()) {
    throw new Error('A valid paymentId is required to process a refund.');
  }

  const payments = getPayments();
  const cleanPaymentId = String(rawPaymentId).trim();
  const targetPayment = payments.find(
    (p) => p && (String(p.id).trim() === cleanPaymentId || String(p.paymentId).trim() === cleanPaymentId)
  );
  if (!targetPayment) throw new Error(`Payment with ID "${rawPaymentId}" was not found.`);

  const invoices = getInvoices();
  const invoice = invoices.find(
    (item) => String(item.id || item.invoiceNumber) === String(targetPayment.invoiceId || targetPayment.invoiceNumber)
  );
  if (!invoice) throw new Error('The payment has no matching invoice.');

  // Prevent cross-invoice contamination
  if (refundData.invoiceId && String(refundData.invoiceId).trim() !== String(targetPayment.invoiceId || targetPayment.invoiceNumber).trim()) {
    throw new Error('Refund cannot cross invoices: provided invoiceId does not match the payment invoice.');
  }

  const financialState = getInvoiceFinancialState(invoice.id || invoice.invoiceNumber);
  if (financialState.integrity !== 'verified') throw new Error(`Refund cannot be processed: ${financialState.reason}`);

  const amount = Number(refundData.amount ?? refundData.refundAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Refund amount must be greater than 0.');
  }

  // Calculate remaining refundable amount from canonical completed refunds in ledger
  const refunds = getRefunds();
  const completedAlready = refunds
    .filter((refund) => String(refund.paymentId) === String(targetPayment.id || targetPayment.paymentId) && completedRefund(refund))
    .reduce((sum, refund) => sum + Number(refund.amount ?? refund.refundAmount ?? 0), 0);

  const maxRefundable = Number((Number(targetPayment.amount || 0) - completedAlready).toFixed(2));
  if (amount > maxRefundable + 0.001) {
    throw new Error(`Refund amount $${amount.toFixed(2)} exceeds maximum refundable amount of $${Math.max(0, maxRefundable).toFixed(2)}.`);
  }

  if (amount > Number(targetPayment.amount || 0) + 0.001) {
    throw new Error(`Refund amount $${amount.toFixed(2)} exceeds original payment amount of $${Number(targetPayment.amount || 0).toFixed(2)}.`);
  }

  let candidateNum = refunds.length + 1;
  let refundId = `REF-2026-${String(candidateNum).padStart(3, '0')}`;
  while (refunds.some((r) => r && (String(r.id) === refundId || String(r.refundId) === refundId))) {
    candidateNum += 1;
    refundId = `REF-2026-${String(candidateNum).padStart(3, '0')}`;
  }

  const newRefund = {
    id: refundId,
    refundId,
    paymentId: targetPayment.id || targetPayment.paymentId,
    invoiceId: targetPayment.invoiceId || '',
    invoiceNumber: targetPayment.invoiceId || '',
    guestName: refundData.guestName || targetPayment?.guestName || 'Guest',
    bookingId: targetPayment.bookingId || '',
    roomNumber: targetPayment?.roomNumber || refundData.roomNumber || 'N/A',
    roomType: targetPayment?.roomType || refundData.roomType || 'Standard',
    refundDate: refundData.date || refundData.refundDate || new Date().toISOString().split('T')[0],
    amount,
    refundAmount: amount,
    currency: refundData.currency || targetPayment?.currency || 'USD',
    reason: refundData.reason || 'Booking Cancellation',
    refundMethod: refundData.refundMethod || 'Original Payment Method',
    status: refundData.status || 'Completed',
    processedBy: refundData.processedBy || 'Manager - David',
    notes: refundData.notes || '',
  };

  const updatedRefunds = [newRefund, ...refunds];
  let updatedPayments = payments;
  let updatedInvoices = invoices;
  let updatedTargetPayment = null;

  // Pending approvals do not reduce effective paid funds.
  if (completedRefund(newRefund)) {
    const newRefundedTotal = Number((completedAlready + amount).toFixed(2));
    const paymentAmt = Number(targetPayment.amount || 0);
    const newPaymentStatus = newRefundedTotal >= paymentAmt - 0.001 ? 'Refunded' : 'Partially Refunded';

    updatedPayments = payments.map((p) => {
      if (String(p.id || p.paymentId) === String(targetPayment.id || targetPayment.paymentId)) {
        updatedTargetPayment = {
          ...p,
          refundedAmount: newRefundedTotal,
          status: newPaymentStatus,
        };
        return updatedTargetPayment;
      }
      return p;
    });

    const postPaid = Math.max(0, Number((financialState.effectivePaid - amount).toFixed(2)));
    const postDue = Math.max(0, Number((Number(invoice.totalAmount || 0) - postPaid).toFixed(2)));
    let postInvoiceStatus = 'Unpaid';
    if (postDue <= 0.001 && Number(invoice.totalAmount || 0) > 0) {
      postInvoiceStatus = 'Paid';
    } else if (postPaid > 0) {
      postInvoiceStatus = 'Partially Paid';
    } else {
      postInvoiceStatus = 'Unpaid';
    }

    updatedInvoices = invoices.map((item) =>
      String(item.id) === String(invoice.id) || String(item.invoiceNumber) === String(invoice.id)
        ? {
            ...item,
            paidAmount: postPaid,
            balanceDue: postDue,
            status: postInvoiceStatus,
          }
        : item
    );
  }

  // Transactional persistence with snapshot rollback
  const prevRefundsRaw = localStorage.getItem(STORAGE_KEYS.REFUNDS);
  const prevPaymentsRaw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  const prevInvoicesRaw = localStorage.getItem(STORAGE_KEYS.INVOICES);

  try {
    saveRefunds(updatedRefunds, { silent: true });
    if (completedRefund(newRefund)) {
      savePayments(updatedPayments, { silent: true });
      saveInvoices(updatedInvoices, { silent: true });
    }
  } catch (persistErr) {
    try {
      if (prevRefundsRaw !== null) localStorage.setItem(STORAGE_KEYS.REFUNDS, prevRefundsRaw);
      else localStorage.removeItem(STORAGE_KEYS.REFUNDS);
      if (prevPaymentsRaw !== null) localStorage.setItem(STORAGE_KEYS.PAYMENTS, prevPaymentsRaw);
      else localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      if (prevInvoicesRaw !== null) localStorage.setItem(STORAGE_KEYS.INVOICES, prevInvoicesRaw);
      else localStorage.removeItem(STORAGE_KEYS.INVOICES);
    } catch {}
    throw new Error(`Refund persistence failed and was rolled back: ${persistErr.message || 'Storage write error'}`, { cause: persistErr });
  }

  dispatchFinancialEvent(REFUNDS_UPDATED_EVENT, {
    domain: 'refunds',
    action: 'process_refund',
    refundId: newRefund.id,
    paymentId: newRefund.paymentId,
    invoiceId: newRefund.invoiceId,
    bookingId: targetPayment.bookingId,
    amount,
    status: newRefund.status,
  });
  if (completedRefund(newRefund)) {
    dispatchFinancialEvent(PAYMENTS_UPDATED_EVENT, {
      domain: 'payments',
      action: 'process_refund',
      paymentId: targetPayment.id || targetPayment.paymentId,
      invoiceId: targetPayment.invoiceId,
      bookingId: targetPayment.bookingId,
      refundedAmount: amount,
    });
    dispatchFinancialEvent(INVOICES_UPDATED_EVENT, {
      domain: 'invoices',
      action: 'process_refund',
      invoiceId: invoice.id,
      bookingId: targetPayment.bookingId,
    });
  }

  try {
    addAuditLog({
      module: 'Payment & Billing',
      action: 'Processed Refund',
      recordId: targetPayment.id || targetPayment.paymentId,
      description: `Refund of $${amount.toFixed(2)} processed for payment ${targetPayment.id} (Invoice: ${invoice.id}, Status: ${newRefund.status}).`,
      importance: 'Important',
    });
  } catch {}

  return {
    updatedRefunds,
    newRefund,
    updatedPayment: updatedTargetPayment,
  };
};

export const updateRefundStatus = (refundId, newStatus) => {
  const refunds = getRefunds();
  const target = refunds.find((refund) => refund.id === refundId || refund.refundId === refundId);
  if (!target) throw new Error(`Refund with ID ${refundId} was not found.`);
  const wasCompleted = completedRefund(target);
  const willBeCompleted = completedRefund({ status: newStatus });
  const delta = (willBeCompleted ? 1 : 0) - (wasCompleted ? 1 : 0);
  let updatedPayments = getPayments();
  let updatedInvoices = getInvoices();

  if (delta !== 0) {
    const payment = updatedPayments.find((item) => String(item.id || item.paymentId) === String(target.paymentId));
    if (!payment) throw new Error('The refund payment link could not be resolved.');
    const invoice = updatedInvoices.find((item) => String(item.id || item.invoiceNumber) === String(payment.invoiceId || payment.invoiceNumber));
    if (!invoice) throw new Error('The refund invoice link could not be resolved.');
    const state = getInvoiceFinancialState(invoice.id || invoice.invoiceNumber);
    if (state.integrity !== 'verified') throw new Error(`Refund status cannot be changed: ${state.reason}`);
    const amount = Number(target.amount ?? target.refundAmount ?? 0);
    const newRefunded = Number((Number(payment.refundedAmount || 0) + delta * amount).toFixed(2));
    if (newRefunded < -0.001 || newRefunded > Number(payment.amount || 0) + 0.001) throw new Error('Refund total would exceed the payment amount.');
    const paymentAmt = Number(payment.amount || 0);
    const newPaymentStatus = newRefunded >= paymentAmt - 0.001 ? 'Refunded' : newRefunded > 0 ? 'Partially Refunded' : 'Completed';
    updatedPayments = updatedPayments.map((item) =>
      String(item.id || item.paymentId) === String(payment.id || payment.paymentId)
        ? { ...item, refundedAmount: Math.max(0, newRefunded), status: newPaymentStatus }
        : item
    );
    const postPaid = Math.max(0, Number((state.effectivePaid - delta * amount).toFixed(2)));
    const postDue = Math.max(0, Number((Number(invoice.totalAmount || 0) - postPaid).toFixed(2)));
    let postInvoiceStatus = 'Unpaid';
    if (postDue <= 0.001 && Number(invoice.totalAmount || 0) > 0) postInvoiceStatus = 'Paid';
    else if (postPaid > 0) postInvoiceStatus = 'Partially Paid';
    else postInvoiceStatus = 'Unpaid';

    updatedInvoices = updatedInvoices.map((item) =>
      String(item.id) === String(invoice.id) || String(item.invoiceNumber) === String(invoice.id)
        ? { ...item, paidAmount: postPaid, balanceDue: postDue, status: postInvoiceStatus }
        : item
    );
  }
  const updated = refunds.map((r) => (r.id === target.id ? { ...r, status: newStatus } : r));

  // Snapshot rollback protection
  const prevRefundsRaw = localStorage.getItem(STORAGE_KEYS.REFUNDS);
  const prevPaymentsRaw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  const prevInvoicesRaw = localStorage.getItem(STORAGE_KEYS.INVOICES);

  try {
    saveRefunds(updated, { silent: true });
    if (delta !== 0) {
      savePayments(updatedPayments, { silent: true });
      saveInvoices(updatedInvoices, { silent: true });
    }
  } catch (persistErr) {
    try {
      if (prevRefundsRaw !== null) localStorage.setItem(STORAGE_KEYS.REFUNDS, prevRefundsRaw);
      else localStorage.removeItem(STORAGE_KEYS.REFUNDS);
      if (prevPaymentsRaw !== null) localStorage.setItem(STORAGE_KEYS.PAYMENTS, prevPaymentsRaw);
      else localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      if (prevInvoicesRaw !== null) localStorage.setItem(STORAGE_KEYS.INVOICES, prevInvoicesRaw);
      else localStorage.removeItem(STORAGE_KEYS.INVOICES);
    } catch {}
    throw new Error(`Refund status persistence failed and was rolled back: ${persistErr.message || 'Storage write error'}`, { cause: persistErr });
  }

  dispatchFinancialEvent(REFUNDS_UPDATED_EVENT, {
    domain: 'refunds',
    action: 'update_refund_status',
    refundId: target.id || target.refundId,
    status: newStatus,
  });
  if (delta !== 0) {
    dispatchFinancialEvent(PAYMENTS_UPDATED_EVENT, {
      domain: 'payments',
      action: 'update_refund_status',
      paymentId: target.paymentId,
    });
    dispatchFinancialEvent(INVOICES_UPDATED_EVENT, {
      domain: 'invoices',
      action: 'update_refund_status',
    });
  }

  // Non-blocking best-effort secondary audit logging (failure must not fail core transaction)
  try {
    addAuditLog({
      module: 'Payment & Billing',
      action: 'Updated Refund Status',
      recordId: target.id || target.refundId,
      description: `Refund ${target.id || target.refundId} status updated to ${newStatus}.`,
      importance: 'Normal',
    });
  } catch {}

  return updated;
};

/**
 * Phase 7 Job 25: Canonical Invoice Status Derivation
 * Maps total charges, effective paid, and balance due to the canonical status model.
 */
export const deriveCanonicalInvoiceStatus = (totalAmount, effectivePaid, balanceDue) => {
  const total = Number(totalAmount) || 0;
  const paid = Number(effectivePaid) || 0;
  const balance = Number(balanceDue) || 0;
  if (balance <= 0.001 && total > 0) return 'Paid';
  if (paid > 0 && balance > 0) return 'Partially Paid';
  return 'Unpaid';
};

/**
 * Phase 7 Job 25: Deterministic Financial Integrity Audit (Read-Only)
 *
 * Scans invoices, payments, and refunds to verify ledger consistency and identify
 * discrepancies, ambiguities, and corrupt records without modifying any storage.
 */
export const auditFinancialIntegrity = () => {
  const invoices = getInvoices();
  const payments = getPayments();
  const refunds = getRefunds();
  const bookings = getReservations();

  const bookingMap = new Map();
  for (const b of bookings) {
    if (b && b.id !== undefined && b.id !== null) {
      bookingMap.set(String(b.id), b);
      if (b.bookingId) bookingMap.set(String(b.bookingId), b);
    }
  }

  const invoiceMap = new Map();
  const bookingInvoiceMap = new Map();

  for (const inv of invoices) {
    if (!inv) continue;
    const invId = String(inv.id || inv.invoiceNumber || '').trim();
    if (invId) invoiceMap.set(invId, inv);

    const bId = inv.bookingId ? String(inv.bookingId).trim() : '';
    if (bId) {
      if (!bookingInvoiceMap.has(bId)) bookingInvoiceMap.set(bId, []);
      bookingInvoiceMap.get(bId).push(inv);
    }
  }

  const ambiguities = [];
  const invoiceAuditResults = [];
  const paymentAuditResults = [];
  const refundAuditResults = [];

  // 1. Detect Multi-Invoice Booking Ambiguities
  const ambiguousBookingIds = new Set();
  for (const [bId, invList] of bookingInvoiceMap.entries()) {
    if (invList.length > 1) {
      ambiguousBookingIds.add(bId);
      ambiguities.push({
        type: 'MULTIPLE_INVOICES_FOR_BOOKING',
        entityId: bId,
        invoiceIds: invList.map((i) => i.id || i.invoiceNumber),
        description: `Booking "${bId}" has ${invList.length} linked invoices (${invList.map((i) => i.id || i.invoiceNumber).join(', ')}). Authoritative invoice is ambiguous.`,
      });
    }
  }

  // 2. Audit Payments
  const paymentMap = new Map();
  for (const payment of payments) {
    if (!payment) continue;
    const pId = String(payment.id || payment.paymentId || '').trim();
    if (pId) paymentMap.set(pId, payment);

    const paymentDiscrepancies = [];
    let isOrphan = false;

    // Malformed record check
    if (!pId || payment.amount === undefined || payment.amount === null || isNaN(Number(payment.amount))) {
      paymentDiscrepancies.push('Payment record is malformed: missing ID or non-numeric amount.');
      ambiguities.push({
        type: 'MALFORMED_RECORD',
        entityId: pId || 'UNKNOWN_PAYMENT',
        description: 'Payment record is missing ID or has invalid amount.',
      });
    } else if (Number(payment.amount) <= 0) {
      paymentDiscrepancies.push(`Payment amount must be greater than 0, found $${Number(payment.amount).toFixed(2)}.`);
    }

    // Status check
    const validPaymentStatuses = ['completed', 'partially refunded', 'refunded', 'failed'];
    if (!payment.status || !validPaymentStatuses.includes(String(payment.status).toLowerCase())) {
      paymentDiscrepancies.push(`Payment status "${payment.status}" is invalid.`);
    }

    // Invoice link check
    const rawInvId = String(payment.invoiceId || payment.invoiceNumber || '').trim();
    if (!rawInvId || !invoiceMap.has(rawInvId)) {
      isOrphan = true;
      paymentDiscrepancies.push(`Payment references nonexistent invoice "${rawInvId}".`);
      ambiguities.push({
        type: 'ORPHAN_PAYMENT',
        entityId: pId,
        description: `Payment "${pId}" references nonexistent invoice "${rawInvId}".`,
      });
    }

    // Refund ledger consistency
    const linkedRefunds = refunds.filter((r) => String(r.paymentId) === pId && completedRefund(r));
    const completedRefundTotal = Number(
      linkedRefunds.reduce((sum, r) => sum + Number(r.amount ?? r.refundAmount ?? 0), 0).toFixed(2)
    );

    if (completedRefundTotal > Number(payment.amount || 0) + 0.001) {
      paymentDiscrepancies.push(
        `Completed refunds ($${completedRefundTotal.toFixed(2)}) exceed payment amount ($${Number(payment.amount || 0).toFixed(2)}).`
      );
      ambiguities.push({
        type: 'OVER_REFUNDED_PAYMENT',
        entityId: pId,
        description: `Payment "${pId}" has completed refunds exceeding original payment amount.`,
      });
    }

    if (
      payment.refundedAmount !== undefined &&
      payment.refundedAmount !== null &&
      Math.abs(completedRefundTotal - Number(payment.refundedAmount || 0)) > 0.01
    ) {
      paymentDiscrepancies.push(
        `Stored refundedAmount ($${Number(payment.refundedAmount || 0).toFixed(2)}) disagrees with completed refund ledger total ($${completedRefundTotal.toFixed(2)}).`
      );
    }

    paymentAuditResults.push({
      id: pId,
      invoiceId: rawInvId,
      amount: Number(payment.amount || 0),
      status: payment.status,
      storedRefundedAmount: Number(payment.refundedAmount || 0),
      canonicalRefundedAmount: completedRefundTotal,
      isOrphan,
      discrepancies: paymentDiscrepancies,
      hasDiscrepancies: paymentDiscrepancies.length > 0,
    });
  }

  // 3. Audit Refunds
  for (const refund of refunds) {
    if (!refund) continue;
    const rId = String(refund.id || refund.refundId || '').trim();
    const refundDiscrepancies = [];
    let isOrphan = false;

    // Malformed record check
    if (!rId || refund.amount === undefined || refund.amount === null || isNaN(Number(refund.amount))) {
      refundDiscrepancies.push('Refund record is malformed: missing ID or non-numeric amount.');
      ambiguities.push({
        type: 'MALFORMED_RECORD',
        entityId: rId || 'UNKNOWN_REFUND',
        description: 'Refund record is missing ID or has invalid amount.',
      });
    } else if (Number(refund.amount) <= 0) {
      refundDiscrepancies.push(`Refund amount must be greater than 0, found $${Number(refund.amount).toFixed(2)}.`);
    }

    // Status check
    const validRefundStatuses = ['completed', 'pending approval', 'rejected'];
    if (!refund.status || !validRefundStatuses.includes(String(refund.status).toLowerCase())) {
      refundDiscrepancies.push(`Refund status "${refund.status}" is invalid.`);
    }

    // Payment link check
    const targetPaymentId = String(refund.paymentId || '').trim();
    const targetPayment = paymentMap.get(targetPaymentId);
    if (!targetPaymentId || !targetPayment) {
      isOrphan = true;
      refundDiscrepancies.push(`Refund references nonexistent payment "${targetPaymentId}".`);
      ambiguities.push({
        type: 'ORPHAN_REFUND',
        entityId: rId,
        description: `Refund "${rId}" references nonexistent payment "${targetPaymentId}".`,
      });
    } else {
      // Cross-invoice check
      const refInvoice = String(refund.invoiceId || refund.invoiceNumber || '').trim();
      const payInvoice = String(targetPayment.invoiceId || targetPayment.invoiceNumber || '').trim();
      if (refInvoice && payInvoice && refInvoice !== payInvoice) {
        refundDiscrepancies.push(
          `Refund invoiceId "${refInvoice}" does not match linked payment invoiceId "${payInvoice}".`
        );
        ambiguities.push({
          type: 'CROSS_INVOICE_REFUND',
          entityId: rId,
          description: `Refund "${rId}" invoice "${refInvoice}" differs from payment invoice "${payInvoice}".`,
        });
      }

      // Check single refund amount cap
      if (completedRefund(refund) && Number(refund.amount || 0) > Number(targetPayment.amount || 0) + 0.001) {
        refundDiscrepancies.push(
          `Completed refund amount ($${Number(refund.amount).toFixed(2)}) exceeds payment amount ($${Number(targetPayment.amount || 0).toFixed(2)}).`
        );
      }
    }

    refundAuditResults.push({
      id: rId,
      paymentId: targetPaymentId,
      invoiceId: String(refund.invoiceId || refund.invoiceNumber || '').trim(),
      amount: Number(refund.amount || 0),
      status: refund.status,
      isOrphan,
      discrepancies: refundDiscrepancies,
      hasDiscrepancies: refundDiscrepancies.length > 0,
    });
  }

  // 4. Audit Invoices and Determine Auto-Reconciliation Eligibility
  for (const invoice of invoices) {
    if (!invoice) continue;
    const invId = String(invoice.id || invoice.invoiceNumber || '').trim();
    const invoiceDiscrepancies = [];
    let canAutoReconcile = true;
    let unresolvableReason = '';

    // Malformed invoice check
    if (!invId || invoice.totalAmount === undefined || invoice.totalAmount === null || isNaN(Number(invoice.totalAmount))) {
      invoiceDiscrepancies.push('Invoice record is malformed: missing ID or non-numeric totalAmount.');
      canAutoReconcile = false;
      unresolvableReason = 'Invoice record is malformed.';
      ambiguities.push({
        type: 'MALFORMED_RECORD',
        entityId: invId || 'UNKNOWN_INVOICE',
        description: 'Invoice record is missing ID or totalAmount is not a number.',
      });
    }

    // Check multiple invoices for the same booking
    const bookingId = invoice.bookingId ? String(invoice.bookingId).trim() : '';
    if (bookingId && ambiguousBookingIds.has(bookingId)) {
      canAutoReconcile = false;
      unresolvableReason = `Booking "${bookingId}" has multiple linked invoices.`;
      invoiceDiscrepancies.push(`Ambiguous booking relationship: multiple invoices exist for booking "${bookingId}".`);
    }

    // Check if bookingId references a nonexistent booking
    if (bookingId && !bookingMap.has(bookingId)) {
      invoiceDiscrepancies.push(`Invoice references nonexistent booking "${bookingId}".`);
    }

    // Query linked payments
    const linkedPayments = payments.filter((p) => {
      const pInv = String(p.invoiceId || p.invoiceNumber || '').trim();
      return pInv === invId;
    });

    // Check if linked payments or refunds have unresolvable conflicts
    for (const p of linkedPayments) {
      const pId = String(p.id || p.paymentId || '');
      const pAudit = paymentAuditResults.find((pa) => pa.id === pId);
      if (pAudit && pAudit.discrepancies.some((d) => d.includes('exceed') || d.includes('malformed') || d.includes('greater than 0'))) {
        canAutoReconcile = false;
        unresolvableReason = `Linked payment "${pId}" has unresolvable ledger corruption.`;
        invoiceDiscrepancies.push(`Cannot reconcile: linked payment "${pId}" has critical discrepancy.`);
      }

      if (p.bookingId && bookingId && String(p.bookingId).trim() !== bookingId) {
        canAutoReconcile = false;
        unresolvableReason = `Payment "${pId}" links to different booking "${p.bookingId}".`;
        invoiceDiscrepancies.push(`Payment "${pId}" links to a different booking than the invoice.`);
      }

      const pRefunds = refunds.filter((r) => String(r.paymentId) === pId);
      for (const r of pRefunds) {
        const rId = String(r.id || r.refundId || '');
        const rAudit = refundAuditResults.find((ra) => ra.id === rId);
        if (rAudit && rAudit.discrepancies.some((d) => d.includes('does not match linked payment') || d.includes('exceeds payment amount'))) {
          canAutoReconcile = false;
          unresolvableReason = `Linked refund "${rId}" has cross-invoice or amount corruption.`;
          invoiceDiscrepancies.push(`Cannot reconcile: linked refund "${rId}" has critical discrepancy.`);
        }
      }
    }

    // Calculate canonical values from ledger
    const grossPaid = Number(
      linkedPayments.filter(successfulPayment).reduce((sum, p) => sum + Number(p.amount || 0), 0).toFixed(2)
    );

    const effectiveRefunds = Number(
      linkedPayments.filter(successfulPayment).reduce((sum, p) => {
        const pId = String(p.id || p.paymentId || '');
        return (
          sum +
          refunds
            .filter((r) => String(r.paymentId) === pId && completedRefund(r))
            .reduce((rSum, r) => rSum + Number(r.amount ?? r.refundAmount ?? 0), 0)
        );
      }, 0).toFixed(2)
    );

    const canonicalPaid = Number(Math.max(0, grossPaid - effectiveRefunds).toFixed(2));
    const totalAmount = Number(invoice.totalAmount || 0);
    const rawBalance = Number((totalAmount - canonicalPaid).toFixed(2));
    const canonicalBalance = rawBalance <= 0.001 ? 0 : rawBalance;
    const canonicalStatus = deriveCanonicalInvoiceStatus(totalAmount, canonicalPaid, canonicalBalance);

    // Discrepancy checks
    const storedPaid = Number(invoice.paidAmount || 0);
    const storedBalance = Number(invoice.balanceDue || 0);
    const storedStatus = invoice.status || 'Unpaid';

    if (Math.abs(storedPaid - canonicalPaid) > 0.01) {
      invoiceDiscrepancies.push(
        `Invoice paidAmount ($${storedPaid.toFixed(2)}) disagrees with canonical ledger effective paid ($${canonicalPaid.toFixed(2)}).`
      );
    }

    if (Math.abs(storedBalance - canonicalBalance) > 0.01) {
      invoiceDiscrepancies.push(
        `Invoice balanceDue ($${storedBalance.toFixed(2)}) disagrees with canonical ledger balance ($${canonicalBalance.toFixed(2)}).`
      );
    }

    if (storedStatus !== canonicalStatus) {
      invoiceDiscrepancies.push(
        `Invoice status "${storedStatus}" disagrees with canonical status "${canonicalStatus}".`
      );
    }

    const hasDiscrepancies = invoiceDiscrepancies.length > 0;

    invoiceAuditResults.push({
      id: invId,
      bookingId,
      totalAmount,
      storedPaidAmount: storedPaid,
      canonicalPaidAmount: canonicalPaid,
      storedBalanceDue: storedBalance,
      canonicalBalanceDue: canonicalBalance,
      storedStatus,
      canonicalStatus,
      canAutoReconcile: canAutoReconcile && hasDiscrepancies,
      isConsistent: !hasDiscrepancies,
      hasDiscrepancies,
      unresolvableReason,
      discrepancies: invoiceDiscrepancies,
    });
  }

  const totalDiscrepancies =
    invoiceAuditResults.reduce((sum, i) => sum + i.discrepancies.length, 0) +
    paymentAuditResults.reduce((sum, p) => sum + p.discrepancies.length, 0) +
    refundAuditResults.reduce((sum, r) => sum + r.discrepancies.length, 0) +
    ambiguities.length;

  const repairableInvoices = invoiceAuditResults.filter((i) => i.canAutoReconcile);

  return {
    summary: {
      totalInvoices: invoices.length,
      totalPayments: payments.length,
      totalRefunds: refunds.length,
      discrepancyCount: totalDiscrepancies,
      repairableInvoiceCount: repairableInvoices.length,
      unresolvableAmbiguityCount: ambiguities.length,
      isClean: totalDiscrepancies === 0,
    },
    invoices: invoiceAuditResults,
    payments: paymentAuditResults,
    refunds: refundAuditResults,
    ambiguities,
  };
};

/**
 * Phase 7 Job 25: Safe Derived-State Reconciliation for a Single Invoice
 *
 * Repairs purely derived fields (paidAmount, balanceDue, status) on a single invoice
 * when the canonical payment/refund ledger is unambiguous and sound.
 * Never mutates payments, refunds, bookings, or unrelated invoices.
 */
export const reconcileDerivedInvoiceFinancialState = (invoiceId) => {
  const cleanId = String(invoiceId || '').trim();
  if (!cleanId) {
    return { success: false, reason: 'A valid invoiceId is required.', modified: false };
  }

  const auditReport = auditFinancialIntegrity();
  const invoiceAudit = auditReport.invoices.find(
    (inv) => String(inv.id).trim() === cleanId
  );

  if (!invoiceAudit) {
    return { success: false, reason: `Invoice with ID "${cleanId}" was not found.`, modified: false };
  }

  if (invoiceAudit.unresolvableReason) {
    return {
      success: false,
      reason: `Invoice "${cleanId}" cannot be safely auto-reconciled: ${invoiceAudit.unresolvableReason}`,
      modified: false,
    };
  }

  // Idempotency check: verify if repair is actually needed
  const needsPaidRepair = Math.abs(Number(invoiceAudit.storedPaidAmount) - Number(invoiceAudit.canonicalPaidAmount)) > 0.01;
  const needsBalanceRepair = Math.abs(Number(invoiceAudit.storedBalanceDue) - Number(invoiceAudit.canonicalBalanceDue)) > 0.01;
  const needsStatusRepair = invoiceAudit.storedStatus !== invoiceAudit.canonicalStatus;

  if (!needsPaidRepair && !needsBalanceRepair && !needsStatusRepair) {
    return {
      success: true,
      reason: `Invoice "${cleanId}" is already consistent with the canonical payment/refund ledger.`,
      modified: false,
      invoice: getInvoices().find((i) => String(i.id) === cleanId || String(i.invoiceNumber) === cleanId),
    };
  }

  // Snapshot capture for failure rollback
  const prevInvoicesRaw = localStorage.getItem(STORAGE_KEYS.INVOICES);
  const invoices = getInvoices();
  let updatedInvoice = null;

  const nextInvoices = invoices.map((inv) => {
    if (String(inv.id).trim() === cleanId || String(inv.invoiceNumber).trim() === cleanId) {
      updatedInvoice = {
        ...inv,
        paidAmount: invoiceAudit.canonicalPaidAmount,
        balanceDue: invoiceAudit.canonicalBalanceDue,
        status: invoiceAudit.canonicalStatus,
      };
      return updatedInvoice;
    }
    return inv;
  });

  try {
    saveInvoices(nextInvoices, { silent: true });
  } catch (persistErr) {
    try {
      if (prevInvoicesRaw !== null) localStorage.setItem(STORAGE_KEYS.INVOICES, prevInvoicesRaw);
      else localStorage.removeItem(STORAGE_KEYS.INVOICES);
    } catch {}
    throw new Error(`Derived financial reconciliation failed and was rolled back: ${persistErr.message || 'Storage write error'}`, { cause: persistErr });
  }

  dispatchFinancialEvent(INVOICES_UPDATED_EVENT, {
    domain: 'invoices',
    action: 'reconcile_derived',
    invoiceId: cleanId,
  });

  // Secondary non-blocking audit log
  try {
    addAuditLog({
      module: 'Payment & Billing',
      action: 'Reconciled Invoice Financials',
      recordId: cleanId,
      description: `Reconciled derived financials for invoice ${cleanId} from canonical ledger (Paid: $${invoiceAudit.canonicalPaidAmount}, Due: $${invoiceAudit.canonicalBalanceDue}, Status: ${invoiceAudit.canonicalStatus}).`,
      importance: 'Normal',
    });
  } catch {}

  return {
    success: true,
    modified: true,
    invoice: updatedInvoice,
    repairedFields: {
      paidAmount: { from: invoiceAudit.storedPaidAmount, to: invoiceAudit.canonicalPaidAmount },
      balanceDue: { from: invoiceAudit.storedBalanceDue, to: invoiceAudit.canonicalBalanceDue },
      status: { from: invoiceAudit.storedStatus, to: invoiceAudit.canonicalStatus },
    },
  };
};

/**
 * Phase 7 Job 25: Safe Batch Derived-State Reconciliation
 *
 * Scans all invoices and reconciles derived fields for all unambiguous invoices with discrepancies.
 * Preserves all source ledger records, skips ambiguous cases, and provides atomic rollback.
 */
export const reconcileAllDerivedInvoiceFinancialStates = () => {
  const auditReport = auditFinancialIntegrity();
  const repairable = auditReport.invoices.filter((inv) => inv.canAutoReconcile);

  if (repairable.length === 0) {
    return {
      success: true,
      modified: false,
      repairedCount: 0,
      repairedInvoices: [],
      auditReport,
    };
  }

  const prevInvoicesRaw = localStorage.getItem(STORAGE_KEYS.INVOICES);
  const invoices = getInvoices();
  const repairMap = new Map(repairable.map((r) => [String(r.id), r]));
  const repairedInvoices = [];

  const nextInvoices = invoices.map((inv) => {
    const repair = repairMap.get(String(inv.id)) || repairMap.get(String(inv.invoiceNumber));
    if (repair) {
      const updated = {
        ...inv,
        paidAmount: repair.canonicalPaidAmount,
        balanceDue: repair.canonicalBalanceDue,
        status: repair.canonicalStatus,
      };
      repairedInvoices.push(updated);
      return updated;
    }
    return inv;
  });

  try {
    saveInvoices(nextInvoices, { silent: true });
  } catch (persistErr) {
    try {
      if (prevInvoicesRaw !== null) localStorage.setItem(STORAGE_KEYS.INVOICES, prevInvoicesRaw);
      else localStorage.removeItem(STORAGE_KEYS.INVOICES);
    } catch {}
    throw new Error(`Batch financial reconciliation failed and was rolled back: ${persistErr.message || 'Storage write error'}`, { cause: persistErr });
  }

  dispatchFinancialEvent(INVOICES_UPDATED_EVENT, {
    domain: 'invoices',
    action: 'batch_reconcile_derived',
    count: repairedInvoices.length,
  });

  try {
    addAuditLog({
      module: 'Payment & Billing',
      action: 'Batch Reconciled Invoice Financials',
      recordId: `${repairedInvoices.length} invoices`,
      description: `Batch reconciled derived financials for ${repairedInvoices.length} invoices from canonical ledger.`,
      importance: 'Important',
    });
  } catch {}

  return {
    success: true,
    modified: true,
    repairedCount: repairedInvoices.length,
    repairedInvoices,
    auditReport,
  };
};

// Reset all store data to defaults
export const resetPaymentBillingStore = () => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(INITIAL_REFUNDS));
  dispatchFinancialEvent(INVOICES_UPDATED_EVENT, { domain: 'invoices', action: 'reset' });
  dispatchFinancialEvent(PAYMENTS_UPDATED_EVENT, { domain: 'payments', action: 'reset' });
  dispatchFinancialEvent(REFUNDS_UPDATED_EVENT, { domain: 'refunds', action: 'reset' });
};

// Calculate outstanding dues / balance for a booking from centralized billing data
export const getBookingDues = (booking) => {
  if (!booking) return null;
  try {
    const invoices = getInvoices();
    const linkedInvoices = invoices.filter((invoice) => booking.id !== undefined && String(invoice.bookingId) === String(booking.id));
    if (!linkedInvoices.length) return null;
    const states = linkedInvoices.map((invoice) => getInvoiceFinancialState(invoice.id || invoice.invoiceNumber));
    if (states.some((state) => state.integrity !== 'verified')) return null;
    return states.reduce((sum, state) => sum + state.due, 0);
  } catch {
    return null;
  }
};

/**
 * Derive the canonical payment status for a booking from the invoice/payment/refund ledger.
 *
 * Returns:
 *   'Paid'            — all amounts settled, no balance remaining
 *   'Partially Paid'  — at least one payment made, balance > 0
 *   'Unpaid'          — invoice exists but no effective payments
 *   null              — no invoice found for this booking (no financial record yet)
 *
 * Never reads booking.payment. Never creates an invoice.
 */
export const getCanonicalBookingPaymentStatus = (bookingId) => {
  if (bookingId === undefined || bookingId === null || bookingId === '') return null;
  try {
    const invoices = getInvoices();
    const linkedInvoices = invoices.filter((inv) => String(inv.bookingId) === String(bookingId));
    if (!linkedInvoices.length) return null;
    // For unambiguous primary invoice use the first verified one
    for (const inv of linkedInvoices) {
      const state = getInvoiceFinancialState(inv.id || inv.invoiceNumber);
      if (state.integrity === 'verified') {
        return deriveCanonicalInvoiceStatus(inv.totalAmount, state.effectivePaid, state.due);
      }
    }
    // All invoices unverified — fall back to raw status of first linked invoice
    const firstInv = linkedInvoices[0];
    return firstInv.status || 'Unpaid';
  } catch {
    return null;
  }
};

// Reconcile and post eligible stay guest charges into the booking's invoice
export const reconcileBookingChargesToInvoice = (bookingId) => {
  const cleanId = String(bookingId || '').trim();
  if (!cleanId) {
    return {
      success: false,
      bookingId: '',
      invoiceId: null,
      reason: 'A valid bookingId is required for reconciliation.',
      reconciledCount: 0,
      reconciledItems: [],
      skippedAlreadyInvoiced: [],
      skippedIneligible: [],
      skippedInvalid: []
    };
  }

  const allBookings = getReservations();
  const booking = allBookings.find((b) => String(b.id) === cleanId);
  if (!booking) {
    return {
      success: false,
      bookingId: cleanId,
      invoiceId: null,
      reason: `Reservation with ID "${cleanId}" was not found.`,
      reconciledCount: 0,
      reconciledItems: [],
      skippedAlreadyInvoiced: [],
      skippedIneligible: [],
      skippedInvalid: []
    };
  }

  const invoices = getInvoices();
  const linkedInvoices = invoices.filter((inv) => String(inv.bookingId) === String(booking.id));
  if (linkedInvoices.length === 0) {
    return {
      success: false,
      bookingId: String(booking.id),
      invoiceId: null,
      reason: `No invoice found for booking "${booking.id}".`,
      reconciledCount: 0,
      reconciledItems: [],
      skippedAlreadyInvoiced: [],
      skippedIneligible: [],
      skippedInvalid: []
    };
  }
  if (linkedInvoices.length > 1) {
    return {
      success: false,
      bookingId: String(booking.id),
      invoiceId: null,
      reason: `Multiple invoices found for booking "${booking.id}". Ambiguous target invoice.`,
      reconciledCount: 0,
      reconciledItems: [],
      skippedAlreadyInvoiced: [],
      skippedIneligible: [],
      skippedInvalid: []
    };
  }

  const targetInvoice = linkedInvoices[0];
  const allCharges = getGuestCharges();

  // Strict foreign key match on charge.bookingId === booking.id
  // Ignore charges with missing bookingId or null/empty. Never match by name/room.
  const bookingCharges = allCharges.filter(
    (charge) => charge && charge.bookingId !== undefined && charge.bookingId !== null && String(charge.bookingId).trim() === String(booking.id).trim()
  );

  const currentItems = Array.isArray(targetInvoice.items) ? [...targetInvoice.items] : [];
  const itemsToAdd = [];
  const chargesToMarkInvoiced = [];
  const skippedAlreadyInvoiced = [];
  const skippedIneligible = [];
  const skippedInvalid = [];

  for (const charge of bookingCharges) {
    // 1. Idempotency check: inspect invoice.items by sourceType === 'guest_charge' && sourceId === charge.id
    const alreadyInInvoice = currentItems.some(
      (item) => item.sourceType === 'guest_charge' && String(item.sourceId) === String(charge.id)
    );
    if (alreadyInInvoice) {
      skippedAlreadyInvoiced.push({
        chargeId: charge.id,
        reason: 'Charge is already present in invoice items'
      });
      // Synchronize charge status if needed
      if (charge.status !== 'Invoiced') {
        chargesToMarkInvoiced.push(charge.id);
      }
      continue;
    }

    // 2. Already invoiced check on charge record
    if (charge.status === 'Invoiced') {
      skippedAlreadyInvoiced.push({
        chargeId: charge.id,
        reason: "Charge status is already 'Invoiced'"
      });
      continue;
    }

    // 3. Status eligibility checks
    if (charge.status === 'Paid') {
      skippedIneligible.push({
        chargeId: charge.id,
        status: charge.status,
        reason: 'Charge is already settled out-of-band (Paid) and cannot be billed again.'
      });
      continue;
    }

    if (charge.status === 'Pending') {
      skippedIneligible.push({
        chargeId: charge.id,
        status: charge.status,
        reason: "Charge status is 'Pending' (awaiting approval) and has not been posted to folio."
      });
      continue;
    }

    if (charge.status !== 'Added to Folio') {
      skippedIneligible.push({
        chargeId: charge.id,
        status: charge.status,
        reason: `Charge status '${charge.status}' is not billable.`
      });
      continue;
    }

    // 4. Financial value validation
    const quantity = Number(charge.quantity);
    const unitPrice = Number(charge.unitPrice);
    const amount = Number(charge.amount);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      skippedInvalid.push({
        chargeId: charge.id,
        reason: `Invalid charge quantity: ${charge.quantity}`
      });
      continue;
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      skippedInvalid.push({
        chargeId: charge.id,
        reason: `Invalid charge unitPrice: ${charge.unitPrice}`
      });
      continue;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      skippedInvalid.push({
        chargeId: charge.id,
        reason: `Invalid charge amount: ${charge.amount}`
      });
      continue;
    }

    // 5. Construct canonical invoice item
    const newItem = {
      description: String(charge.itemName || charge.chargeType || 'Guest Charge').trim(),
      rate: Number(unitPrice.toFixed(2)),
      qty: quantity,
      amount: Number(amount.toFixed(2)),
      sourceId: String(charge.id),
      sourceType: 'guest_charge'
    };

    itemsToAdd.push(newItem);
    chargesToMarkInvoiced.push(charge.id);
  }

  // If no new items to add, process any status sync and return
  if (itemsToAdd.length === 0) {
    for (const cId of chargesToMarkInvoiced) {
      try {
        updateGuestCharge(cId, { status: 'Invoiced' });
      } catch {}
    }
    return {
      success: true,
      bookingId: String(booking.id),
      invoiceId: targetInvoice.id,
      reconciledCount: 0,
      reconciledItems: [],
      skippedAlreadyInvoiced,
      skippedIneligible,
      skippedInvalid,
      invoice: getInvoiceWithFinancialState(targetInvoice)
    };
  }

  // Compute updated invoice totals
  const addedAmount = Number(itemsToAdd.reduce((sum, it) => sum + it.amount, 0).toFixed(2));
  const newSubtotal = Number((Number(targetInvoice.subtotal || 0) + addedAmount).toFixed(2));
  const newTotalAmount = Number((Number(targetInvoice.totalAmount || 0) + addedAmount).toFixed(2));
  const currentPaid = Number(targetInvoice.paidAmount || 0);
  const newBalanceDue = Math.max(0, Number((newTotalAmount - currentPaid).toFixed(2)));

  let newStatus = targetInvoice.status;
  if (newBalanceDue === 0 && newTotalAmount > 0) {
    newStatus = 'Paid';
  } else if (currentPaid > 0 && newBalanceDue > 0) {
    newStatus = 'Partially Paid';
  } else if (currentPaid === 0 && newTotalAmount > 0) {
    newStatus = targetInvoice.status === 'Draft' ? 'Draft' : 'Unpaid';
  }

  const updatedTargetInvoice = {
    ...targetInvoice,
    subtotal: newSubtotal,
    totalAmount: newTotalAmount,
    balanceDue: newBalanceDue,
    status: newStatus,
    items: [...currentItems, ...itemsToAdd]
  };

  const updatedInvoices = invoices.map((inv) =>
    (inv.id === targetInvoice.id || inv.invoiceNumber === targetInvoice.id) ? updatedTargetInvoice : inv
  );

  // 1. Save updated invoice to localStorage first (deterministic ordering)
  saveInvoices(updatedInvoices, { action: 'reconcile_charges', detail: { invoiceId: targetInvoice.id, bookingId: booking.id } });

  // 2. Mark charges as 'Invoiced' via canonical updateGuestCharge
  for (const cId of chargesToMarkInvoiced) {
    try {
      updateGuestCharge(cId, { status: 'Invoiced' });
    } catch (err) {
      console.warn(`Failed to update guest charge ${cId} status to Invoiced:`, err);
    }
  }

  try {
    addAuditLog({
      module: 'Payment & Billing',
      action: 'Reconciled Guest Charges',
      recordId: targetInvoice.id,
      description: `Reconciled ${itemsToAdd.length} guest charge(s) totaling $${addedAmount.toFixed(2)} to invoice ${targetInvoice.id}.`,
      importance: 'Important'
    });
  } catch {}

  return {
    success: true,
    bookingId: String(booking.id),
    invoiceId: targetInvoice.id,
    reconciledCount: itemsToAdd.length,
    reconciledItems: itemsToAdd.map((it) => ({
      chargeId: it.sourceId,
      description: it.description,
      amount: it.amount,
      sourceId: it.sourceId,
      sourceType: it.sourceType
    })),
    skippedAlreadyInvoiced,
    skippedIneligible,
    skippedInvalid,
    invoice: getInvoiceWithFinancialState(updatedTargetInvoice)
  };
};

/**
 * Collision-safe invoice ID generator.
 * Scans existing invoices to determine the maximum existing sequence number
 * and increments it. Guarantees no ID collisions regardless of deletions or array length.
 */
export function generateNextInvoiceId(invoices = getInvoices()) {
  let maxSeq = 0;
  for (const inv of invoices) {
    if (!inv) continue;
    const raw = String(inv.id || inv.invoiceNumber || '').trim();
    const match = raw.match(/INV-\d{4}-(\d+)/) || raw.match(/INV-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  // Also inspect payments to avoid any collision with existing payment invoice links
  try {
    const payments = getPayments();
    for (const pay of payments) {
      if (!pay) continue;
      const raw = String(pay.invoiceId || pay.invoiceNumber || '').trim();
      const match = raw.match(/INV-\d{4}-(\d+)/) || raw.match(/INV-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (Number.isFinite(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  } catch {}

  let candidateNum = maxSeq + 1;
  let candidateId = `INV-2026-${String(candidateNum).padStart(3, '0')}`;

  while (
    invoices.some((inv) => inv && (String(inv.id).trim() === candidateId || String(inv.invoiceNumber).trim() === candidateId)) ||
    (getPayments() || []).some((pay) => pay && (String(pay.invoiceId).trim() === candidateId || String(pay.invoiceNumber).trim() === candidateId))
  ) {
    candidateNum += 1;
    candidateId = `INV-2026-${String(candidateNum).padStart(3, '0')}`;
  }

  return candidateId;
}

/**
 * Canonical Booking Stay Invoice Generator (Phase 7 Job 19).
 * Idempotently retrieves or creates the primary accommodation stay invoice for a booking.
 *
 * Precedence / Order:
 * 1. Validate booking existence by canonical booking.id.
 * 2. Check for existing linked invoice (invoice.bookingId === booking.id).
 *    - Exactly 1 existing: return immediately without modifying totals or status (preserves legacy/demo).
 *    - More than 1 existing: fail safely with ambiguity error.
 *    - Zero existing: proceed to creation validation.
 * 3. Validate booking status eligibility (Booked, Checked In, Checked Out allowed; Pending, Cancelled rejected).
 * 4. Validate stay dates (nights = checkOut - checkIn calendar days; must be > 0).
 * 5. Resolve canonical room via booking.roomId in room inventory.
 * 6. Resolve authoritative accommodation rate via room.rent.
 * 7. Construct base accommodation invoice item and initial invoice record.
 * 8. Save atomically to invoice storage and return.
 */
export const getOrCreateBookingInvoice = (bookingId) => {
  const cleanId = String(bookingId || '').trim();
  if (!cleanId) {
    return {
      success: false,
      reason: 'A valid bookingId is required.',
      invoice: null,
      id: null
    };
  }

  // 1. Resolve canonical booking by ID
  const allBookings = getReservations();
  const booking = allBookings.find((b) => b && String(b.id).trim() === cleanId);
  if (!booking) {
    return {
      success: false,
      reason: `Reservation with ID "${cleanId}" was not found.`,
      invoice: null,
      id: null
    };
  }

  // 2. Existing invoice check MUST come first (preserves legacy/demo invoices before creation-status checks)
  const invoices = getInvoices();
  const linkedInvoices = invoices.filter(
    (inv) => inv && inv.bookingId !== undefined && inv.bookingId !== null && String(inv.bookingId).trim() === String(booking.id).trim()
  );

  // Exactly one existing invoice -> return it unchanged
  if (linkedInvoices.length === 1) {
    const existingInvoice = linkedInvoices[0];
    return {
      ...existingInvoice,
      success: true,
      invoice: existingInvoice,
      isExisting: true
    };
  }

  // More than one existing invoice -> safe ambiguity error
  if (linkedInvoices.length > 1) {
    return {
      success: false,
      reason: `Multiple invoices found for booking "${booking.id}". Ambiguous target invoice.`,
      invoice: null,
      id: null
    };
  }

  // 3. Status validation for creation (only if zero existing invoices)
  const normalizedStatus = normalizeBookingStatus(booking.status);
  const allowedStatuses = ['Booked', 'Checked In', 'Checked Out'];
  if (!allowedStatuses.includes(normalizedStatus)) {
    return {
      success: false,
      reason: `Cannot create stay invoice for booking with status "${booking.status || normalizedStatus}". Only Booked, Checked In, or Checked Out reservations can generate an invoice.`,
      invoice: null,
      id: null
    };
  }

  // 4. Stay date validation & nights calculation (calendar days)
  const startEpoch = parseStayDate(booking.checkIn);
  const endEpoch = parseStayDate(booking.checkOut);
  if (startEpoch === null || endEpoch === null) {
    return {
      success: false,
      reason: 'Invalid or missing check-in or check-out stay dates.',
      invoice: null,
      id: null
    };
  }
  if (endEpoch <= startEpoch) {
    return {
      success: false,
      reason: 'Check-out date must be strictly after check-in date (zero-night and negative stays are invalid).',
      invoice: null,
      id: null
    };
  }
  const nights = Math.round((endEpoch - startEpoch) / (24 * 60 * 60 * 1000));
  if (nights <= 0) {
    return {
      success: false,
      reason: 'Stay duration must be at least 1 night.',
      invoice: null,
      id: null
    };
  }

  // 5. Canonical room resolution via booking.roomId
  if (booking.roomId === undefined || booking.roomId === null || booking.roomId === '') {
    return {
      success: false,
      reason: `Booking "${booking.id}" does not have a canonical roomId relationship.`,
      invoice: null,
      id: null
    };
  }
  const room = getRoomById(booking.roomId);
  if (!room) {
    return {
      success: false,
      reason: `Canonical room with ID "${booking.roomId}" was not found in room inventory.`,
      invoice: null,
      id: null
    };
  }

  // 6. Authoritative accommodation rate resolution
  // Authoritative accommodation pricing source: room.rent from room inventory (roomStore.js)
  const nightlyRate = Number(room.rent);
  if (!Number.isFinite(nightlyRate) || nightlyRate <= 0) {
    return {
      success: false,
      reason: `Invalid or missing room rate for room "${room.id}". Authoritative rate "room.rent" must be a positive number.`,
      invoice: null,
      id: null
    };
  }

  // 7. Base accommodation charge construction
  const totalBase = Number((nightlyRate * nights).toFixed(2));
  const roomTypeName = room.roomType || room.type || booking.roomType || 'Standard Room';
  const baseItem = {
    description: `${roomTypeName} (${nights} Night${nights > 1 ? 's' : ''} @ $${nightlyRate.toFixed(2)}/night)`,
    rate: nightlyRate,
    qty: nights,
    amount: totalBase
  };

  // 8. Generate collision-safe invoice ID
  const newInvoiceId = generateNextInvoiceId(invoices);

  // 9. Construct canonical invoice record
  const invoiceRecord = {
    id: newInvoiceId,
    invoiceNumber: newInvoiceId,
    bookingId: String(booking.id),
    guestName: booking.name || booking.guestName || 'Guest',
    guestEmail: booking.email || booking.guestEmail || '',
    guestPhone: booking.phone || booking.guestPhone || '',
    roomNumber: String(room.roomNo || booking.roomNo || ''),
    roomType: roomTypeName,
    checkIn: String(booking.checkIn).trim(),
    checkOut: String(booking.checkOut).trim(),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: String(booking.checkOut).trim() || new Date().toISOString().split('T')[0],
    currency: 'USD',
    subtotal: totalBase,
    discount: 0,
    taxesAndFees: 0,
    tax: 0,
    totalAmount: totalBase,
    paidAmount: 0,
    balanceDue: totalBase,
    status: 'Unpaid',
    notes: '',
    items: [baseItem],
    payments: []
  };

  // 10. Save atomically to invoice storage
  saveInvoices([invoiceRecord, ...invoices], { action: 'create_stay_invoice', detail: { invoiceId: invoiceRecord.invoiceNumber, bookingId: booking.id } });

  try {
    addAuditLog({
      module: 'Payment & Billing',
      action: 'Created Stay Invoice',
      recordId: invoiceRecord.invoiceNumber,
      description: `Stay invoice ${invoiceRecord.invoiceNumber} created for booking ${booking.id} (${nights} nights @ $${nightlyRate.toFixed(2)}/night).`,
      importance: 'Important'
    });
  } catch {}

  return {
    ...invoiceRecord,
    success: true,
    invoice: invoiceRecord,
    isExisting: false
  };
};
