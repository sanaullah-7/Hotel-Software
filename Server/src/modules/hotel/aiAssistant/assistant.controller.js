import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import * as assistantService from "./assistant.service.js";

export const askAssistant = asyncHandler(async (req, res) => {
  const result = await assistantService.askAssistant(
    req.hotelContext,
    req.body,
    req.user
  );
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Assistant response generated successfully"));
});

export const getAssistantSummary = asyncHandler(async (req, res) => {
  const result = await assistantService.getAssistantSummary(req.hotelContext);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Assistant summary retrieved successfully"));
});

export const getAssistantSuggestions = asyncHandler(async (req, res) => {
  const result = await assistantService.getAssistantSuggestions(req.hotelContext);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Assistant suggestions retrieved successfully"));
});
