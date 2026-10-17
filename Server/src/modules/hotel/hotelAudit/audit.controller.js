import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import * as auditService from "./audit.service.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.hotelContext, req.query);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Audit logs retrieved successfully"));
});

export const getAuditMetrics = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditMetrics(req.hotelContext);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Audit metrics retrieved successfully"));
});

export const getAuditLogById = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogById(req.hotelContext, req.params.id);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Audit log retrieved successfully"));
});

export const createAuditLog = asyncHandler(async (req, res) => {
  const result = await auditService.createAuditLog(
    req.hotelContext,
    req.body,
    req.user,
    req.ip
  );
  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, "Audit log created successfully"));
});
