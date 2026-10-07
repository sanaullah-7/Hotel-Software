import pricingService from '../../../services/pricingService.js';
import {
  toFrontendRatePlan,
  toBackendRatePlanPayload,
  toFrontendDiscount,
  toBackendDiscountPayload,
  toFrontendTax,
  toBackendTaxPayload,
  toFrontendFee,
  toBackendFeePayload,
} from '../adapters/pricingAdapter.js';
import { addAuditLog } from '../../audit/state/auditStore.js';

export const RATE_PLANS_UPDATED_EVENT = 'rate_plans_updated';
export const DISCOUNTS_UPDATED_EVENT = 'discounts_updated';
export const TAXES_UPDATED_EVENT = 'taxes_updated';
export const FEES_UPDATED_EVENT = 'fees_updated';

// In-memory runtime cache
let _ratePlans = [];
let _discounts = [];
let _taxes = [];
let _fees = [];

const notify = (eventName) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName));
  }
};

// ============================================================
// RATE PLANS
// ============================================================

export const getRatePlans = () => [..._ratePlans];

export const fetchRatePlans = async () => {
  try {
    const res = await pricingService.getRatePlans();
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    _ratePlans = list.map(toFrontendRatePlan);
    notify(RATE_PLANS_UPDATED_EVENT);
    return _ratePlans;
  } catch (err) {
    console.error('Failed to fetch rate plans from server:', err);
    return _ratePlans;
  }
};

export const addRatePlan = async (newPlan) => {
  const payload = toBackendRatePlanPayload(newPlan);
  const res = await pricingService.createRatePlan(payload);
  const created = toFrontendRatePlan(res?.data || res);
  _ratePlans = [created, ..._ratePlans.filter(p => p.id !== created.id)];
  notify(RATE_PLANS_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Create Rate Plan',
    recordId: created.code || created.id,
    description: `Created rate plan "${created.name}" (${created.code}) with base rate PKR ${created.baseRate}.`,
  });

  return created;
};

export const updateRatePlan = async (id, updatedFields) => {
  const payload = toBackendRatePlanPayload(updatedFields);
  const res = await pricingService.updateRatePlan(id, payload);
  const updated = toFrontendRatePlan(res?.data || res);
  _ratePlans = _ratePlans.map(p => (p.id === id || p._id === id) ? updated : p);
  notify(RATE_PLANS_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Update Rate Plan',
    recordId: updated.code || updated.id,
    description: `Updated rate plan "${updated.name}" (${updated.code}).`,
  });

  return updated;
};

export const deleteRatePlan = async (id) => {
  await pricingService.deleteRatePlan(id);
  _ratePlans = _ratePlans.filter(p => p.id !== id && p._id !== id);
  notify(RATE_PLANS_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Delete Rate Plan',
    recordId: id,
    description: `Deleted rate plan with ID ${id}.`,
  });

  return id;
};

export const toggleRatePlanStatus = async (id) => {
  const res = await pricingService.toggleRatePlanStatus(id);
  const updated = toFrontendRatePlan(res?.data || res);
  _ratePlans = _ratePlans.map(p => (p.id === id || p._id === id) ? updated : p);
  notify(RATE_PLANS_UPDATED_EVENT);
  return updated;
};

// ============================================================
// DISCOUNTS
// ============================================================

export const getDiscounts = () => [..._discounts];

export const fetchDiscounts = async () => {
  try {
    const res = await pricingService.getDiscounts();
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    _discounts = list.map(toFrontendDiscount);
    notify(DISCOUNTS_UPDATED_EVENT);
    return _discounts;
  } catch (err) {
    console.error('Failed to fetch discounts from server:', err);
    return _discounts;
  }
};

export const addDiscount = async (newDiscount) => {
  const payload = toBackendDiscountPayload(newDiscount);
  const res = await pricingService.createDiscount(payload);
  const created = toFrontendDiscount(res?.data || res);
  _discounts = [created, ..._discounts.filter(d => d.id !== created.id)];
  notify(DISCOUNTS_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Create Discount',
    recordId: created.code || created.id,
    description: `Created discount code "${created.code}" (${created.value}${created.type === 'Percentage' ? '%' : ' PKR'}).`,
  });

  return created;
};

export const updateDiscount = async (id, updatedFields) => {
  const payload = toBackendDiscountPayload(updatedFields);
  const res = await pricingService.updateDiscount(id, payload);
  const updated = toFrontendDiscount(res?.data || res);
  _discounts = _discounts.map(d => (d.id === id || d._id === id) ? updated : d);
  notify(DISCOUNTS_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Update Discount',
    recordId: updated.code || updated.id,
    description: `Updated discount code "${updated.code}".`,
  });

  return updated;
};

export const deleteDiscount = async (id) => {
  await pricingService.deleteDiscount(id);
  _discounts = _discounts.filter(d => d.id !== id && d._id !== id);
  notify(DISCOUNTS_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Delete Discount',
    recordId: id,
    description: `Deleted discount with ID ${id}.`,
  });

  return id;
};

export const toggleDiscountStatus = async (id) => {
  const res = await pricingService.toggleDiscountStatus(id);
  const updated = toFrontendDiscount(res?.data || res);
  _discounts = _discounts.map(d => (d.id === id || d._id === id) ? updated : d);
  notify(DISCOUNTS_UPDATED_EVENT);
  return updated;
};

// ============================================================
// TAXES
// ============================================================

export const getTaxes = () => [..._taxes];

export const fetchTaxes = async () => {
  try {
    const res = await pricingService.getTaxes();
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    _taxes = list.map(toFrontendTax);
    notify(TAXES_UPDATED_EVENT);
    return _taxes;
  } catch (err) {
    console.error('Failed to fetch taxes from server:', err);
    return _taxes;
  }
};

export const addTax = async (newTax) => {
  const payload = toBackendTaxPayload(newTax);
  const res = await pricingService.createTax(payload);
  const created = toFrontendTax(res?.data || res);
  _taxes = [created, ..._taxes.filter(t => t.id !== created.id)];
  notify(TAXES_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Create Tax',
    recordId: created.code || created.id,
    description: `Created tax rule "${created.name}" (${created.rate}%).`,
  });

  return created;
};

export const updateTax = async (id, updatedFields) => {
  const payload = toBackendTaxPayload(updatedFields);
  const res = await pricingService.updateTax(id, payload);
  const updated = toFrontendTax(res?.data || res);
  _taxes = _taxes.map(t => (t.id === id || t._id === id) ? updated : t);
  notify(TAXES_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Update Tax',
    recordId: updated.code || updated.id,
    description: `Updated tax rule "${updated.name}" (${updated.code}).`,
  });

  return updated;
};

export const deleteTax = async (id) => {
  await pricingService.deleteTax(id);
  _taxes = _taxes.filter(t => t.id !== id && t._id !== id);
  notify(TAXES_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Delete Tax',
    recordId: id,
    description: `Deleted tax rule with ID ${id}.`,
  });

  return id;
};

export const toggleTaxStatus = async (id) => {
  const res = await pricingService.toggleTaxStatus(id);
  const updated = toFrontendTax(res?.data || res);
  _taxes = _taxes.map(t => (t.id === id || t._id === id) ? updated : t);
  notify(TAXES_UPDATED_EVENT);
  return updated;
};

// ============================================================
// FEES
// ============================================================

export const getFees = () => [..._fees];

export const fetchFees = async () => {
  try {
    const res = await pricingService.getFees();
    const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    _fees = list.map(toFrontendFee);
    notify(FEES_UPDATED_EVENT);
    return _fees;
  } catch (err) {
    console.error('Failed to fetch fees from server:', err);
    return _fees;
  }
};

export const addFee = async (newFee) => {
  const payload = toBackendFeePayload(newFee);
  const res = await pricingService.createFee(payload);
  const created = toFrontendFee(res?.data || res);
  _fees = [created, ..._fees.filter(f => f.id !== created.id)];
  notify(FEES_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Create Fee',
    recordId: created.code || created.id,
    description: `Created hotel fee "${created.name}" (PKR ${created.amount}).`,
  });

  return created;
};

export const updateFee = async (id, updatedFields) => {
  const payload = toBackendFeePayload(updatedFields);
  const res = await pricingService.updateFee(id, payload);
  const updated = toFrontendFee(res?.data || res);
  _fees = _fees.map(f => (f.id === id || f._id === id) ? updated : f);
  notify(FEES_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Update Fee',
    recordId: updated.code || updated.id,
    description: `Updated fee "${updated.name}" (${updated.code}).`,
  });

  return updated;
};

export const deleteFee = async (id) => {
  await pricingService.deleteFee(id);
  _fees = _fees.filter(f => f.id !== id && f._id !== id);
  notify(FEES_UPDATED_EVENT);

  addAuditLog({
    module: 'Rates & Pricing',
    action: 'Delete Fee',
    recordId: id,
    description: `Deleted fee with ID ${id}.`,
  });

  return id;
};

export const toggleFeeStatus = async (id) => {
  const res = await pricingService.toggleFeeStatus(id);
  const updated = toFrontendFee(res?.data || res);
  _fees = _fees.map(f => (f.id === id || f._id === id) ? updated : f);
  notify(FEES_UPDATED_EVENT);
  return updated;
};

export const resetRatesPricingStore = async () => {
  await Promise.all([fetchRatePlans(), fetchDiscounts(), fetchTaxes(), fetchFees()]);
};
