import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as hotelRegistryService from "./hotelRegistry.service.js";

export const getHotels = asyncHandler(async (req, res) => {
  const result = await hotelRegistryService.listHotels(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Hotels retrieved successfully"));
});

export const getHotelStats = asyncHandler(async (req, res) => {
  const stats = await hotelRegistryService.getHotelStats();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, stats, "Hotel statistics retrieved"));
});

export const getHotelById = asyncHandler(async (req, res) => {
  const hotel = await hotelRegistryService.getHotelById(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, hotel, "Hotel details retrieved"));
});

export const approveHotel = asyncHandler(async (req, res) => {
  const result = await hotelRegistryService.approveHotel(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

export const rejectHotel = asyncHandler(async (req, res) => {
  const result = await hotelRegistryService.rejectHotel(req.params.id, req.body?.reason);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

export const suspendHotel = asyncHandler(async (req, res) => {
  const result = await hotelRegistryService.suspendHotel(req.params.id, req.body?.reason);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});

export const reactivateHotel = asyncHandler(async (req, res) => {
  const result = await hotelRegistryService.reactivateHotel(req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, result.message));
});
