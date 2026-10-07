import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as reservationService from "./reservation.service.js";

export const checkAvailability = asyncHandler(async (req, res) => {
  const results = await reservationService.checkAvailability(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, results, "Room availability checked successfully"));
});

export const createReservation = asyncHandler(async (req, res) => {
  const result = await reservationService.createReservation(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, "Reservation created successfully"));
});

export const getReservations = asyncHandler(async (req, res) => {
  const result = await reservationService.getReservations(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.reservations,
        "Reservations retrieved successfully",
        result.pagination
      )
    );
});

export const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await reservationService.getReservationById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, reservation, "Reservation retrieved successfully"));
});

export const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.updateReservation(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, reservation, "Reservation updated successfully"));
});

export const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.cancelReservation(
    req.hotelContext,
    req.params.id,
    req.body.cancellation_reason
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, reservation, "Reservation cancelled successfully"));
});

export const getGroupReservations = asyncHandler(async (req, res) => {
  const groups = await reservationService.getGroupReservations(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, groups, "Group reservations retrieved successfully"));
});

export const getGroupReservationById = asyncHandler(async (req, res) => {
  const group = await reservationService.getGroupReservationById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, group, "Group reservation retrieved successfully"));
});

export const createGroupReservation = asyncHandler(async (req, res) => {
  const group = await reservationService.createGroupReservation(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, group, "Group reservation created successfully"));
});

export const updateGroupReservation = asyncHandler(async (req, res) => {
  const group = await reservationService.updateGroupReservation(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, group, "Group reservation updated successfully"));
});

export const cancelGroupReservation = asyncHandler(async (req, res) => {
  const group = await reservationService.cancelGroupReservation(
    req.hotelContext,
    req.params.id,
    req.body?.cancellation_reason
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, group, "Group reservation cancelled successfully"));
});

export const deleteGroupReservation = asyncHandler(async (req, res) => {
  const group = await reservationService.cancelGroupReservation(
    req.hotelContext,
    req.params.id,
    req.body?.cancellation_reason
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, group, "Group reservation cancelled successfully"));
});


