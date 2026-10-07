import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as parkingService from "./parking.service.js";

// ======================== SPACES ========================

export const getParkingSpaces = asyncHandler(async (req, res) => {
  const spaces = await parkingService.getParkingSpaces(req.hotelContext);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, spaces, "Parking spaces retrieved successfully"));
});

export const createParkingSpace = asyncHandler(async (req, res) => {
  const space = await parkingService.createParkingSpace(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, space, "Parking space created successfully"));
});

export const updateParkingSpaceStatus = asyncHandler(async (req, res) => {
  const space = await parkingService.updateParkingSpaceStatus(
    req.hotelContext,
    req.params.id,
    req.body.status
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, space, "Parking space status updated successfully"));
});

export const deleteParkingSpace = asyncHandler(async (req, res) => {
  const result = await parkingService.deleteParkingSpace(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Parking space deleted successfully"));
});

// ======================== RECORDS ========================

export const getParkingRecords = asyncHandler(async (req, res) => {
  const result = await parkingService.getParkingRecords(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.records,
        "Parking records retrieved successfully",
        result.pagination
      )
    );
});

export const getParkingMetrics = asyncHandler(async (req, res) => {
  const metrics = await parkingService.getParkingMetrics(req.hotelContext);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, metrics, "Parking metrics retrieved successfully"));
});

export const getParkingRecordById = asyncHandler(async (req, res) => {
  const record = await parkingService.getParkingRecordById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, record, "Parking record retrieved successfully"));
});

export const createParkingRecord = asyncHandler(async (req, res) => {
  const record = await parkingService.createParkingRecord(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, record, "Vehicle parked successfully"));
});

export const updateParkingRecord = asyncHandler(async (req, res) => {
  const record = await parkingService.updateParkingRecord(
    req.hotelContext,
    req.params.id,
    req.body
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, record, "Parking record updated successfully"));
});

export const checkoutParkingRecord = asyncHandler(async (req, res) => {
  const record = await parkingService.checkoutParkingRecord(
    req.hotelContext,
    req.params.id,
    req.body
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, record, "Vehicle checked out successfully"));
});

export const deleteParkingRecord = asyncHandler(async (req, res) => {
  const result = await parkingService.deleteParkingRecord(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Parking record deleted successfully"));
});
