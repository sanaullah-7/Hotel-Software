import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as auditService from "./audit.service.js";

export const getLogs = asyncHandler(async (req, res) => {
  const result = await auditService.listAuditLogs(req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, "Audit logs retrieved successfully"));
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await auditService.getAuditStats();
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, stats, "Audit statistics retrieved successfully"));
});

export const recordLog = asyncHandler(async (req, res) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
  const performedBy = req.user?.fullName || "Super Admin";
  const performedById = req.user?.id || null;

  const entry = await auditService.logAction({
    ...req.body,
    performedBy: req.body.performedBy || performedBy,
    performedById: req.body.performedById || performedById,
    ip: req.body.ip || ip,
  });

  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, entry, "Audit log recorded"));
});
