import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as housekeepingService from "./housekeeping.service.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.createTask(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, task, "Housekeeping task created successfully"));
});

export const getTasks = asyncHandler(async (req, res) => {
  const result = await housekeepingService.getTasks(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.tasks, "Housekeeping tasks retrieved successfully", result.pagination));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await housekeepingService.updateTask(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, task, "Housekeeping task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const result = await housekeepingService.deleteTask(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Housekeeping task deleted successfully"));
});
