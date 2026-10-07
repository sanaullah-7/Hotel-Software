import Joi from 'joi';

// ======================== RATE PLANS ========================
export const createRatePlanSchema = Joi.object({
  code: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().allow('', null).default(''),
  room_type: Joi.string().allow('', null).default('Deluxe Room'),
  roomType: Joi.string().allow('', null),
  meal_plan: Joi.string().allow('', null).default('Room Only'),
  mealPlan: Joi.string().allow('', null),
  base_rate: Joi.number().min(0).default(0),
  baseRate: Joi.number().min(0),
  currency: Joi.string().default('PKR'),
  pricing_type: Joi.string().allow('', null).default('Per Night'),
  pricingType: Joi.string().allow('', null),
  extra_adult_rate: Joi.number().min(0).default(0),
  extraAdultRate: Joi.number().min(0),
  extra_child_rate: Joi.number().min(0).default(0),
  extraChildRate: Joi.number().min(0),
  cancellation_policy: Joi.string().allow('', null).default('Flexible'),
  cancellationPolicy: Joi.string().allow('', null),
  cancellation_details: Joi.string().allow('', null).default(''),
  cancellationDetails: Joi.string().allow('', null),
  min_stay_nights: Joi.number().min(1).default(1),
  minStayNights: Joi.number().min(1),
  max_stay_nights: Joi.number().min(1).default(30),
  maxStayNights: Joi.number().min(1),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE').default('Active'),
});

export const updateRatePlanSchema = Joi.object({
  code: Joi.string().trim(),
  name: Joi.string().trim(),
  description: Joi.string().allow('', null),
  room_type: Joi.string().allow('', null),
  roomType: Joi.string().allow('', null),
  meal_plan: Joi.string().allow('', null),
  mealPlan: Joi.string().allow('', null),
  base_rate: Joi.number().min(0),
  baseRate: Joi.number().min(0),
  currency: Joi.string(),
  pricing_type: Joi.string().allow('', null),
  pricingType: Joi.string().allow('', null),
  extra_adult_rate: Joi.number().min(0),
  extraAdultRate: Joi.number().min(0),
  extra_child_rate: Joi.number().min(0),
  extraChildRate: Joi.number().min(0),
  cancellation_policy: Joi.string().allow('', null),
  cancellationPolicy: Joi.string().allow('', null),
  cancellation_details: Joi.string().allow('', null),
  cancellationDetails: Joi.string().allow('', null),
  min_stay_nights: Joi.number().min(1),
  minStayNights: Joi.number().min(1),
  max_stay_nights: Joi.number().min(1),
  maxStayNights: Joi.number().min(1),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE'),
});

// ======================== DISCOUNTS ========================
export const createDiscountSchema = Joi.object({
  code: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  description: Joi.string().allow('', null).default(''),
  discount_type: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED').default('Percentage'),
  type: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'),
  value: Joi.number().min(0).required(),
  applicable_rate_plan: Joi.string().allow('', null).default('All Rate Plans'),
  applicableRatePlan: Joi.string().allow('', null),
  valid_from: Joi.date().iso().allow(null),
  validFrom: Joi.date().iso().allow(null),
  valid_to: Joi.date().iso().allow(null),
  validTo: Joi.date().iso().allow(null),
  min_nights: Joi.number().min(1).default(1),
  minNights: Joi.number().min(1),
  max_usage_count: Joi.number().min(1).default(100),
  maxUsageCount: Joi.number().min(1),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE').default('Active'),
});

export const updateDiscountSchema = Joi.object({
  code: Joi.string().trim(),
  name: Joi.string().trim(),
  description: Joi.string().allow('', null),
  discount_type: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'),
  type: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'),
  value: Joi.number().min(0),
  applicable_rate_plan: Joi.string().allow('', null),
  applicableRatePlan: Joi.string().allow('', null),
  valid_from: Joi.date().iso().allow(null),
  validFrom: Joi.date().iso().allow(null),
  valid_to: Joi.date().iso().allow(null),
  validTo: Joi.date().iso().allow(null),
  min_nights: Joi.number().min(1),
  minNights: Joi.number().min(1),
  max_usage_count: Joi.number().min(1),
  maxUsageCount: Joi.number().min(1),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE'),
});

// ======================== TAXES ========================
export const createTaxSchema = Joi.object({
  code: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  rate: Joi.number().min(0).required(),
  calc_type: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED').default('Percentage'),
  calcType: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'),
  applicable_on: Joi.string().allow('', null).default('Room Charge & Extra Services'),
  applicableOn: Joi.string().allow('', null),
  is_compound: Joi.boolean().default(false),
  isCompound: Joi.boolean(),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE').default('Active'),
});

export const updateTaxSchema = Joi.object({
  code: Joi.string().trim(),
  name: Joi.string().trim(),
  rate: Joi.number().min(0),
  calc_type: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'),
  calcType: Joi.string().valid('Percentage', 'Fixed', 'PERCENTAGE', 'FIXED'),
  applicable_on: Joi.string().allow('', null),
  applicableOn: Joi.string().allow('', null),
  is_compound: Joi.boolean(),
  isCompound: Joi.boolean(),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE'),
});

// ======================== FEES ========================
export const createFeeSchema = Joi.object({
  code: Joi.string().trim().required(),
  name: Joi.string().trim().required(),
  amount: Joi.number().min(0).required(),
  calc_type: Joi.string().allow('', null).default('Per Night'),
  calcType: Joi.string().allow('', null),
  charge_type: Joi.string().allow('', null).default('Room'),
  chargeType: Joi.string().allow('', null),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE').default('Active'),
});

export const updateFeeSchema = Joi.object({
  code: Joi.string().trim(),
  name: Joi.string().trim(),
  amount: Joi.number().min(0),
  calc_type: Joi.string().allow('', null),
  calcType: Joi.string().allow('', null),
  charge_type: Joi.string().allow('', null),
  chargeType: Joi.string().allow('', null),
  status: Joi.string().valid('Active', 'Inactive', 'ACTIVE', 'INACTIVE'),
});
