import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as folioService from "./folio.service.js";

export const createFolio = asyncHandler(async (req, res) => {
  const folio = await folioService.createFolio(req.hotelContext, req.body);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, folio, "Folio created successfully"));
});

export const getFolios = asyncHandler(async (req, res) => {
  const result = await folioService.getFolios(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result.folios, "Folios retrieved successfully", result.pagination));
});

export const getFolioById = asyncHandler(async (req, res) => {
  const folio = await folioService.getFolioById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, folio, "Folio details retrieved successfully"));
});
