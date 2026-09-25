import { addAuditLog } from '../../audit/state/auditStore.js';
import { INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_REFUNDS } from '../data/paymentBillingDemoData.js';

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
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVOICES;
  }
};

export const saveInvoices = (invoices) => {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
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
    bookingId: newInvoice.bookingId || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
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

  if (amount > targetInvoice.balanceDue + 0.001) {
    throw new Error(`Payment amount of $${amount.toFixed(2)} exceeds remaining balance due of $${targetInvoice.balanceDue.toFixed(2)}.`);
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
  const newPaid = Number(targetInvoice.paidAmount) + amount;
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
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
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
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(INITIAL_REFUNDS));
      return INITIAL_REFUNDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REFUNDS;
  }
};

export const saveRefunds = (refunds) => {
  localStorage.setItem(STORAGE_KEYS.REFUNDS, JSON.stringify(refunds));
};

export const processRefund = (refundData) => {
  const paymentId = refundData.paymentId;
  const payments = getPayments();
  const targetPayment = payments.find((p) => p.id === paymentId || p.paymentId === paymentId);

  const amount = Number(refundData.amount || refundData.refundAmount);
  if (!amount || amount <= 0) {
    throw new Error('Refund amount must be greater than 0.');
  }

  if (targetPayment) {
    const maxRefundable = (targetPayment.amount || 0) - (targetPayment.refundedAmount || 0);
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
    paymentId: targetPayment ? targetPayment.id : (paymentId || 'N/A'),
    invoiceId: refundData.invoiceId || targetPayment?.invoiceId || 'N/A',
    invoiceNumber: refundData.invoiceId || targetPayment?.invoiceId || 'N/A',
    guestName: refundData.guestName || targetPayment?.guestName || 'Guest',
    bookingId: targetPayment?.bookingId || 'N/A',
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

  // Update target payment
  let updatedTargetPayment = null;
  if (targetPayment) {
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
  }

  return {
    updatedRefunds,
    newRefund,
    updatedPayment: updatedTargetPayment,
  };
};

export const updateRefundStatus = (refundId, newStatus) => {
  const refunds = getRefunds();
  const updated = refunds.map((r) =>
    r.id === refundId || r.refundId === refundId ? { ...r, status: newStatus } : r
  );
  saveRefunds(updated);
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
  if (!booking) return 0;
  try {
    const invoices = getInvoices();
    const invoice = invoices.find((inv) =>
      (booking.bookingId && inv.bookingId === booking.bookingId) ||
      (booking.id && (inv.bookingId === `BK-${booking.id}` || inv.bookingId === String(booking.id))) ||
      (booking.name && inv.guestName && inv.guestName.toLowerCase() === booking.name.toLowerCase()) ||
      (booking.email && inv.guestEmail && inv.guestEmail.toLowerCase() === booking.email.toLowerCase())
    );

    if (invoice) {
      return Number(invoice.balanceDue) || 0;
    }

    if (booking.payment === 'Paid') {
      return 0;
    }

    if (booking.remainingPrice !== undefined && booking.remainingPrice !== null) {
      const num = Number(String(booking.remainingPrice).replace(/[^0-9.-]+/g, ''));
      if (!isNaN(num)) return num;
    }

    if (booking.dues !== undefined && booking.dues !== null) {
      const num = Number(String(booking.dues).replace(/[^0-9.-]+/g, ''));
      if (!isNaN(num)) return num;
    }

    if (booking.payment === 'Unpaid' || booking.payment === 'Pending') {
      return 150.00;
    }

    return 0;
  } catch {
    return booking.payment === 'Paid' ? 0 : 150.00;
  }
};
