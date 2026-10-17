import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as dashboardService from "./dashboard.service.js";

export const getDashboardMetrics = asyncHandler(async (req, res) => {
  const metrics = await dashboardService.getDashboardMetrics(req.hotelContext);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, metrics, "Dashboard metrics retrieved successfully"));
});
