import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import * as payrollService from './payroll.service.js';

export const createPayrollRun = asyncHandler(async (req, res) => {
  const result = await payrollService.createPayrollRun(req.hotelContext, req.body, req.user);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, 'Payroll run created successfully')
  );
});

export const getPayrollRuns = asyncHandler(async (req, res) => {
  const { runs, page, limit, total } = await payrollService.getPayrollRuns(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, runs, 'Payroll runs retrieved successfully', { page, limit, total })
  );
});

export const getPayrollRunById = asyncHandler(async (req, res) => {
  const result = await payrollService.getPayrollRunById(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Payroll run retrieved successfully')
  );
});

export const updatePayrollRun = asyncHandler(async (req, res) => {
  const result = await payrollService.updatePayrollRun(
    req.hotelContext,
    req.params.id,
    req.body,
    req.user?.role
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Payroll run updated successfully')
  );
});

export const deletePayrollRun = asyncHandler(async (req, res) => {
  const result = await payrollService.deletePayrollRun(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Payroll run deleted successfully')
  );
});

// ----------------- Payroll Items -----------------

export const createPayrollItem = asyncHandler(async (req, res) => {
  const result = await payrollService.createPayrollItem(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, result, 'Payroll item created successfully')
  );
});

export const getPayrollItems = asyncHandler(async (req, res) => {
  const { items, page, limit, total } = await payrollService.getPayrollItems(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, items, 'Payroll items retrieved successfully', { page, limit, total })
  );
});

export const getPayrollItemById = asyncHandler(async (req, res) => {
  const result = await payrollService.getPayrollItemById(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Payroll item retrieved successfully')
  );
});

export const updatePayrollItem = asyncHandler(async (req, res) => {
  const result = await payrollService.updatePayrollItem(req.hotelContext, req.params.id, req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Payroll item updated successfully')
  );
});

export const deletePayrollItem = asyncHandler(async (req, res) => {
  const result = await payrollService.deletePayrollItem(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Payroll item deleted successfully')
  );
});

// ----------------- Employee Salary Roster -----------------

export const getEmployeeSalaryRoster = asyncHandler(async (req, res) => {
  const roster = await payrollService.getEmployeeSalaryRoster(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, roster, 'Employee salary roster retrieved successfully')
  );
});

export const updateEmployeeSalaryReference = asyncHandler(async (req, res) => {
  const result = await payrollService.updateEmployeeSalaryReference(
    req.hotelContext,
    req.params.id,
    req.body.salary
  );
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, result, 'Employee salary updated successfully')
  );
});
