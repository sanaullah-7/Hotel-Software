import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as inventoryService from "./inventory.service.js";

export const createItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.createInventoryItem(req.hotelContext, req.body, req.user);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, item, "Inventory item created successfully"));
});

export const getItems = asyncHandler(async (req, res) => {
  const result = await inventoryService.getInventoryItems(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.items,
        "Inventory items retrieved successfully",
        result.pagination
      )
    );
});

export const getItemById = asyncHandler(async (req, res) => {
  const item = await inventoryService.getInventoryItemById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, item, "Inventory item retrieved successfully"));
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.updateInventoryItem(req.hotelContext, req.params.id, req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, item, "Inventory item updated successfully"));
});

export const deactivateItem = asyncHandler(async (req, res) => {
  const result = await inventoryService.deactivateInventoryItem(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Inventory item deactivated successfully"));
});

export const adjustStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(
    req.hotelContext,
    req.params.id,
    req.body,
    req.user
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Stock adjusted successfully"));
});

export const getItemMovements = asyncHandler(async (req, res) => {
  const result = await inventoryService.getItemMovements(
    req.hotelContext,
    req.params.id,
    req.query
  );
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.movements,
        "Item movements retrieved successfully",
        result.pagination
      )
    );
});

export const getMovements = asyncHandler(async (req, res) => {
  const result = await inventoryService.getMovements(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.movements,
        "Inventory movements retrieved successfully",
        result.pagination
      )
    );
});

export const createIncident = asyncHandler(async (req, res) => {
  const incident = await inventoryService.createIncident(req.hotelContext, req.body, req.user);
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, incident, "Inventory incident created successfully"));
});

export const getIncidents = asyncHandler(async (req, res) => {
  const result = await inventoryService.getIncidents(req.hotelContext, req.query);
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        result.incidents,
        "Inventory incidents retrieved successfully",
        result.pagination
      )
    );
});

export const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await inventoryService.getIncidentById(req.hotelContext, req.params.id);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, incident, "Inventory incident retrieved successfully"));
});

export const updateIncident = asyncHandler(async (req, res) => {
  const incident = await inventoryService.updateIncident(
    req.hotelContext,
    req.params.id,
    req.body,
    req.user
  );
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, incident, "Inventory incident updated successfully"));
});
