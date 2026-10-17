import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as lostAndFoundService from "./lostAndFound.service.js";

export const createItem = asyncHandler(async (req, res) => {
  const item = await lostAndFoundService.createItem(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, item, "Lost & Found item recorded successfully"));
});

export const getItems = asyncHandler(async (req, res) => {
  const result = await lostAndFoundService.getItems(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.items, "Lost & Found items retrieved successfully", result.pagination));
});

export const getItemById = asyncHandler(async (req, res) => {
  const item = await lostAndFoundService.getItemById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, item, "Lost & Found item retrieved successfully"));
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await lostAndFoundService.updateItem(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, item, "Lost & Found item updated successfully"));
});

export const deleteItem = asyncHandler(async (req, res) => {
  const result = await lostAndFoundService.deleteItem(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Lost & Found item deleted successfully"));
});
