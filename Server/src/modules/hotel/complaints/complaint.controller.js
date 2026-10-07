import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as complaintService from "./complaint.service.js";

export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.createComplaint(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, complaint, "Complaint created successfully"));
});

export const getComplaints = asyncHandler(async (req, res) => {
  const result = await complaintService.getComplaints(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.complaints,
        "Complaints retrieved successfully",
        result.pagination
      )
    );
});

export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, complaint, "Complaint retrieved successfully"));
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateComplaint(
    req.hotelContext,
    req.params.id,
    req.body
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, complaint, "Complaint updated successfully"));
});

export const deleteComplaint = asyncHandler(async (req, res) => {
  await complaintService.deleteComplaint(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Complaint deleted successfully"));
});
