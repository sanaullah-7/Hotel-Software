import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as refundService from "./refund.service.js";

export const createRefund = asyncHandler(async (req, res) => {
  const refund = await refundService.createRefund(req.hotelContext, req.body, req.user);
  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, refund, "Refund created successfully"));
});

export const getRefunds = asyncHandler(async (req, res) => {
  const result = await refundService.getRefunds(req.hotelContext, req.query);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Refunds retrieved successfully"));
});

export const getRefundById = asyncHandler(async (req, res) => {
  const refund = await refundService.getRefundById(req.hotelContext, req.params.id);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, refund, "Refund retrieved successfully"));
});
