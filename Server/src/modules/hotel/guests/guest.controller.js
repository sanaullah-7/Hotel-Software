import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as guestService from "./guest.service.js";

export const createGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.createGuest(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, guest, "Guest created successfully"));
});

export const getGuests = asyncHandler(async (req, res) => {
  const result = await guestService.getGuests(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.guests,
        "Guests retrieved successfully",
        result.pagination
      )
    );
});

export const getGuestById = asyncHandler(async (req, res) => {
  const guest = await guestService.getGuestById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, guest, "Guest retrieved successfully"));
});

export const updateGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.updateGuest(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, guest, "Guest updated successfully"));
});

export const deleteGuest = asyncHandler(async (req, res) => {
  await guestService.deleteGuest(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Guest deleted successfully"));
});
