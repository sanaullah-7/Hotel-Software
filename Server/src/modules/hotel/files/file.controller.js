import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/apiResponse.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import * as fileService from './file.service.js';
import ApiError from '../../../utils/apiError.js';

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Please upload a file using field name "file"');
  }

  const fileRecord = await fileService.uploadFile(req.hotelContext, req.file, {
    folder: req.body.folder || 'documents',
    entity_ref: req.body.entity_ref || 'DOCUMENT',
    entity_id: req.body.entity_id || null,
    uploaded_by: req.user?._id || req.body.uploaded_by || null,
  });

  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, fileRecord, 'File uploaded successfully'));
});

export const getFileById = asyncHandler(async (req, res) => {
  const fileRecord = await fileService.getFileById(req.hotelContext, req.params.id);

  // If redirect query or Cloudinary URL, can redirect directly
  if (req.query.redirect === 'true' && fileRecord.storage_url) {
    return res.redirect(fileRecord.storage_url);
  }

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, fileRecord, 'File metadata retrieved successfully'));
});
