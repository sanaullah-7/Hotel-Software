import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as guestChargeService from "./guestCharge.service.js";

export const createGuestCharge = asyncHandler(async (req, res) => {
  const charge = await guestChargeService.createGuestCharge(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, charge, "Guest charge created successfully"));
});

export const getGuestCharges = asyncHandler(async (req, res) => {
  const result = await guestChargeService.getGuestCharges(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.charges, "Guest charges retrieved successfully", result.pagination));
});

export const getGuestChargeById = asyncHandler(async (req, res) => {
  const charge = await guestChargeService.getGuestChargeById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, charge, "Guest charge details retrieved successfully"));
});

export const voidGuestCharge = asyncHandler(async (req, res) => {
  const charge = await guestChargeService.voidGuestCharge(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, charge, "Guest charge voided successfully"));
});
