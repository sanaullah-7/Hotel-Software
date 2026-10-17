import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as checkInOutService from "./checkInOut.service.js";

export const checkIn = asyncHandler(async (req, res) => {
  const result = await checkInOutService.checkIn(req.hotelContext, req.body, req.user);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, "Guest checked in successfully"));
});

export const checkOut = asyncHandler(async (req, res) => {
  const result = await checkInOutService.checkOut(
    req.hotelContext,
    {
      ...req.body,
      stay_id: req.params.id || req.body.stay_id,
    },
    req.user
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Guest checked out successfully"));
});

export const transferRoom = asyncHandler(async (req, res) => {
  const result = await checkInOutService.transferRoom(req.hotelContext, req.params.id, req.body, req.user);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Room transferred successfully"));
});


export const getStays = asyncHandler(async (req, res) => {
  const result = await checkInOutService.getStays(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.stays, "Stays retrieved successfully", result.pagination));
});

export const getStayById = asyncHandler(async (req, res) => {
  const stay = await checkInOutService.getStayById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, stay, "Stay details retrieved successfully"));
});
