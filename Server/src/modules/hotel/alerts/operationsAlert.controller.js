import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as alertService from "./operationsAlert.service.js";

export const createAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.createAlert(req.hotelContext, req.body, req.user);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, alert, "Operations alert created successfully"));
});

export const getAlerts = asyncHandler(async (req, res) => {
  const result = await alertService.getAlerts(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.alerts,
        "Operations alerts retrieved successfully",
        result.pagination
      )
    );
});

export const getAlertById = asyncHandler(async (req, res) => {
  const alert = await alertService.getAlertById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, alert, "Operations alert retrieved successfully"));
});

export const updateAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.updateAlert(
    req.hotelContext,
    req.params.id,
    req.body,
    req.user
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, alert, "Operations alert updated successfully"));
});

export const deleteAlert = asyncHandler(async (req, res) => {
  await alertService.deleteAlert(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, null, "Operations alert deleted successfully"));
});
