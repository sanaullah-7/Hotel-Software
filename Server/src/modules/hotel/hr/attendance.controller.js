import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import * as attendanceService from './attendance.service.js';

export const createAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.createAttendance(
    req.hotelContext,
    req.body
  );
  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, result, 'Attendance recorded successfully'));
});

export const getAttendance = asyncHandler(async (req, res) => {
  const results = await attendanceService.getAttendance(
    req.hotelContext,
    req.query
  );
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, results, 'Attendance records fetched successfully'));
});

export const getAttendanceById = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendanceById(
    req.hotelContext,
    req.params.id
  );
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Attendance record fetched successfully'));
});

export const updateAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.updateAttendance(
    req.hotelContext,
    req.params.id,
    req.body
  );
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Attendance record updated successfully'));
});

export const deleteAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.deleteAttendance(
    req.hotelContext,
    req.params.id
  );
  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, result, 'Attendance record deleted successfully'));
});
