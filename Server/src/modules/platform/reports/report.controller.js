import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as reportService from "./report.service.js";

export const getHotelReport = asyncHandler(async (req, res) => {
  const data = await reportService.getHotelReport();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Hotel report retrieved successfully"));
});

export const getRevenueReport = asyncHandler(async (req, res) => {
  const data = await reportService.getRevenueReport();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "Revenue report retrieved successfully"));
});

export const getUserReport = asyncHandler(async (req, res) => {
  const data = await reportService.getUserReport();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, data, "User report retrieved successfully"));
});
