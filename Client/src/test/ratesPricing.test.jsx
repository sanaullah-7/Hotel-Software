import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRatePlans, addRatePlan, updateRatePlan, deleteRatePlan, toggleRatePlanStatus,
  getDiscounts, addDiscount, updateDiscount, deleteDiscount, toggleDiscountStatus,
  getTaxes, addTax, updateTax, deleteTax, toggleTaxStatus,
  getFees, addFee, updateFee, deleteFee, toggleFeeStatus,
  resetRatesPricingStore, INITIAL_RATE_PLANS, INITIAL_DISCOUNTS, INITIAL_TAXES, INITIAL_FEES
} from '../features/rates-pricing/pages/ratesPricingStore';

describe('Rates & Pricing Store Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    resetRatesPricingStore();
  });

  // 1. Rate Plans Tests
  describe('Rate Plans Management', () => {
    it('initializes with default mock rate plans', () => {
      const plans = getRatePlans();
      expect(plans.length).toBe(INITIAL_RATE_PLANS.length);
      expect(plans[0].code).toBe('BAR');
      expect(plans[0].name).toBe('Best Available Rate');
    });

    it('adds a new rate plan with generated id and default currency', () => {
      const newPlan = {
        name: 'Winter Getaway Promo',
        code: 'WINTER26',
        roomType: 'Deluxe Room',
        mealPlan: 'Breakfast Included',
        baseRate: 16000,
        cancellationPolicy: 'Flexible',
        status: 'Active'
      };

      const updated = addRatePlan(newPlan);
      expect(updated.length).toBe(INITIAL_RATE_PLANS.length + 1);
      expect(updated[0].code).toBe('WINTER26');
      expect(updated[0].currency).toBe('PKR');
    });

    it('updates an existing rate plan correctly', () => {
      const plans = getRatePlans();
      const targetId = plans[0].id;

      const updated = updateRatePlan(targetId, { baseRate: 15500, name: 'Best Available Rate - Updated' });
      const found = updated.find(p => p.id === targetId);
      expect(found.baseRate).toBe(15500);
      expect(found.name).toBe('Best Available Rate - Updated');
    });

    it('toggles rate plan status between Active and Inactive', () => {
      const plans = getRatePlans();
      const targetId = plans[0].id;
      const initialStatus = plans[0].status;

      const updated = toggleRatePlanStatus(targetId);
      const found = updated.find(p => p.id === targetId);
      expect(found.status).toBe(initialStatus === 'Active' ? 'Inactive' : 'Active');
    });

    it('deletes a rate plan by id', () => {
      const plans = getRatePlans();
      const targetId = plans[0].id;

      const updated = deleteRatePlan(targetId);
      expect(updated.length).toBe(plans.length - 1);
      expect(updated.find(p => p.id === targetId)).toBeUndefined();
    });
  });

  // 2. Discounts Tests
  describe('Discounts Management', () => {
    it('initializes with realistic mock discounts', () => {
      const discounts = getDiscounts();
      expect(discounts.length).toBe(INITIAL_DISCOUNTS.length);
      expect(discounts[0].code).toBe('WEEKEND10');
      expect(discounts[0].discountType).toBe('Percentage');
    });

    it('adds a new fixed discount voucher', () => {
      const newDiscount = {
        name: 'New Year Special',
        code: 'NEWYEAR27',
        discountType: 'Fixed Amount',
        discountValue: 4000,
        applicableRatePlan: 'All Rate Plans',
        applicableRoomType: 'All Room Types',
        startDate: '2026-12-25',
        endDate: '2027-01-05',
        status: 'Active'
      };

      const updated = addDiscount(newDiscount);
      expect(updated.length).toBe(INITIAL_DISCOUNTS.length + 1);
      expect(updated[0].code).toBe('NEWYEAR27');
      expect(updated[0].discountValue).toBe(4000);
    });

    it('updates a discount voucher', () => {
      const discounts = getDiscounts();
      const targetId = discounts[0].id;

      const updated = updateDiscount(targetId, { discountValue: 12 });
      const found = updated.find(d => d.id === targetId);
      expect(found.discountValue).toBe(12);
    });

    it('toggles discount status', () => {
      const discounts = getDiscounts();
      const targetId = discounts[0].id;

      const updated = toggleDiscountStatus(targetId);
      const found = updated.find(d => d.id === targetId);
      expect(found.status).toBe('Inactive');
    });

    it('deletes a discount voucher', () => {
      const discounts = getDiscounts();
      const targetId = discounts[0].id;

      const updated = deleteDiscount(targetId);
      expect(updated.length).toBe(discounts.length - 1);
      expect(updated.find(d => d.id === targetId)).toBeUndefined();
    });
  });

  // 3. Taxes Management Tests
  describe('Taxes Management', () => {
    it('initializes with default taxes including GST and Tourism Surcharge', () => {
      const taxes = getTaxes();
      expect(taxes.length).toBe(INITIAL_TAXES.length);
      expect(taxes.some(t => t.code === 'GST15')).toBe(true);
      expect(taxes.some(t => t.code === 'TOUR500')).toBe(true);
    });

    it('adds a new tax rule', () => {
      const newTax = {
        name: 'Heritage Conservation Cess',
        code: 'HERITAGE2',
        calculationType: 'Percentage',
        value: 2.5,
        appliesTo: 'Room Charges',
        taxNature: 'Exclusive',
        status: 'Active'
      };

      const updated = addTax(newTax);
      expect(updated.length).toBe(INITIAL_TAXES.length + 1);
      expect(updated[0].code).toBe('HERITAGE2');
      expect(updated[0].value).toBe(2.5);
    });

    it('updates a tax rule', () => {
      const taxes = getTaxes();
      const targetId = taxes[0].id;

      const updated = updateTax(targetId, { value: 16 });
      const found = updated.find(t => t.id === targetId);
      expect(found.value).toBe(16);
    });

    it('toggles tax status', () => {
      const taxes = getTaxes();
      const targetId = taxes[0].id;

      const updated = toggleTaxStatus(targetId);
      const found = updated.find(t => t.id === targetId);
      expect(found.status).toBe('Inactive');
    });

    it('deletes a tax rule', () => {
      const taxes = getTaxes();
      const targetId = taxes[0].id;

      const updated = deleteTax(targetId);
      expect(updated.length).toBe(taxes.length - 1);
    });
  });

  // 4. Fees Management Tests
  describe('Fees Management', () => {
    it('initializes with default fees including Service Charge and Extra Bed Fee', () => {
      const fees = getFees();
      expect(fees.length).toBe(INITIAL_FEES.length);
      expect(fees.some(f => f.code === 'SERVICE10')).toBe(true);
      expect(fees.some(f => f.code === 'EXTRABED')).toBe(true);
    });

    it('adds a new fee surcharge', () => {
      const newFee = {
        name: 'Express Laundry Fee',
        code: 'EXPRESSLAUNDRY',
        calculationType: 'Fixed Amount',
        value: 1200,
        appliesTo: 'Room Service',
        status: 'Active'
      };

      const updated = addFee(newFee);
      expect(updated.length).toBe(INITIAL_FEES.length + 1);
      expect(updated[0].code).toBe('EXPRESSLAUNDRY');
    });

    it('updates a fee surcharge', () => {
      const fees = getFees();
      const targetId = fees[0].id;

      const updated = updateFee(targetId, { value: 12 });
      const found = updated.find(f => f.id === targetId);
      expect(found.value).toBe(12);
    });

    it('toggles fee status and updates', () => {
      const fees = getFees();
      const targetId = fees[0].id;

      const updated = toggleFeeStatus(targetId);
      const found = updated.find(f => f.id === targetId);
      expect(found.status).toBe('Inactive');
    });

    it('deletes a fee record', () => {
      const fees = getFees();
      const targetId = fees[0].id;

      const updated = deleteFee(targetId);
      expect(updated.length).toBe(fees.length - 1);
    });
  });
});
