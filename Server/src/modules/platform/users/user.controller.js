import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as userService from "./user.service.js";

export const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Users retrieved successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, user, "User details retrieved"));
});

export const activateUser = asyncHandler(async (req, res) => {
  const result = await userService.activateUser(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

export const suspendUser = asyncHandler(async (req, res) => {
  const result = await userService.suspendUser(req.params.id, req.body?.reason);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

export const assignHotel = asyncHandler(async (req, res) => {
  const result = await userService.assignUserHotel(req.params.id, req.body?.hotelId);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, stats, "User statistics retrieved"));
});
