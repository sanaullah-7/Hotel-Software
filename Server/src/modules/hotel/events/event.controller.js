import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as eventService from "./event.service.js";

// =============================================================================
// EVENTS CONTROLLERS
// =============================================================================

export const getEvents = asyncHandler(async (req, res) => {
  const result = await eventService.getEvents(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Events retrieved successfully"));
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, event, "Event retrieved successfully"));
});

export const createEvent = asyncHandler(async (req, res) => {
  const event = await eventService.createEvent(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, event, "Event created successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await eventService.updateEvent(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, event, "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Event deleted successfully"));
});

export const bulkDeleteEvents = asyncHandler(async (req, res) => {
  const result = await eventService.bulkDeleteEvents(req.hotelContext, req.body.ids);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Events deleted successfully"));
});

export const getEventMetrics = asyncHandler(async (req, res) => {
  const metrics = await eventService.getEventMetrics(req.hotelContext);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, metrics, "Event metrics retrieved successfully"));
});

// =============================================================================
// BEOs CONTROLLERS (BANQUET MANAGER)
// =============================================================================

export const getBeos = asyncHandler(async (req, res) => {
  const beos = await eventService.getBeos(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, beos, "BEOs retrieved successfully"));
});

export const getBeoById = asyncHandler(async (req, res) => {
  const beo = await eventService.getBeoById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, beo, "BEO retrieved successfully"));
});

export const createBeo = asyncHandler(async (req, res) => {
  const beo = await eventService.createBeo(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, beo, "BEO created successfully"));
});

export const updateBeo = asyncHandler(async (req, res) => {
  const beo = await eventService.updateBeo(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, beo, "BEO updated successfully"));
});

export const deleteBeo = asyncHandler(async (req, res) => {
  const result = await eventService.deleteBeo(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "BEO deleted successfully"));
});

export const getBeoMetrics = asyncHandler(async (req, res) => {
  const metrics = await eventService.getBeoMetrics(req.hotelContext);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, metrics, "BEO metrics retrieved successfully"));
});
