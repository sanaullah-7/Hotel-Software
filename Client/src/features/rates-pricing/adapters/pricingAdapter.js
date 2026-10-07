export const toFrontendRatePlan = (p) => {
  if (!p) return null;
  return {
    id: p._id ? p._id.toString() : p.id,
    _id: p._id ? p._id.toString() : p.id,
    code: p.code || '',
    name: p.name || '',
    description: p.description || '',
    roomType: p.room_type || p.roomType || 'Deluxe Room',
    mealPlan: p.meal_plan || p.mealPlan || 'Room Only',
    baseRate: p.base_rate !== undefined ? p.base_rate : (p.baseRate || 0),
    currency: p.currency || 'PKR',
    pricingType: p.pricing_type || p.pricingType || 'Per Night',
    extraAdultRate: p.extra_adult_rate !== undefined ? p.extra_adult_rate : (p.extraAdultRate || 0),
    extraChildRate: p.extra_child_rate !== undefined ? p.extra_child_rate : (p.extraChildRate || 0),
    cancellationPolicy: p.cancellation_policy || p.cancellationPolicy || 'Flexible',
    cancellationDetails: p.cancellation_details || p.cancellationDetails || '',
    minStayNights: p.min_stay_nights !== undefined ? p.min_stay_nights : (p.minStayNights || 1),
    maxStayNights: p.max_stay_nights !== undefined ? p.max_stay_nights : (p.maxStayNights || 30),
    status: p.status || 'Active',
    createdAt: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : (p.createdAt || new Date().toISOString().split('T')[0]),
  };
};

export const toBackendRatePlanPayload = (p) => {
  return {
    code: p.code ? p.code.trim().toUpperCase() : '',
    name: p.name ? p.name.trim() : '',
    description: p.description || '',
    room_type: p.roomType || p.room_type || 'Deluxe Room',
    meal_plan: p.mealPlan || p.meal_plan || 'Room Only',
    base_rate: Number(p.baseRate ?? p.base_rate ?? 0),
    currency: p.currency || 'PKR',
    pricing_type: p.pricingType || p.pricing_type || 'Per Night',
    extra_adult_rate: Number(p.extraAdultRate ?? p.extra_adult_rate ?? 0),
    extra_child_rate: Number(p.extraChildRate ?? p.extra_child_rate ?? 0),
    cancellation_policy: p.cancellationPolicy || p.cancellation_policy || 'Flexible',
    cancellation_details: p.cancellationDetails || p.cancellation_details || '',
    min_stay_nights: Number(p.minStayNights ?? p.min_stay_nights ?? 1),
    max_stay_nights: Number(p.maxStayNights ?? p.max_stay_nights ?? 30),
    status: p.status || 'Active',
  };
};

export const toFrontendDiscount = (d) => {
  if (!d) return null;
  return {
    id: d._id ? d._id.toString() : d.id,
    _id: d._id ? d._id.toString() : d.id,
    code: d.code || '',
    name: d.name || d.description || '',
    description: d.description || '',
    type: d.discount_type || d.type || 'Percentage',
    value: Number(d.value || 0),
    applicableRatePlan: d.applicable_rate_plan || d.applicableRatePlan || 'All Rate Plans',
    validFrom: d.valid_from ? new Date(d.valid_from).toISOString().split('T')[0] : (d.validFrom || ''),
    validTo: d.valid_to ? new Date(d.valid_to).toISOString().split('T')[0] : (d.validTo || ''),
    minNights: d.min_nights !== undefined ? d.min_nights : (d.minNights || 1),
    maxUsageCount: d.max_usage_count !== undefined ? d.max_usage_count : (d.maxUsageCount || 100),
    currentUsageCount: d.current_usage_count !== undefined ? d.current_usage_count : (d.currentUsageCount || 0),
    status: d.status || 'Active',
    createdAt: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : (d.createdAt || new Date().toISOString().split('T')[0]),
  };
};

export const toBackendDiscountPayload = (d) => {
  return {
    code: d.code ? d.code.trim().toUpperCase() : '',
    name: d.name ? d.name.trim() : (d.description || ''),
    description: d.description || '',
    discount_type: d.type || d.discount_type || 'Percentage',
    value: Number(d.value || 0),
    applicable_rate_plan: d.applicableRatePlan || d.applicable_rate_plan || 'All Rate Plans',
    valid_from: d.validFrom || d.valid_from || undefined,
    valid_to: d.validTo || d.valid_to || undefined,
    min_nights: Number(d.minNights ?? d.min_nights ?? 1),
    max_usage_count: Number(d.maxUsageCount ?? d.max_usage_count ?? 100),
    status: d.status || 'Active',
  };
};

export const toFrontendTax = (t) => {
  if (!t) return null;
  return {
    id: t._id ? t._id.toString() : t.id,
    _id: t._id ? t._id.toString() : t.id,
    code: t.code || '',
    name: t.name || '',
    rate: t.rate !== undefined ? t.rate : (t.percentage || 0),
    calcType: t.calc_type || t.calcType || 'Percentage',
    applicableOn: t.applicable_on || t.applicableOn || 'Room Charge & Extra Services',
    isCompound: Boolean(t.is_compound ?? t.isCompound),
    status: t.status || 'Active',
    createdAt: t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : (t.createdAt || new Date().toISOString().split('T')[0]),
  };
};

export const toBackendTaxPayload = (t) => {
  const rate = Number(t.rate ?? t.percentage ?? 0);
  return {
    code: t.code ? t.code.trim().toUpperCase() : '',
    name: t.name ? t.name.trim() : '',
    rate,
    calc_type: t.calcType || t.calc_type || 'Percentage',
    applicable_on: t.applicableOn || t.applicable_on || 'Room Charge & Extra Services',
    is_compound: Boolean(t.isCompound ?? t.is_compound),
    status: t.status || 'Active',
  };
};

export const toFrontendFee = (f) => {
  if (!f) return null;
  return {
    id: f._id ? f._id.toString() : f.id,
    _id: f._id ? f._id.toString() : f.id,
    code: f.code || '',
    name: f.name || '',
    amount: Number(f.amount || 0),
    calcType: f.calc_type || f.calcType || 'Per Night',
    chargeType: f.charge_type || f.chargeType || 'Room',
    status: f.status || 'Active',
    createdAt: f.created_at ? new Date(f.created_at).toISOString().split('T')[0] : (f.createdAt || new Date().toISOString().split('T')[0]),
  };
};

export const toBackendFeePayload = (f) => {
  return {
    code: f.code ? f.code.trim().toUpperCase() : '',
    name: f.name ? f.name.trim() : '',
    amount: Number(f.amount || 0),
    calc_type: f.calcType || f.calc_type || 'Per Night',
    charge_type: f.chargeType || f.charge_type || 'Room',
    status: f.status || 'Active',
  };
};
