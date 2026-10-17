import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import * as expenseService from "./expense.service.js";

export const getExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.getExpenses(req.hotelContext, req.query);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Expenses retrieved successfully"));
});

export const getExpenseSummary = asyncHandler(async (req, res) => {
  const result = await expenseService.getExpenseSummary(req.hotelContext);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Expense summary retrieved successfully"));
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const result = await expenseService.getExpenseById(req.hotelContext, req.params.id);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Expense retrieved successfully"));
});

export const createExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.createExpense(req.hotelContext, req.body);
  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, "Expense created successfully"));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.updateExpense(req.hotelContext, req.params.id, req.body);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Expense updated successfully"));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.deleteExpense(req.hotelContext, req.params.id);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Expense deleted successfully"));
});

export const bulkDeleteExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.bulkDeleteExpenses(req.hotelContext, req.body.ids);
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, "Expenses bulk deleted successfully"));
});
