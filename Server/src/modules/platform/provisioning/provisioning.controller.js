import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as provisioningService from "./provisioning.service.js";

export const onboard = asyncHandler(async (req, res) => {
  // Pass req.user which contains the authenticated account context
  const result = await provisioningService.onboardHotel(req.user, req.body);
  
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, "Hotel onboarded successfully")
  );
});
