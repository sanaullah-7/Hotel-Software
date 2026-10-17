import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as inspectionService from "./inspection.service.js";

// Inspections
export const createInspection = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.createInspection(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, inspection, "Inspection recorded successfully"));
});

export const getInspections = asyncHandler(async (req, res) => {
  const result = await inspectionService.getInspections(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.inspections, "Inspections retrieved successfully", result.pagination));
});

export const getInspectionById = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.getInspectionById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, inspection, "Inspection retrieved successfully"));
});

export const updateInspection = asyncHandler(async (req, res) => {
  const inspection = await inspectionService.updateInspection(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, inspection, "Inspection updated successfully"));
});

export const deleteInspection = asyncHandler(async (req, res) => {
  const result = await inspectionService.deleteInspection(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Inspection deleted successfully"));
});

// Checklists
export const createChecklist = asyncHandler(async (req, res) => {
  const checklist = await inspectionService.createChecklist(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, checklist, "Checklist created successfully"));
});

export const getChecklists = asyncHandler(async (req, res) => {
  const checklists = await inspectionService.getChecklists(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, checklists, "Checklists retrieved successfully"));
});

export const getChecklistById = asyncHandler(async (req, res) => {
  const checklist = await inspectionService.getChecklistById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, checklist, "Checklist retrieved successfully"));
});

export const updateChecklist = asyncHandler(async (req, res) => {
  const checklist = await inspectionService.updateChecklist(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, checklist, "Checklist updated successfully"));
});

export const deleteChecklist = asyncHandler(async (req, res) => {
  const result = await inspectionService.deleteChecklist(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Checklist deleted successfully"));
});
