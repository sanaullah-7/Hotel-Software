import { addAuditLog } from '../../audit/state/auditStore.js';
// Central Local Store & Mock Data for Rates & Pricing Module

export const INITIAL_RATE_PLANS = [
  {
    id: 'RP-001',
    code: 'BAR',
    name: 'Best Available Rate',
    description: 'Standard flexible room rate with no special package inclusions.',
    roomType: 'Deluxe Room',
    mealPlan: 'Room Only',
    baseRate: 12000,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 2500,
    extraChildRate: 1200,
    cancellationPolicy: 'Flexible',
    cancellationDetails: 'Free cancellation up to 24 hours prior to 14:00 check-in time.',
    minStayNights: 1,
    maxStayNights: 30,
    status: 'Active',
    createdAt: '2026-08-01'
  },
  {
    id: 'RP-002',
    code: 'BBF',
    name: 'Bed & Breakfast Package',
    description: 'Inclusive of daily international buffet breakfast at the hotel restaurant.',
    roomType: 'Deluxe Room',
    mealPlan: 'Breakfast Included',
    baseRate: 14000,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 3500,
    extraChildRate: 1800,
    cancellationPolicy: 'Flexible',
    cancellationDetails: 'Free cancellation up to 48 hours prior to check-in date.',
    minStayNights: 1,
    maxStayNights: 30,
    status: 'Active',
    createdAt: '2026-08-05'
  },
  {
    id: 'RP-003',
    code: 'NRF',
    name: 'Non-Refundable Advance Saver',
    description: 'Special discounted prepaid rate. 100% non-refundable upon booking.',
    roomType: 'Standard Room',
    mealPlan: 'Room Only',
    baseRate: 9500,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 2000,
    extraChildRate: 1000,
    cancellationPolicy: 'Non-Refundable',
    cancellationDetails: 'Non-refundable. Full booking fee charged immediately at confirmation.',
    minStayNights: 2,
    maxStayNights: 14,
    status: 'Active',
    createdAt: '2026-08-10'
  },
  {
    id: 'RP-004',
    code: 'CORP',
    name: 'Corporate Executive Rate',
    description: 'Contracted business tier with high-speed internet, ironing service, and lounge access.',
    roomType: 'Executive Suite',
    mealPlan: 'Breakfast Included',
    baseRate: 22000,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 4000,
    extraChildRate: 2000,
    cancellationPolicy: 'Moderate',
    cancellationDetails: 'Free cancellation up to 3 days prior to check-in. 1 night charge afterwards.',
    minStayNights: 1,
    maxStayNights: 60,
    status: 'Active',
    createdAt: '2026-08-15'
  },
  {
    id: 'RP-005',
    code: 'HB-DLX',
    name: 'Breakfast & Dinner Special',
    description: 'Includes buffet breakfast and a 3-course dinner daily at Royal Dine.',
    roomType: 'Deluxe Room',
    mealPlan: 'Breakfast + Dinner',
    baseRate: 17500,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 4500,
    extraChildRate: 2200,
    cancellationPolicy: 'Moderate',
    cancellationDetails: 'Free cancellation up to 48 hours before check-in date.',
    minStayNights: 2,
    maxStayNights: 21,
    status: 'Active',
    createdAt: '2026-08-18'
  },
  {
    id: 'RP-006',
    code: 'FB-PRES',
    name: 'Presidential All-Inclusive VIP',
    description: 'All-inclusive luxury dining (breakfast, lunch, and dinner) + 24hr private butler.',
    roomType: 'Presidential Suite',
    mealPlan: 'All Meals Included',
    baseRate: 48000,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 8000,
    extraChildRate: 4000,
    cancellationPolicy: 'Strict',
    cancellationDetails: 'Free cancellation up to 7 days before arrival. 50% penalty afterwards.',
    minStayNights: 1,
    maxStayNights: 14,
    status: 'Active',
    createdAt: '2026-08-20'
  },
  {
    id: 'RP-007',
    code: 'LONG-STAY',
    name: 'Extended Stay Saver (7+ Nights)',
    description: 'Deeply discounted tier for guests booking 7 or more consecutive nights.',
    roomType: 'Standard Room',
    mealPlan: 'Room Only',
    baseRate: 8000,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 1800,
    extraChildRate: 900,
    cancellationPolicy: 'Moderate',
    cancellationDetails: 'Free cancellation up to 5 days before scheduled arrival date.',
    minStayNights: 7,
    maxStayNights: 90,
    status: 'Inactive',
    createdAt: '2026-08-25'
  },
  {
    id: 'RP-008',
    code: 'WKND-SPL',
    name: 'Weekend Leisure Getaway',
    description: 'Friday to Sunday package with complimentary late checkout until 16:00.',
    roomType: 'Deluxe Room',
    mealPlan: 'Breakfast Included',
    baseRate: 15500,
    currency: 'PKR',
    pricingType: 'Per Night',
    extraAdultRate: 3000,
    extraChildRate: 1500,
    cancellationPolicy: 'Flexible',
    cancellationDetails: 'Free cancellation up to 24 hours prior to check-in.',
    minStayNights: 2,
    maxStayNights: 3,
    status: 'Active',
    createdAt: '2026-09-01'
  }
];

export const INITIAL_DISCOUNTS = [
  {
    id: 'DISC-001',
    name: 'Weekend Leisure Offer',
    code: 'WEEKEND10',
    description: 'Special 10% discount applicable for all weekend bookings.',
    discountType: 'Percentage',
    discountValue: 10,
    applicableRatePlan: 'Best Available Rate',
    applicableRoomType: 'All Room Types',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    minStayNights: 2,
    maxRedemptions: 150,
    currentRedemptions: 48,
    status: 'Active'
  },
  {
    id: 'DISC-002',
    name: 'Early Bird Autumn Promo',
    code: 'EARLYBIRD15',
    description: '15% off for reservations confirmed at least 21 days in advance.',
    discountType: 'Percentage',
    discountValue: 15,
    applicableRatePlan: 'Bed & Breakfast Package',
    applicableRoomType: 'Deluxe Room',
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    minStayNights: 3,
    maxRedemptions: 200,
    currentRedemptions: 62,
    status: 'Active'
  },
  {
    id: 'DISC-003',
    name: 'Executive Long Stay Rebate',
    code: 'LONGSTAY3K',
    description: 'Fixed PKR 3,000 deduction on extended corporate reservations.',
    discountType: 'Fixed Amount',
    discountValue: 3000,
    currency: 'PKR',
    applicableRatePlan: 'Corporate Executive Rate',
    applicableRoomType: 'Executive Suite',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    minStayNights: 5,
    maxRedemptions: 100,
    currentRedemptions: 19,
    status: 'Active'
  },
  {
    id: 'DISC-004',
    name: 'Summer Flash Deal',
    code: 'SUMMER2026',
    description: 'Seasonal promotional markdown for family vacation bookings.',
    discountType: 'Percentage',
    discountValue: 20,
    applicableRatePlan: 'All Rate Plans',
    applicableRoomType: 'All Room Types',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    minStayNights: 1,
    maxRedemptions: 300,
    currentRedemptions: 300,
    status: 'Expired'
  },
  {
    id: 'DISC-005',
    name: 'VIP Loyalty Voucher',
    code: 'LOYALTY5K',
    description: 'Exclusive fixed cash reduction for returning members and VIP cardholders.',
    discountType: 'Fixed Amount',
    discountValue: 5000,
    currency: 'PKR',
    applicableRatePlan: 'Presidential Full Board VIP',
    applicableRoomType: 'Presidential Suite',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    minStayNights: 1,
    maxRedemptions: 50,
    currentRedemptions: 12,
    status: 'Active'
  },
  {
    id: 'DISC-006',
    name: 'Off-Peak Midweek Promo',
    code: 'MIDWEEK12',
    description: '12% discount on Monday through Wednesday check-ins.',
    discountType: 'Percentage',
    discountValue: 12,
    applicableRatePlan: 'Best Available Rate',
    applicableRoomType: 'Standard Room',
    startDate: '2026-09-10',
    endDate: '2026-10-25',
    minStayNights: 1,
    maxRedemptions: 100,
    currentRedemptions: 7,
    status: 'Inactive'
  }
];

export const INITIAL_TAXES = [
  {
    id: 'TAX-001',
    name: 'General Sales Tax (GST)',
    code: 'GST15',
    description: 'Federal statutory value-added sales tax applied to accommodation room charges.',
    calculationType: 'Percentage',
    value: 15,
    appliesTo: 'Room Charges',
    taxNature: 'Exclusive',
    status: 'Active',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'TAX-002',
    name: 'City Tourism Development Surcharge',
    code: 'TOUR500',
    description: 'Mandatory municipal tourist infrastructure levy assessed per occupied room night.',
    calculationType: 'Fixed Amount',
    value: 500,
    currency: 'PKR',
    appliesTo: 'Per Night',
    taxNature: 'Exclusive',
    status: 'Active',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'TAX-003',
    name: 'Provincial Services Tax (PST)',
    code: 'PST13',
    description: 'Provincial revenue tax levied on food, beverages, and hospitality service bills.',
    calculationType: 'Percentage',
    value: 13,
    appliesTo: 'Food & Beverage',
    taxNature: 'Inclusive',
    status: 'Active',
    effectiveDate: '2026-01-01'
  },
  {
    id: 'TAX-004',
    name: 'Environmental Eco Green Levy',
    code: 'ECO200',
    description: 'Environmental sustainability fee dedicated to regional green conservation projects.',
    calculationType: 'Fixed Amount',
    value: 200,
    currency: 'PKR',
    appliesTo: 'Per Night',
    taxNature: 'Exclusive',
    status: 'Active',
    effectiveDate: '2026-03-01'
  },
  {
    id: 'TAX-005',
    name: 'Luxury Accommodation Surtax',
    code: 'LUX7',
    description: 'Additional luxury tax levied on Presidential and Executive Suite bookings.',
    calculationType: 'Percentage',
    value: 7.5,
    appliesTo: 'Room Charges',
    taxNature: 'Exclusive',
    status: 'Inactive',
    effectiveDate: '2026-06-01'
  }
];

export const INITIAL_FEES = [
  {
    id: 'FEE-001',
    name: 'Hotel Hospitality Service Charge',
    code: 'SERVICE10',
    description: 'Standard gratuity and operational service charge distributed among hotel staff.',
    calculationType: 'Percentage',
    value: 10,
    appliesTo: 'Total Bill',
    status: 'Active'
  },
  {
    id: 'FEE-002',
    name: 'Rollaway Extra Bed Charge',
    code: 'EXTRABED',
    description: 'Supplementary rollaway bedding including extra linens, pillows, and room setup.',
    calculationType: 'Fixed Amount',
    value: 2000,
    currency: 'PKR',
    appliesTo: 'Per Night',
    status: 'Active'
  },
  {
    id: 'FEE-003',
    name: 'Executive Airport VIP Shuttle',
    code: 'SHUTTLE',
    description: 'Private chauffeur airport pick-up or drop-off transfer service.',
    calculationType: 'Fixed Amount',
    value: 3500,
    currency: 'PKR',
    appliesTo: 'Per Booking',
    status: 'Active'
  },
  {
    id: 'FEE-004',
    name: 'Guaranteed Late Check-out Fee',
    code: 'LATECO',
    description: 'Permits extended guest room occupancy up to 18:00 on day of departure.',
    calculationType: 'Fixed Amount',
    value: 1500,
    currency: 'PKR',
    appliesTo: 'Per Booking',
    status: 'Active'
  },
  {
    id: 'FEE-005',
    name: 'Spa & Wellness Club Access',
    code: 'SPAPASS',
    description: 'Daily entry pass for sauna, steam room, jacuzzi, and thermal heated pool.',
    calculationType: 'Fixed Amount',
    value: 800,
    currency: 'PKR',
    appliesTo: 'Per Guest',
    status: 'Inactive'
  }
];

// LocalStorage helpers for persistence
const STORAGE_KEYS = {
  RATE_PLANS: 'hm_rate_plans_v2',
  DISCOUNTS: 'hm_discounts_v2',
  TAXES: 'hm_taxes_v2',
  FEES: 'hm_fees_v2'
};

// Rate Plans CRUD
export const getRatePlans = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RATE_PLANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RATE_PLANS, JSON.stringify(INITIAL_RATE_PLANS));
      return INITIAL_RATE_PLANS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RATE_PLANS;
  }
};

export const saveRatePlans = (plans) => {
  localStorage.setItem(STORAGE_KEYS.RATE_PLANS, JSON.stringify(plans));
};

export const addRatePlan = (newPlan) => {
  const plans = getRatePlans();
  const id = `RP-${String(plans.length + 1).padStart(3, '0')}`;
  const planWithId = {
    ...newPlan,
    id,
    currency: newPlan.currency || 'PKR',
    pricingType: newPlan.pricingType || 'Per Night',
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [planWithId, ...plans];
  saveRatePlans(updated);
  return updated;
};

export const updateRatePlan = (id, updatedFields) => {
  const plans = getRatePlans();
  const updated = plans.map(p => p.id === id ? { ...p, ...updatedFields } : p);
  saveRatePlans(updated);
  return updated;
};

export const deleteRatePlan = (id) => {
  const plans = getRatePlans();
  const updated = plans.filter(p => p.id !== id);
  saveRatePlans(updated);
  return updated;
};

export const toggleRatePlanStatus = (id) => {
  const plans = getRatePlans();
  const updated = plans.map(p => {
    if (p.id === id) {
      return { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' };
    }
    return p;
  });
  saveRatePlans(updated);
  return updated;
};

// Discounts CRUD
export const getDiscounts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(INITIAL_DISCOUNTS));
      return INITIAL_DISCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DISCOUNTS;
  }
};

export const saveDiscounts = (discounts) => {
  localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(discounts));
};

export const addDiscount = (newDiscount) => {
  const discounts = getDiscounts();
  const id = `DISC-${String(discounts.length + 1).padStart(3, '0')}`;
  const discountWithId = {
    ...newDiscount,
    id,
    currentRedemptions: 0,
    currency: newDiscount.currency || 'PKR'
  };
  const updated = [discountWithId, ...discounts];
  saveDiscounts(updated);
  return updated;
};

export const updateDiscount = (id, updatedFields) => {
  const discounts = getDiscounts();
  const updated = discounts.map(d => d.id === id ? { ...d, ...updatedFields } : d);
  saveDiscounts(updated);
  return updated;
};

export const deleteDiscount = (id) => {
  const discounts = getDiscounts();
  const updated = discounts.filter(d => d.id !== id);
  saveDiscounts(updated);
  return updated;
};

export const toggleDiscountStatus = (id) => {
  const discounts = getDiscounts();
  const updated = discounts.map(d => {
    if (d.id === id) {
      const nextStatus = d.status === 'Active' ? 'Inactive' : 'Active';
      return { ...d, status: nextStatus };
    }
    return d;
  });
  saveDiscounts(updated);
  return updated;
};

// Taxes CRUD
export const getTaxes = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TAXES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TAXES, JSON.stringify(INITIAL_TAXES));
      return INITIAL_TAXES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TAXES;
  }
};

export const saveTaxes = (taxes) => {
  localStorage.setItem(STORAGE_KEYS.TAXES, JSON.stringify(taxes));
};

export const addTax = (newTax) => {
  const taxes = getTaxes();
  const id = `TAX-${String(taxes.length + 1).padStart(3, '0')}`;
  const taxWithId = {
    ...newTax,
    id,
    currency: newTax.currency || 'PKR',
    effectiveDate: newTax.effectiveDate || new Date().toISOString().split('T')[0]
  };
  const updated = [taxWithId, ...taxes];
  saveTaxes(updated);
  return updated;
};

export const updateTax = (id, updatedFields) => {
  const taxes = getTaxes();
  const updated = taxes.map(t => t.id === id ? { ...t, ...updatedFields } : t);
  saveTaxes(updated);
  return updated;
};

export const deleteTax = (id) => {
  const taxes = getTaxes();
  const updated = taxes.filter(t => t.id !== id);
  saveTaxes(updated);
  return updated;
};

export const toggleTaxStatus = (id) => {
  const taxes = getTaxes();
  const updated = taxes.map(t => {
    if (t.id === id) {
      return { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' };
    }
    return t;
  });
  saveTaxes(updated);
  return updated;
};

// Fees CRUD
export const getFees = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FEES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(INITIAL_FEES));
      return INITIAL_FEES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FEES;
  }
};

export const saveFees = (fees) => {
  localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
};

export const addFee = (newFee) => {
  const fees = getFees();
  const id = `FEE-${String(fees.length + 1).padStart(3, '0')}`;
  const feeWithId = {
    ...newFee,
    id,
    currency: newFee.currency || 'PKR'
  };
  const updated = [feeWithId, ...fees];
  saveFees(updated);
  return updated;
};

export const updateFee = (id, updatedFields) => {
  const fees = getFees();
  const updated = fees.map(f => f.id === id ? { ...f, ...updatedFields } : f);
  saveFees(updated);
  return updated;
};

export const deleteFee = (id) => {
  const fees = getFees();
  const updated = fees.filter(f => f.id !== id);
  saveFees(updated);
  return updated;
};

export const toggleFeeStatus = (id) => {
  const fees = getFees();
  const updated = fees.map(f => {
    if (f.id === id) {
      return { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' };
    }
    return f;
  });
  saveFees(updated);
  return updated;
};

// Reset all store data to defaults
export const resetRatesPricingStore = () => {
  localStorage.setItem(STORAGE_KEYS.RATE_PLANS, JSON.stringify(INITIAL_RATE_PLANS));
  localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(INITIAL_DISCOUNTS));
  localStorage.setItem(STORAGE_KEYS.TAXES, JSON.stringify(INITIAL_TAXES));
  localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(INITIAL_FEES));
};
