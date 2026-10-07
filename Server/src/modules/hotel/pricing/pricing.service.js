import { getModel } from '../../../database/hotel/modelFactory.js';
import ApiError from '../../../utils/apiError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';

// ============================================================
// RATE PLANS SEEDING & CRUD
// ============================================================

export const ensureDefaultRatePlans = async (tenantConn) => {
  const RatePlan = await getModel(tenantConn, 'RatePlan');
  const count = await RatePlan.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        code: 'BAR',
        name: 'Best Available Rate',
        description: 'Standard flexible room rate with no special package inclusions.',
        room_type: 'Deluxe Room',
        meal_plan: 'Room Only',
        base_rate: 12000,
        currency: 'PKR',
        pricing_type: 'Per Night',
        extra_adult_rate: 2500,
        extra_child_rate: 1200,
        cancellation_policy: 'Flexible',
        cancellation_details: 'Free cancellation up to 24 hours prior to 14:00 check-in time.',
        min_stay_nights: 1,
        max_stay_nights: 30,
        status: 'Active',
      },
      {
        code: 'BBF',
        name: 'Bed & Breakfast Package',
        description: 'Inclusive of daily international buffet breakfast at the hotel restaurant.',
        room_type: 'Deluxe Room',
        meal_plan: 'Breakfast Included',
        base_rate: 14000,
        currency: 'PKR',
        pricing_type: 'Per Night',
        extra_adult_rate: 3500,
        extra_child_rate: 1800,
        cancellation_policy: 'Flexible',
        cancellation_details: 'Free cancellation up to 48 hours prior to check-in date.',
        min_stay_nights: 1,
        max_stay_nights: 30,
        status: 'Active',
      },
      {
        code: 'NRF',
        name: 'Non-Refundable Advance Saver',
        description: 'Special discounted prepaid rate. 100% non-refundable upon booking.',
        room_type: 'Standard Room',
        meal_plan: 'Room Only',
        base_rate: 9500,
        currency: 'PKR',
        pricing_type: 'Per Night',
        extra_adult_rate: 2000,
        extra_child_rate: 1000,
        cancellation_policy: 'Non-Refundable',
        cancellation_details: 'Non-refundable. Full booking fee charged immediately at confirmation.',
        min_stay_nights: 2,
        max_stay_nights: 14,
        status: 'Active',
      },
    ];
    await RatePlan.insertMany(defaults, { ordered: false });
  }
};

export const getRatePlans = async (tenantConn) => {
  await ensureDefaultRatePlans(tenantConn);
  const RatePlan = await getModel(tenantConn, 'RatePlan');
  return await RatePlan.find({}).sort({ created_at: -1 });
};

export const createRatePlan = async (tenantConn, data) => {
  const RatePlan = await getModel(tenantConn, 'RatePlan');
  const code = (data.code || '').trim().toUpperCase();
  const existing = await RatePlan.findOne({ code });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Rate Plan with code "${code}" already exists.`);
  }

  const newPlan = new RatePlan({
    code,
    name: data.name,
    description: data.description || '',
    room_type: data.room_type || data.roomType || 'Deluxe Room',
    meal_plan: data.meal_plan || data.mealPlan || 'Room Only',
    base_rate: data.base_rate !== undefined ? data.base_rate : (data.baseRate || 0),
    currency: data.currency || 'PKR',
    pricing_type: data.pricing_type || data.pricingType || 'Per Night',
    extra_adult_rate: data.extra_adult_rate !== undefined ? data.extra_adult_rate : (data.extraAdultRate || 0),
    extra_child_rate: data.extra_child_rate !== undefined ? data.extra_child_rate : (data.extraChildRate || 0),
    cancellation_policy: data.cancellation_policy || data.cancellationPolicy || 'Flexible',
    cancellation_details: data.cancellation_details || data.cancellationDetails || '',
    min_stay_nights: data.min_stay_nights || data.minStayNights || 1,
    max_stay_nights: data.max_stay_nights || data.maxStayNights || 30,
    status: data.status || 'Active',
  });

  return await newPlan.save();
};

export const updateRatePlan = async (tenantConn, id, data) => {
  const RatePlan = await getModel(tenantConn, 'RatePlan');
  const plan = await RatePlan.findById(id);
  if (!plan) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Rate Plan not found.');
  }

  if (data.code && data.code.toUpperCase() !== plan.code) {
    const existing = await RatePlan.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Rate Plan with code "${data.code}" already exists.`);
    }
    plan.code = data.code.toUpperCase();
  }

  if (data.name !== undefined) plan.name = data.name;
  if (data.description !== undefined) plan.description = data.description;
  if (data.room_type !== undefined || data.roomType !== undefined) plan.room_type = data.room_type || data.roomType;
  if (data.meal_plan !== undefined || data.mealPlan !== undefined) plan.meal_plan = data.meal_plan || data.mealPlan;
  if (data.base_rate !== undefined || data.baseRate !== undefined) plan.base_rate = data.base_rate !== undefined ? data.base_rate : data.baseRate;
  if (data.currency !== undefined) plan.currency = data.currency;
  if (data.pricing_type !== undefined || data.pricingType !== undefined) plan.pricing_type = data.pricing_type || data.pricingType;
  if (data.extra_adult_rate !== undefined || data.extraAdultRate !== undefined) plan.extra_adult_rate = data.extra_adult_rate !== undefined ? data.extra_adult_rate : data.extraAdultRate;
  if (data.extra_child_rate !== undefined || data.extraChildRate !== undefined) plan.extra_child_rate = data.extra_child_rate !== undefined ? data.extra_child_rate : data.extraChildRate;
  if (data.cancellation_policy !== undefined || data.cancellationPolicy !== undefined) plan.cancellation_policy = data.cancellation_policy || data.cancellationPolicy;
  if (data.cancellation_details !== undefined || data.cancellationDetails !== undefined) plan.cancellation_details = data.cancellation_details || data.cancellationDetails;
  if (data.min_stay_nights !== undefined || data.minStayNights !== undefined) plan.min_stay_nights = data.min_stay_nights || data.minStayNights;
  if (data.max_stay_nights !== undefined || data.maxStayNights !== undefined) plan.max_stay_nights = data.max_stay_nights || data.maxStayNights;
  if (data.status !== undefined) plan.status = data.status;

  return await plan.save();
};

export const deleteRatePlan = async (tenantConn, id) => {
  const RatePlan = await getModel(tenantConn, 'RatePlan');
  const plan = await RatePlan.findByIdAndDelete(id);
  if (!plan) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Rate Plan not found.');
  }
  return { message: 'Rate Plan deleted successfully', id };
};

export const toggleRatePlanStatus = async (tenantConn, id) => {
  const RatePlan = await getModel(tenantConn, 'RatePlan');
  const plan = await RatePlan.findById(id);
  if (!plan) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Rate Plan not found.');
  }
  plan.status = plan.status === 'Active' || plan.status === 'ACTIVE' ? 'Inactive' : 'Active';
  return await plan.save();
};

// ============================================================
// DISCOUNTS SEEDING & CRUD
// ============================================================

export const ensureDefaultDiscounts = async (tenantConn) => {
  const Discount = await getModel(tenantConn, 'Discount');
  const count = await Discount.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        code: 'EARLYBIRD',
        name: 'Early Bird Promotion',
        description: '15% off for bookings confirmed at least 14 days prior to arrival.',
        discount_type: 'Percentage',
        value: 15,
        applicable_rate_plan: 'Best Available Rate',
        valid_from: new Date('2026-08-01'),
        valid_to: new Date('2026-12-31'),
        min_nights: 2,
        max_usage_count: 100,
        current_usage_count: 42,
        status: 'Active',
      },
      {
        code: 'WEEKEND30',
        name: 'Weekend Getaway Saver',
        description: 'Fixed PKR 3,000 discount on 2-night minimum weekend stays.',
        discount_type: 'Fixed',
        value: 3000,
        applicable_rate_plan: 'Bed & Breakfast Package',
        valid_from: new Date('2026-08-01'),
        valid_to: new Date('2026-11-30'),
        min_nights: 2,
        max_usage_count: 50,
        current_usage_count: 19,
        status: 'Active',
      },
    ];
    await Discount.insertMany(defaults, { ordered: false });
  }
};

export const getDiscounts = async (tenantConn) => {
  await ensureDefaultDiscounts(tenantConn);
  const Discount = await getModel(tenantConn, 'Discount');
  return await Discount.find({}).sort({ created_at: -1 });
};

export const createDiscount = async (tenantConn, data) => {
  const Discount = await getModel(tenantConn, 'Discount');
  const code = (data.code || '').trim().toUpperCase();
  const existing = await Discount.findOne({ code });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Discount with code "${code}" already exists.`);
  }

  const newDiscount = new Discount({
    code,
    name: data.name,
    description: data.description || '',
    discount_type: data.discount_type || data.type || 'Percentage',
    value: data.value || 0,
    applicable_rate_plan: data.applicable_rate_plan || data.applicableRatePlan || 'All Rate Plans',
    valid_from: data.valid_from || data.validFrom || null,
    valid_to: data.valid_to || data.validTo || null,
    min_nights: data.min_nights || data.minNights || 1,
    max_usage_count: data.max_usage_count || data.maxUsageCount || 100,
    current_usage_count: data.current_usage_count || 0,
    status: data.status || 'Active',
  });

  return await newDiscount.save();
};

export const updateDiscount = async (tenantConn, id, data) => {
  const Discount = await getModel(tenantConn, 'Discount');
  const discount = await Discount.findById(id);
  if (!discount) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Discount not found.');
  }

  if (data.code && data.code.toUpperCase() !== discount.code) {
    const existing = await Discount.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Discount with code "${data.code}" already exists.`);
    }
    discount.code = data.code.toUpperCase();
  }

  if (data.name !== undefined) discount.name = data.name;
  if (data.description !== undefined) discount.description = data.description;
  if (data.discount_type !== undefined || data.type !== undefined) discount.discount_type = data.discount_type || data.type;
  if (data.value !== undefined) discount.value = data.value;
  if (data.applicable_rate_plan !== undefined || data.applicableRatePlan !== undefined) discount.applicable_rate_plan = data.applicable_rate_plan || data.applicableRatePlan;
  if (data.valid_from !== undefined || data.validFrom !== undefined) discount.valid_from = data.valid_from || data.validFrom;
  if (data.valid_to !== undefined || data.validTo !== undefined) discount.valid_to = data.valid_to || data.validTo;
  if (data.min_nights !== undefined || data.minNights !== undefined) discount.min_nights = data.min_nights || data.minNights;
  if (data.max_usage_count !== undefined || data.maxUsageCount !== undefined) discount.max_usage_count = data.max_usage_count || data.maxUsageCount;
  if (data.status !== undefined) discount.status = data.status;

  return await discount.save();
};

export const deleteDiscount = async (tenantConn, id) => {
  const Discount = await getModel(tenantConn, 'Discount');
  const discount = await Discount.findByIdAndDelete(id);
  if (!discount) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Discount not found.');
  }
  return { message: 'Discount deleted successfully', id };
};

export const toggleDiscountStatus = async (tenantConn, id) => {
  const Discount = await getModel(tenantConn, 'Discount');
  const discount = await Discount.findById(id);
  if (!discount) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Discount not found.');
  }
  discount.status = discount.status === 'Active' || discount.status === 'ACTIVE' ? 'Inactive' : 'Active';
  return await discount.save();
};

// ============================================================
// TAXES SEEDING & CRUD
// ============================================================

export const ensureDefaultTaxes = async (tenantConn) => {
  const Tax = await getModel(tenantConn, 'Tax');
  const count = await Tax.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        code: 'GST',
        name: 'General Sales Tax (GST)',
        rate: 16,
        percentage: 16,
        calc_type: 'Percentage',
        applicable_on: 'Room Charge & Extra Services',
        is_compound: false,
        status: 'Active',
      },
      {
        code: 'CITY',
        name: 'Municipal City Tax',
        rate: 5,
        percentage: 5,
        calc_type: 'Percentage',
        applicable_on: 'Room Charge Only',
        is_compound: false,
        status: 'Active',
      },
    ];
    await Tax.insertMany(defaults, { ordered: false });
  }
};

export const getTaxes = async (tenantConn) => {
  await ensureDefaultTaxes(tenantConn);
  const Tax = await getModel(tenantConn, 'Tax');
  return await Tax.find({}).sort({ created_at: -1 });
};

export const createTax = async (tenantConn, data) => {
  const Tax = await getModel(tenantConn, 'Tax');
  const code = (data.code || '').trim().toUpperCase();
  const existing = await Tax.findOne({ code });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Tax with code "${code}" already exists.`);
  }

  const rate = data.rate !== undefined ? data.rate : (data.percentage || 0);
  const newTax = new Tax({
    code,
    name: data.name,
    rate,
    percentage: rate,
    calc_type: data.calc_type || data.calcType || 'Percentage',
    applicable_on: data.applicable_on || data.applicableOn || 'Room Charge & Extra Services',
    is_compound: data.is_compound !== undefined ? data.is_compound : (data.isCompound || false),
    status: data.status || 'Active',
  });

  return await newTax.save();
};

export const updateTax = async (tenantConn, id, data) => {
  const Tax = await getModel(tenantConn, 'Tax');
  const tax = await Tax.findById(id);
  if (!tax) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tax not found.');
  }

  if (data.code && data.code.toUpperCase() !== tax.code) {
    const existing = await Tax.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Tax with code "${data.code}" already exists.`);
    }
    tax.code = data.code.toUpperCase();
  }

  if (data.name !== undefined) tax.name = data.name;
  if (data.rate !== undefined || data.percentage !== undefined) {
    const rate = data.rate !== undefined ? data.rate : data.percentage;
    tax.rate = rate;
    tax.percentage = rate;
  }
  if (data.calc_type !== undefined || data.calcType !== undefined) tax.calc_type = data.calc_type || data.calcType;
  if (data.applicable_on !== undefined || data.applicableOn !== undefined) tax.applicable_on = data.applicable_on || data.applicableOn;
  if (data.is_compound !== undefined || data.isCompound !== undefined) tax.is_compound = data.is_compound !== undefined ? data.is_compound : data.isCompound;
  if (data.status !== undefined) tax.status = data.status;

  return await tax.save();
};

export const deleteTax = async (tenantConn, id) => {
  const Tax = await getModel(tenantConn, 'Tax');
  const tax = await Tax.findByIdAndDelete(id);
  if (!tax) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tax not found.');
  }
  return { message: 'Tax deleted successfully', id };
};

export const toggleTaxStatus = async (tenantConn, id) => {
  const Tax = await getModel(tenantConn, 'Tax');
  const tax = await Tax.findById(id);
  if (!tax) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tax not found.');
  }
  tax.status = tax.status === 'Active' || tax.status === 'ACTIVE' ? 'Inactive' : 'Active';
  return await tax.save();
};

// ============================================================
// FEES SEEDING & CRUD
// ============================================================

export const ensureDefaultFees = async (tenantConn) => {
  const Fee = await getModel(tenantConn, 'Fee');
  const count = await Fee.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        code: 'RESORT',
        name: 'Resort Infrastructure Fee',
        amount: 1500,
        calc_type: 'Per Night',
        charge_type: 'Room',
        status: 'Active',
      },
      {
        code: 'CLEANING',
        name: 'Deep Sanitization Cleaning Fee',
        amount: 2000,
        calc_type: 'Per Stay',
        charge_type: 'Room',
        status: 'Active',
      },
    ];
    await Fee.insertMany(defaults, { ordered: false });
  }
};

export const getFees = async (tenantConn) => {
  await ensureDefaultFees(tenantConn);
  const Fee = await getModel(tenantConn, 'Fee');
  return await Fee.find({}).sort({ created_at: -1 });
};

export const createFee = async (tenantConn, data) => {
  const Fee = await getModel(tenantConn, 'Fee');
  const code = (data.code || '').trim().toUpperCase();
  const existing = await Fee.findOne({ code });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Fee with code "${code}" already exists.`);
  }

  const newFee = new Fee({
    code,
    name: data.name,
    amount: data.amount || 0,
    calc_type: data.calc_type || data.calcType || 'Per Night',
    charge_type: data.charge_type || data.chargeType || 'Room',
    status: data.status || 'Active',
  });

  return await newFee.save();
};

export const updateFee = async (tenantConn, id, data) => {
  const Fee = await getModel(tenantConn, 'Fee');
  const fee = await Fee.findById(id);
  if (!fee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fee not found.');
  }

  if (data.code && data.code.toUpperCase() !== fee.code) {
    const existing = await Fee.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Fee with code "${data.code}" already exists.`);
    }
    fee.code = data.code.toUpperCase();
  }

  if (data.name !== undefined) fee.name = data.name;
  if (data.amount !== undefined) fee.amount = data.amount;
  if (data.calc_type !== undefined || data.calcType !== undefined) fee.calc_type = data.calc_type || data.calcType;
  if (data.charge_type !== undefined || data.chargeType !== undefined) fee.charge_type = data.charge_type || data.chargeType;
  if (data.status !== undefined) fee.status = data.status;

  return await fee.save();
};

export const deleteFee = async (tenantConn, id) => {
  const Fee = await getModel(tenantConn, 'Fee');
  const fee = await Fee.findByIdAndDelete(id);
  if (!fee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fee not found.');
  }
  return { message: 'Fee deleted successfully', id };
};

export const toggleFeeStatus = async (tenantConn, id) => {
  const Fee = await getModel(tenantConn, 'Fee');
  const fee = await Fee.findById(id);
  if (!fee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Fee not found.');
  }
  fee.status = fee.status === 'Active' || fee.status === 'ACTIVE' ? 'Inactive' : 'Active';
  return await fee.save();
};
