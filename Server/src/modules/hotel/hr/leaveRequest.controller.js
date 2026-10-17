import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as leaveService from "./leaveRequest.service.js";

export const createLeaveRequest = asyncHandler(async (req, res) => {
  const leave = await leaveService.createLeaveRequest(
    req.hotelContext,
    req.body,
    req.user?.role
  );
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, leave, "Leave request submitted successfully")
  );
});

export const getLeaveRequests = asyncHandler(async (req, res) => {
  const result = await leaveService.getLeaveRequests(
    req.hotelContext,
    req.query
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      result.leaveRequests,
      "Leave requests retrieved successfully",
      { page: result.page, limit: result.limit, total: result.total }
    )
  );
});

export const getLeaveRequestById = asyncHandler(async (req, res) => {
  const leave = await leaveService.getLeaveRequestById(
    req.hotelContext,
    req.params.id
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, leave, "Leave request retrieved successfully")
  );
});

export const updateLeaveRequest = asyncHandler(async (req, res) => {
  const updated = await leaveService.updateLeaveRequest(
    req.hotelContext,
    req.params.id,
    req.body,
    req.user?.role
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, updated, "Leave request updated successfully")
  );
});

export const deleteLeaveRequest = asyncHandler(async (req, res) => {
  await leaveService.deleteLeaveRequest(
    req.hotelContext,
    req.params.id
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, null, "Leave request deleted successfully")
  );
});
