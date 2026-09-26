import { addAuditLog } from '../../audit/state/auditStore.js';
import { INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_REFUNDS } from '../data/paymentBillingDemoData.js';
import { getReservations } from '../../reservations/state/reservationStore.js';

export { INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_REFUNDS };

const STORAGE_KEYS = {
  INVOICES: 'hm_invoices_v2',
  PAYMENTS: 'hm_payments_v2',
  REFUNDS: 'hm_refunds_v2',
};

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

export const saveInvoices = (invoices) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
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
  saveInvoices(updated);
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
  saveInvoices(updated);
  try { addAuditLog({ module: 'Payment & Billing', action: 'Updated Invoice', recordId: invoiceId, description: `Invoice ${invoiceId} updated.`, importance: 'Normal' }); } catch(e) {}
  return updated;
};

export const deleteInvoice = (invoiceId) => {
  const invoices = getInvoices();
  const updated = invoices.filter((inv) => inv.id !== invoiceId && inv.invoiceNumber !== invoiceId);
  saveInvoices(updated);
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

  const amount = Number(paymentDetails.amount);
  if (!amount || amount <= 0) {
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
  const nextPayNum = payments.length + 1;
  const paymentId = `PAY-2026-${String(nextPayNum).padStart(3, '0')}`;

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
  const newPaid = financialState.effectivePaid + amount;
  const newBalance = Math.max(0, Number(targetInvoice.totalAmount) - newPaid);
  let nextStatus = 'Partially Paid';
  if (newBalance === 0) nextStatus = 'Paid';

  let updatedTargetInvoice = null;
  const updatedInvoices = invoices.map((inv) => {
    if (inv.id === targetInvoice.id) {
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

  saveInvoices(updatedInvoices);
  savePayments(updatedPayments);

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

export const savePayments = (payments) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const deletePayment = (paymentId) => {
  const payments = getPayments();
  const updated = payments.filter((p) => p.id !== paymentId && p.paymentId !== paymentId);
  savePayments(updated);
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

export const saveRefunds = (refunds) => {
  localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));
};

export const processRefund = (refundData) => {
  const paymentId = refundData.paymentId;
  const payments = getPayments();
  const targetPayment = payments.find((p) => p.id === paymentId || p.paymentId === paymentId);
  if (!targetPayment) throw new Error(`Payment with ID ${paymentId || '(missing)'} was not found.`);
  const invoice = getInvoices().find((item) => String(item.id || item.invoiceNumber) === String(targetPayment.invoiceId || targetPayment.invoiceNumber));
  if (!invoice) throw new Error('The payment has no matching invoice.');
  const financialState = getInvoiceFinancialState(invoice.id || invoice.invoiceNumber);
  if (financialState.integrity !== 'verified') throw new Error(`Refund cannot be processed: ${financialState.reason}`);

  const amount = Number(refundData.amount || refundData.refundAmount);
  if (!amount || amount <= 0) {
    throw new Error('Refund amount must be greater than 0.');
  }

  if (targetPayment) {
    const completedAlready = getRefunds().filter((refund) => String(refund.paymentId) === String(targetPayment.id || targetPayment.paymentId) && completedRefund(refund))
      .reduce((sum, refund) => sum + Number(refund.amount ?? refund.refundAmount ?? 0), 0);
    const maxRefundable = Number(targetPayment.amount || 0) - completedAlready;
    if (amount > maxRefundable + 0.001) {
      throw new Error(`Refund amount $${amount.toFixed(2)} exceeds maximum refundable amount of $${maxRefundable.toFixed(2)}.`);
    }
  }

  const refunds = getRefunds();
  const nextRefNum = refunds.length + 1;
  const refundId = `REF-2026-${String(nextRefNum).padStart(3, '0')}`;

  const newRefund = {
    id: refundId,
    refundId,
    paymentId: targetPayment.id,
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
  saveRefunds(updatedRefunds);

  // Pending approvals do not reduce effective paid funds.
  let updatedTargetPayment = null;
  if (targetPayment && completedRefund(newRefund)) {
    const updatedPayments = payments.map((p) => {
      if (p.id === targetPayment.id) {
        const newRefundedTotal = (p.refundedAmount || 0) + amount;
        const newStatus = newRefundedTotal >= p.amount ? 'Refunded' : 'Partially Refunded';
        updatedTargetPayment = {
          ...p,
          refundedAmount: newRefundedTotal,
          status: newStatus,
        };
        return updatedTargetPayment;
      }
      return p;
    });
    savePayments(updatedPayments);
    const postPaid = Math.max(0, financialState.effectivePaid - amount);
    const postDue = Math.max(0, Number(invoice.totalAmount || 0) - postPaid);
    saveInvoices(getInvoices().map((item) => String(item.id) === String(invoice.id) ? {
      ...item,
      paidAmount: postPaid,
      balanceDue: postDue,
      status: postDue === 0 ? 'Paid' : postPaid > 0 ? 'Partially Paid' : 'Unpaid',
    } : item));
  }

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
    const newRefunded = Number(payment.refundedAmount || 0) + delta * amount;
    if (newRefunded < -0.001 || newRefunded > Number(payment.amount || 0) + 0.001) throw new Error('Refund total would exceed the payment amount.');
    updatedPayments = updatedPayments.map((item) => String(item.id || item.paymentId) === String(payment.id || payment.paymentId)
      ? { ...item, refundedAmount: Math.max(0, newRefunded), status: newRefunded >= Number(item.amount || 0) ? 'Refunded' : newRefunded > 0 ? 'Partially Refunded' : 'Completed' }
      : item);
    const paid = Math.max(0, state.effectivePaid - delta * amount);
    const due = Math.max(0, Number(invoice.totalAmount || 0) - paid);
    updatedInvoices = updatedInvoices.map((item) => String(item.id) === String(invoice.id)
      ? { ...item, paidAmount: paid, balanceDue: due, status: due === 0 ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid' }
      : item);
  }
  const updated = refunds.map((r) => r.id === target.id ? { ...r, status: newStatus } : r);
  saveRefunds(updated);
  if (delta !== 0) {
    savePayments(updatedPayments);
    saveInvoices(updatedInvoices);
  }
  return updated;
};

// Reset all store data to defaults
export const resetPaymentBillingStore = () => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(INITIAL_REFUNDS));
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
