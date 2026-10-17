import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import * as pricingService from './pricing.service.js';

// ======================== RATE PLANS ========================
export const getRatePlans = asyncHandler(async (req, res) => {
  const plans = await pricingService.getRatePlans(req.hotelContext);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, plans, 'Rate plans retrieved successfully'));
});

export const createRatePlan = asyncHandler(async (req, res) => {
  const plan = await pricingService.createRatePlan(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, plan, 'Rate plan created successfully'));
});

export const updateRatePlan = asyncHandler(async (req, res) => {
  const plan = await pricingService.updateRatePlan(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, plan, 'Rate plan updated successfully'));
});

export const deleteRatePlan = asyncHandler(async (req, res) => {
  const result = await pricingService.deleteRatePlan(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Rate plan deleted successfully'));
});

export const toggleRatePlanStatus = asyncHandler(async (req, res) => {
  const plan = await pricingService.toggleRatePlanStatus(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, plan, 'Rate plan status toggled successfully'));
});

// ======================== DISCOUNTS ========================
export const getDiscounts = asyncHandler(async (req, res) => {
  const discounts = await pricingService.getDiscounts(req.hotelContext);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, discounts, 'Discounts retrieved successfully'));
});

export const createDiscount = asyncHandler(async (req, res) => {
  const discount = await pricingService.createDiscount(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, discount, 'Discount created successfully'));
});

export const updateDiscount = asyncHandler(async (req, res) => {
  const discount = await pricingService.updateDiscount(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, discount, 'Discount updated successfully'));
});

export const deleteDiscount = asyncHandler(async (req, res) => {
  const result = await pricingService.deleteDiscount(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Discount deleted successfully'));
});

export const toggleDiscountStatus = asyncHandler(async (req, res) => {
  const discount = await pricingService.toggleDiscountStatus(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, discount, 'Discount status toggled successfully'));
});

// ======================== TAXES ========================
export const getTaxes = asyncHandler(async (req, res) => {
  const taxes = await pricingService.getTaxes(req.hotelContext);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, taxes, 'Taxes retrieved successfully'));
});

export const createTax = asyncHandler(async (req, res) => {
  const tax = await pricingService.createTax(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, tax, 'Tax created successfully'));
});

export const updateTax = asyncHandler(async (req, res) => {
  const tax = await pricingService.updateTax(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, tax, 'Tax updated successfully'));
});

export const deleteTax = asyncHandler(async (req, res) => {
  const result = await pricingService.deleteTax(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Tax deleted successfully'));
});

export const toggleTaxStatus = asyncHandler(async (req, res) => {
  const tax = await pricingService.toggleTaxStatus(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, tax, 'Tax status toggled successfully'));
});

// ======================== FEES ========================
export const getFees = asyncHandler(async (req, res) => {
  const fees = await pricingService.getFees(req.hotelContext);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, fees, 'Fees retrieved successfully'));
});

export const createFee = asyncHandler(async (req, res) => {
  const fee = await pricingService.createFee(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, fee, 'Fee created successfully'));
});

export const updateFee = asyncHandler(async (req, res) => {
  const fee = await pricingService.updateFee(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, fee, 'Fee updated successfully'));
});

export const deleteFee = asyncHandler(async (req, res) => {
  const result = await pricingService.deleteFee(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Fee deleted successfully'));
});

export const toggleFeeStatus = asyncHandler(async (req, res) => {
  const fee = await pricingService.toggleFeeStatus(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, fee, 'Fee status toggled successfully'));
});
