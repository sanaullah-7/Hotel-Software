import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import * as registrationFormService from './registrationForm.service.js';

export const getRegistrationForms = asyncHandler(async (req, res) => {
  const forms = await registrationFormService.getRegistrationForms(req.hotelContext, req.query);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, forms, 'Registration forms retrieved successfully'));
});

export const createRegistrationForm = asyncHandler(async (req, res) => {
  const form = await registrationFormService.createRegistrationForm(req.hotelContext, req.body);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, form, 'Registration form created successfully'));
});

export const getRegistrationFormById = asyncHandler(async (req, res) => {
  const form = await registrationFormService.getRegistrationFormById(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, form, 'Registration form retrieved successfully'));
});

export const deleteRegistrationForm = asyncHandler(async (req, res) => {
  const result = await registrationFormService.deleteRegistrationForm(req.hotelContext, req.params.id);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, result, 'Registration form deleted successfully'));
});
