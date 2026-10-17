import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as maintenanceService from "./maintenance.service.js";

export const createTicket = asyncHandler(async (req, res) => {
  const ticket = await maintenanceService.createTicket(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, ticket, "Maintenance ticket created successfully"));
});

export const getTickets = asyncHandler(async (req, res) => {
  const result = await maintenanceService.getTickets(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.tickets, "Maintenance tickets retrieved successfully", result.pagination));
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await maintenanceService.updateTicket(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, ticket, "Maintenance ticket updated successfully"));
});
