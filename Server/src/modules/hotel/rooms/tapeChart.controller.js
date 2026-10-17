import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { getTapeChartData } from "./tapeChart.service.js";

/**
 * Controller for GET /api/v1/hotel/rooms/tape-chart
 */
export const getTapeChart = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.validatedQuery || req.query;

  const tapeChartData = await getTapeChartData(req.hotelContext, {
    startDate,
    endDate,
  });

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, tapeChartData, "Tape chart retrieved successfully"));
});
