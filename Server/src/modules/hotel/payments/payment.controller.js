import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as paymentService from "./payment.service.js";

export const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.hotelContext, req.body, req.user);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, payment, "Payment recorded successfully"));
});

export const getPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getPayments(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.payments, "Payments retrieved successfully", result.pagination));
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, payment, "Payment details retrieved successfully"));
});
