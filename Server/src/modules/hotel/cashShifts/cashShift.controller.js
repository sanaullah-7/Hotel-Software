import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { ROLES } from '../../../constants/roles.js';
import * as cashShiftService from './cashShift.service.js';

export const openShift = asyncHandler(async (req, res) => {
  const shift = await cashShiftService.openShift(req.hotelContext, req.body, req.user);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, shift, 'Cash shift opened successfully'));
});

export const getActiveShift = asyncHandler(async (req, res) => {
  const isManager = req.user.role === ROLES.HOTEL_ADMIN || req.user.role === ROLES.PLATFORM_ADMIN;
  const shift = await cashShiftService.getActiveShift(req.hotelContext, req.user, isManager);
  
  if (!shift) {
    return res
      .status(HTTP_STATUS.OK)
      .json(new ApiResponse(HTTP_STATUS.OK, null, 'No active shift found for current cashier'));
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, shift, 'Active cash shift retrieved successfully'));
});

export const closeShift = asyncHandler(async (req, res) => {
  const closedShift = await cashShiftService.closeShift(req.hotelContext, req.body, req.user);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, closedShift, 'Cash shift closed successfully. Z-Report generated.'));
});

export const getShiftById = asyncHandler(async (req, res) => {
  const shift = await cashShiftService.getShiftById(req.hotelContext, req.params.id, req.user);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, shift, 'Shift details retrieved successfully'));
});

export const getShifts = asyncHandler(async (req, res) => {
  const result = await cashShiftService.getShifts(req.hotelContext, req.query, req.user);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.shifts, 'Shifts retrieved successfully', result.pagination));
});
