import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/apiResponse.js';
import ApiError from '../../../utils/apiError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import * as quickSearchService from './quickSearch.service.js';

export const handleQuickSearch = asyncHandler(async (req, res) => {
  const queryStr = req.query.q || '';
  if (queryStr && queryStr.length > 100) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Search query cannot exceed 100 characters');
  }

  const options = {
    limit: req.query.limit,
  };

  const results = await quickSearchService.quickSearch(req.hotelContext, queryStr, options);

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, results, 'Quick search results retrieved successfully'));
});
