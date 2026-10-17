import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import * as restaurantService from "./restaurant.service.js";

// =============================================================================
// CATEGORIES CONTROLLERS
// =============================================================================

export const createCategory = asyncHandler(async (req, res) => {
  const result = await restaurantService.createCategory(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, "Category created successfully")
  );
});

export const getCategories = asyncHandler(async (req, res) => {
  const result = await restaurantService.getCategories(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Categories retrieved successfully")
  );
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const result = await restaurantService.getCategoryById(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Category retrieved successfully")
  );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const result = await restaurantService.updateCategory(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Category updated successfully")
  );
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const result = await restaurantService.deleteCategory(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Category deleted or deactivated successfully")
  );
});

// =============================================================================
// MENU ITEMS CONTROLLERS
// =============================================================================

export const createMenuItem = asyncHandler(async (req, res) => {
  const result = await restaurantService.createMenuItem(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, "Menu item created successfully")
  );
});

export const getMenuItems = asyncHandler(async (req, res) => {
  const { items, pagination } = await restaurantService.getMenuItems(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, items, "Menu items retrieved successfully", pagination)
  );
});

export const getMenuItemById = asyncHandler(async (req, res) => {
  const result = await restaurantService.getMenuItemById(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Menu item retrieved successfully")
  );
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const result = await restaurantService.updateMenuItem(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Menu item updated successfully")
  );
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  const result = await restaurantService.deleteMenuItem(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Menu item deleted or deactivated successfully")
  );
});

// =============================================================================
// TABLES CONTROLLERS
// =============================================================================

export const createTable = asyncHandler(async (req, res) => {
  const result = await restaurantService.createTable(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, "Table created successfully")
  );
});

export const getTables = asyncHandler(async (req, res) => {
  const result = await restaurantService.getTables(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Tables retrieved successfully")
  );
});

export const getTableById = asyncHandler(async (req, res) => {
  const result = await restaurantService.getTableById(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Table retrieved successfully")
  );
});

export const updateTable = asyncHandler(async (req, res) => {
  const result = await restaurantService.updateTable(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Table updated successfully")
  );
});

export const deleteTable = asyncHandler(async (req, res) => {
  const result = await restaurantService.deleteTable(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Table deleted successfully")
  );
});

// =============================================================================
// ORDERS CONTROLLERS
// =============================================================================

export const createOrder = asyncHandler(async (req, res) => {
  const result = await restaurantService.createOrder(req.hotelContext, req.body, req.user);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, "Restaurant order created successfully")
  );
});

export const getOrders = asyncHandler(async (req, res) => {
  const { orders, pagination } = await restaurantService.getOrders(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, orders, "Restaurant orders retrieved successfully", pagination)
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const result = await restaurantService.getOrderById(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Restaurant order retrieved successfully")
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await restaurantService.updateOrderStatus(
    req.hotelContext,
    req.params.id,
    req.body.status,
    req.user,
    req.body.notes
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Order status updated successfully")
  );
});

export const updateOrder = asyncHandler(async (req, res) => {
  const result = await restaurantService.updateOrder(
    req.hotelContext,
    req.params.id,
    req.body
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Restaurant order updated successfully")
  );
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const result = await restaurantService.deleteOrder(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, "Restaurant order deleted successfully")
  );
});
