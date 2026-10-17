import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import * as reportService from "./report.service.js";

export const getRevenueReport = asyncHandler(async (req, res) => {
  const result = await reportService.getRevenueReport(req.hotelContext, req.query);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Revenue report retrieved successfully"));
});

export const getOccupancyReport = asyncHandler(async (req, res) => {
  const result = await reportService.getOccupancyReport(req.hotelContext, req.query);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Occupancy report retrieved successfully"));
});

export const getExpenseVsRevenueReport = asyncHandler(async (req, res) => {
  const result = await reportService.getExpenseVsRevenueReport(req.hotelContext, req.query);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Expense vs Revenue report retrieved successfully"));
});

export const getAllReportsSummary = asyncHandler(async (req, res) => {
  const result = await reportService.getAllReportsSummary(req.hotelContext);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Reports summary retrieved successfully"));
});
