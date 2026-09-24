// Central Local Store & Mock Data for Payment & Billing Module

export const INITIAL_INVOICES = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'INV-2026-001',
    guestName: 'Alexander Wright',
    guestEmail: 'alexander.w@example.com',
    guestPhone: '+1 (555) 234-5678',
    bookingId: 'BK-7801',
    roomNumber: '302',
    roomType: 'Deluxe Suite',
    checkIn: '2026-09-10',
    checkOut: '2026-09-14',
    issueDate: '2026-09-10',
    dueDate: '2026-09-14',
    currency: 'USD',
    subtotal: 760.00,
    discount: 50.00,
    taxesAndFees: 184.60,
    tax: 184.60,
    totalAmount: 894.60,
    paidAmount: 894.60,
    balanceDue: 0.00,
    status: 'Paid',
    notes: 'Full stay charges settled in full at check-in via Visa Card.',
    items: [
      { description: 'Deluxe Suite (4 Nights @ $190/night)', rate: 190.00, qty: 4, amount: 760.00 },
      { description: 'Early Bird Promotional Discount', rate: -50.00, qty: 1, amount: -50.00 },
      { description: 'Room Tax & Municipal Surcharges (14%)', rate: 99.40, qty: 1, amount: 99.40 },
      { description: 'Resort Service Fee', rate: 85.20, qty: 1, amount: 85.20 },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-001',
        paymentDate: '2026-09-10 14:30',
        amount: 894.60,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-8849102',
        recordedBy: 'Front Desk - Sarah',
      },
    ],
  },
  {
    id: 'INV-2026-002',
    invoiceNumber: 'INV-2026-002',
    guestName: 'Sophia Montgomery',
    guestEmail: 'sophia.m@example.com',
    guestPhone: '+1 (555) 876-5432',
    bookingId: 'BK-7802',
    roomNumber: '405',
    roomType: 'Executive Room',
    checkIn: '2026-09-12',
    checkOut: '2026-09-17',
    issueDate: '2026-09-12',
    dueDate: '2026-09-15',
    currency: 'USD',
    subtotal: 1250.00,
    discount: 0.00,
    taxesAndFees: 225.25,
    tax: 225.25,
    totalAmount: 1475.25,
    paidAmount: 500.00,
    balanceDue: 975.25,
    status: 'Partially Paid',
    notes: 'Initial $500 deposit paid. Remaining balance scheduled for checkout.',
    items: [
      { description: 'Executive Room (5 Nights @ $250/night)', rate: 250.00, qty: 5, amount: 1250.00 },
      { description: 'Occupancy Taxes & Resort Surcharges', rate: 225.25, qty: 1, amount: 225.25 },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-002',
        paymentDate: '2026-09-12 11:15',
        amount: 500.00,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-8849105',
        recordedBy: 'Front Desk - Sarah',
      },
    ],
  },
  {
    id: 'INV-2026-003',
    invoiceNumber: 'INV-2026-003',
    guestName: 'Marcus Vance',
    guestEmail: 'marcus.v@example.com',
    guestPhone: '+1 (555) 432-1098',
    bookingId: 'BK-7803',
    roomNumber: '102',
    roomType: 'Standard King',
    checkIn: '2026-09-08',
    checkOut: '2026-09-11',
    issueDate: '2026-09-08',
    dueDate: '2026-09-10',
    currency: 'USD',
    subtotal: 420.00,
    discount: 0.00,
    taxesAndFees: 75.60,
    tax: 75.60,
    totalAmount: 495.60,
    paidAmount: 0.00,
    balanceDue: 495.60,
    status: 'Overdue',
    notes: 'Direct corporate booking; billing department sent overdue reminder on Sep 12.',
    items: [
      { description: 'Standard King (3 Nights @ $140/night)', rate: 140.00, qty: 3, amount: 420.00 },
      { description: 'State Lodging Tax & City Surcharge', rate: 75.60, qty: 1, amount: 75.60 },
    ],
    payments: [],
  },
  {
    id: 'INV-2026-004',
    invoiceNumber: 'INV-2026-004',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.r@example.com',
    guestPhone: '+1 (555) 654-9870',
    bookingId: 'BK-7804',
    roomNumber: '501',
    roomType: 'Presidential Suite',
    checkIn: '2026-09-14',
    checkOut: '2026-09-18',
    issueDate: '2026-09-14',
    dueDate: '2026-09-14',
    currency: 'USD',
    subtotal: 2400.00,
    discount: 200.00,
    taxesAndFees: 396.00,
    tax: 396.00,
    totalAmount: 2596.00,
    paidAmount: 2596.00,
    balanceDue: 0.00,
    status: 'Paid',
    notes: 'VIP guest; all-inclusive suite rate settled in advance via Bank Transfer.',
    items: [
      { description: 'Presidential Suite (4 Nights @ $600/night)', rate: 600.00, qty: 4, amount: 2400.00 },
      { description: 'VIP Concierge Loyalty Discount', rate: -200.00, qty: 1, amount: -200.00 },
      { description: 'Comprehensive Taxes & Luxury Surcharge', rate: 396.00, qty: 1, amount: 396.00 },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-003',
        paymentDate: '2026-09-14 16:40',
        amount: 2596.00,
        paymentMethod: 'Bank Transfer',
        transactionRef: 'WIRE-9920188',
        recordedBy: 'Finance Manager - David',
      },
    ],
  },
  {
    id: 'INV-2026-005',
    invoiceNumber: 'INV-2026-005',
    guestName: 'David Chen',
    guestEmail: 'david.chen@example.com',
    guestPhone: '+1 (555) 789-0123',
    bookingId: 'BK-7805',
    roomNumber: '210',
    roomType: 'Double Queen',
    checkIn: '2026-09-15',
    checkOut: '2026-09-17',
    issueDate: '2026-09-15',
    dueDate: '2026-09-17',
    currency: 'USD',
    subtotal: 360.00,
    discount: 0.00,
    taxesAndFees: 64.80,
    tax: 64.80,
    totalAmount: 424.80,
    paidAmount: 0.00,
    balanceDue: 424.80,
    status: 'Unpaid',
    notes: 'Guest requested to settle folio at checkout in Cash.',
    items: [
      { description: 'Double Queen Room (2 Nights @ $180/night)', rate: 180.00, qty: 2, amount: 360.00 },
      { description: 'Taxes & Municipal Tourism Fee', rate: 64.80, qty: 1, amount: 64.80 },
    ],
    payments: [],
  },
  {
    id: 'INV-2026-006',
    invoiceNumber: 'INV-2026-006',
    guestName: 'Lucas Oliveira',
    guestEmail: 'lucas.o@example.com',
    guestPhone: '+1 (555) 890-1234',
    bookingId: 'BK-7806',
    roomNumber: '315',
    roomType: 'Deluxe King',
    checkIn: '2026-09-11',
    checkOut: '2026-09-13',
    issueDate: '2026-09-11',
    dueDate: '2026-09-13',
    currency: 'USD',
    subtotal: 440.00,
    discount: 0.00,
    taxesAndFees: 79.20,
    tax: 79.20,
    totalAmount: 519.20,
    paidAmount: 519.20,
    balanceDue: 0.00,
    status: 'Paid',
    notes: 'Settled at front desk via Apple Pay / Digital Wallet.',
    items: [
      { description: 'Deluxe King (2 Nights @ $220/night)', rate: 220.00, qty: 2, amount: 440.00 },
      { description: 'Taxes & Amenities Surcharges', rate: 79.20, qty: 1, amount: 79.20 },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-004',
        paymentDate: '2026-09-11 10:15',
        amount: 519.20,
        paymentMethod: 'Digital Wallet',
        transactionRef: 'APAY-4491028',
        recordedBy: 'Front Desk - Sarah',
      },
    ],
  },
  {
    id: 'INV-2026-007',
    invoiceNumber: 'INV-2026-007',
    guestName: 'John Deo',
    guestEmail: 'test@email.com',
    guestPhone: '1234567890',
    bookingId: 'BK-1',
    roomNumber: '101',
    roomType: 'Delux',
    checkIn: '02/25/2023',
    checkOut: '02/28/2023',
    issueDate: '2023-02-25',
    dueDate: '2023-02-28',
    currency: 'USD',
    subtotal: 390.00,
    discount: 0.00,
    taxesAndFees: 60.00,
    tax: 60.00,
    totalAmount: 450.00,
    paidAmount: 450.00,
    balanceDue: 0.00,
    status: 'Paid',
    notes: 'All-inclusive package settled via credit card.',
    items: [
      { description: 'Delux Room (3 Nights @ $130/night)', rate: 130.00, qty: 3, amount: 390.00 },
      { description: 'Taxes & Surcharges', rate: 60.00, qty: 1, amount: 60.00 },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-007',
        paymentDate: '2023-02-25 14:00',
        amount: 450.00,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-9021881',
        recordedBy: 'Front Desk',
      },
    ],
  },
  {
    id: 'INV-2026-008',
    invoiceNumber: 'INV-2026-008',
    guestName: 'Sarah Smith',
    guestEmail: 'test@email.com',
    guestPhone: '1234567890',
    bookingId: 'BK-2',
    roomNumber: '205',
    roomType: 'Super Delux',
    checkIn: '02/12/2023',
    checkOut: '02/15/2023',
    issueDate: '2023-02-12',
    dueDate: '2023-02-15',
    currency: 'USD',
    subtotal: 600.00,
    discount: 0.00,
    taxesAndFees: 80.00,
    tax: 80.00,
    totalAmount: 680.00,
    paidAmount: 0.00,
    balanceDue: 680.00,
    status: 'Unpaid',
    notes: 'Business package; balance due at checkout.',
    items: [
      { description: 'Super Delux (3 Nights @ $200/night)', rate: 200.00, qty: 3, amount: 600.00 },
      { description: 'State & Tourism Taxes', rate: 80.00, qty: 1, amount: 80.00 },
    ],
    payments: [],
  },
  {
    id: 'INV-2026-009',
    invoiceNumber: 'INV-2026-009',
    guestName: 'John Smith',
    guestEmail: 'john.smith@example.com',
    guestPhone: '+1234567890',
    bookingId: 'BK-1001',
    roomNumber: '101',
    roomType: 'Deluxe',
    checkIn: '2026-05-20',
    checkOut: '2026-05-22',
    issueDate: '2026-05-20',
    dueDate: '2026-05-22',
    currency: 'USD',
    subtotal: 750.00,
    discount: 0.00,
    taxesAndFees: 120.00,
    tax: 120.00,
    totalAmount: 870.00,
    paidAmount: 870.00,
    balanceDue: 0.00,
    status: 'Paid',
    notes: 'Settled upon arrival.',
    items: [
      { description: 'Deluxe Room (2 Nights @ $375/night)', rate: 375.00, qty: 2, amount: 750.00 },
      { description: 'Hotel Surcharges', rate: 120.00, qty: 1, amount: 120.00 },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-009',
        paymentDate: '2026-05-20 12:30',
        amount: 870.00,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-9021899',
        recordedBy: 'Front Desk',
      },
    ],
  },
  {
    id: 'INV-2026-010',
    invoiceNumber: 'INV-2026-010',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.johnson@example.com',
    guestPhone: '+1234567893',
    bookingId: 'BK-1002',
    roomNumber: '205',
    roomType: 'Suite',
    checkIn: '2026-05-19',
    checkOut: '2026-05-21',
    issueDate: '2026-05-19',
    dueDate: '2026-05-21',
    currency: 'USD',
    subtotal: 820.00,
    discount: 0.00,
    taxesAndFees: 130.00,
    tax: 130.00,
    totalAmount: 950.00,
    paidAmount: 950.00,
    balanceDue: 0.00,
    status: 'Paid',
    notes: 'Corporate suite settlement.',
    items: [
      { description: 'Suite (2 Nights @ $410/night)', rate: 410.00, qty: 2, amount: 820.00 },
      { description: 'Taxes and Fees', rate: 130.00, qty: 1, amount: 130.00 },
    ],
    payments: [
      {
        paymentId: 'PAY-2026-010',
        paymentDate: '2026-05-19 15:00',
        amount: 950.00,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-9021900',
        recordedBy: 'Front Desk',
      },
    ],
  },
];

export const INITIAL_PAYMENTS = [
  {
    id: 'PAY-2026-001',
    paymentId: 'PAY-2026-001',
    invoiceId: 'INV-2026-001',
    invoiceNumber: 'INV-2026-001',
    bookingId: 'BK-7801',
    guestName: 'Alexander Wright',
    guestEmail: 'alexander.w@example.com',
    guestPhone: '+1 (555) 234-5678',
    roomNumber: '302',
    roomType: 'Deluxe Suite',
    paymentDate: '2026-09-10 14:30',
    amount: 894.60,
    refundedAmount: 0.00,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    transactionRef: 'TXN-8849102',
    gateway: 'Stripe Terminal POS #1',
    status: 'Completed',
    cashier: 'Sarah Jenkins',
    recordedBy: 'Sarah Jenkins',
    notes: 'MasterCard payment authorized at front desk.',
  },
  {
    id: 'PAY-2026-002',
    paymentId: 'PAY-2026-002',
    invoiceId: 'INV-2026-002',
    invoiceNumber: 'INV-2026-002',
    bookingId: 'BK-7802',
    guestName: 'Sophia Montgomery',
    guestEmail: 'sophia.m@example.com',
    guestPhone: '+1 (555) 876-5432',
    roomNumber: '405',
    roomType: 'Executive Room',
    paymentDate: '2026-09-12 11:15',
    amount: 500.00,
    refundedAmount: 0.00,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    transactionRef: 'TXN-8849105',
    gateway: 'Stripe Terminal POS #2',
    status: 'Completed',
    cashier: 'Sarah Jenkins',
    recordedBy: 'Sarah Jenkins',
    notes: 'Advance booking deposit charge.',
  },
  {
    id: 'PAY-2026-003',
    paymentId: 'PAY-2026-003',
    invoiceId: 'INV-2026-004',
    invoiceNumber: 'INV-2026-004',
    bookingId: 'BK-7804',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.r@example.com',
    guestPhone: '+1 (555) 654-9870',
    roomNumber: '501',
    roomType: 'Presidential Suite',
    paymentDate: '2026-09-14 16:40',
    amount: 2596.00,
    refundedAmount: 0.00,
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    transactionRef: 'WIRE-9920188',
    gateway: 'J.P. Morgan Wire Clearing',
    status: 'Completed',
    cashier: 'David Miller',
    recordedBy: 'David Miller',
    notes: 'Direct corporate wire settlement verified.',
  },
  {
    id: 'PAY-2026-004',
    paymentId: 'PAY-2026-004',
    invoiceId: 'INV-2026-006',
    invoiceNumber: 'INV-2026-006',
    bookingId: 'BK-7806',
    guestName: 'Lucas Oliveira',
    guestEmail: 'lucas.o@example.com',
    guestPhone: '+1 (555) 890-1234',
    roomNumber: '315',
    roomType: 'Deluxe King',
    paymentDate: '2026-09-11 10:15',
    amount: 519.20,
    refundedAmount: 0.00,
    currency: 'USD',
    paymentMethod: 'Digital Wallet',
    transactionRef: 'APAY-4491028',
    gateway: 'Apple Pay Gateway',
    status: 'Completed',
    cashier: 'Sarah Jenkins',
    recordedBy: 'Sarah Jenkins',
    notes: 'Contactless NFC settlement at front desk.',
  },
  {
    id: 'PAY-2026-005',
    paymentId: 'PAY-2026-005',
    invoiceId: 'INV-2026-007',
    invoiceNumber: 'INV-2026-007',
    bookingId: 'BK-7798',
    guestName: 'Jonathan Hayes',
    guestEmail: 'j.hayes@example.com',
    guestPhone: '+1 (555) 345-6789',
    roomNumber: '204',
    roomType: 'Deluxe King',
    paymentDate: '2026-09-07 09:20',
    amount: 650.00,
    refundedAmount: 650.00,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    transactionRef: 'TXN-8849090',
    gateway: 'Stripe Online Gateway',
    status: 'Refunded',
    cashier: 'David Miller',
    recordedBy: 'David Miller',
    notes: 'Guest canceled within 24hr free cancellation window.',
  },
];

export const INITIAL_REFUNDS = [
  {
    id: 'REF-2026-001',
    refundId: 'REF-2026-001',
    paymentId: 'PAY-2026-005',
    invoiceId: 'INV-2026-007',
    invoiceNumber: 'INV-2026-007',
    guestName: 'Jonathan Hayes',
    bookingId: 'BK-7798',
    roomNumber: '204',
    roomType: 'Deluxe King',
    refundDate: '2026-09-08',
    amount: 650.00,
    refundAmount: 650.00,
    currency: 'USD',
    reason: 'Booking Cancellation',
    refundMethod: 'Credit Card Reverse',
    status: 'Completed',
    processedBy: 'David Miller (Finance)',
    notes: 'Full cancellation refund issued automatically per hotel policy.',
  },
  {
    id: 'REF-2026-002',
    refundId: 'REF-2026-002',
    paymentId: 'PAY-2026-001',
    invoiceId: 'INV-2026-001',
    invoiceNumber: 'INV-2026-001',
    guestName: 'Alexander Wright',
    bookingId: 'BK-7801',
    roomNumber: '302',
    roomType: 'Deluxe Suite',
    refundDate: '2026-09-15',
    amount: 50.00,
    refundAmount: 50.00,
    currency: 'USD',
    reason: 'Guest Complaint / Room Issue',
    refundMethod: 'Credit Card Reverse',
    status: 'Pending Approval',
    processedBy: 'Sarah Jenkins (Front Desk)',
    notes: 'Minor AC maintenance noise credit requested by guest.',
  },
];

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

