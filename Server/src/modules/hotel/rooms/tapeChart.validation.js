import Joi from "joi";
import ApiError from "../../../utils/apiError.js";

/**
 * Validates that a string is a strictly valid YYYY-MM-DD calendar date.
 */
const validateCalendarDate = (value, helpers) => {
  if (typeof value !== "string") {
    return helpers.error("date.base");
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return helpers.message("Dates must be formatted as YYYY-MM-DD");
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (month < 1 || month > 12) {
    return helpers.message("Invalid calendar month in date");
  }

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (
    dateObj.getUTCFullYear() !== year ||
    dateObj.getUTCMonth() !== month - 1 ||
    dateObj.getUTCDate() !== day
  ) {
    return helpers.message("Invalid calendar date");
  }

  return value.trim();
};

export const tapeChartQuerySchema = Joi.object({
  startDate: Joi.string()
    .required()
    .custom(validateCalendarDate, "Calendar Date Validation")
    .messages({
      "any.required": "startDate query parameter is required",
    }),
  endDate: Joi.string()
    .required()
    .custom(validateCalendarDate, "Calendar Date Validation")
    .messages({
      "any.required": "endDate query parameter is required",
    }),
})
  .custom((query, helpers) => {
    const { startDate, endDate } = query;
    if (!startDate || !endDate) return query;

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);

    if (end <= start) {
      return helpers.message("endDate must be strictly later than startDate");
    }

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 31) {
      return helpers.message("Date range cannot exceed 31 days");
    }

    return query;
  });

/**
 * Express middleware to validate query parameters for Tape Chart without
 * mutating req.query reference (compatible with Express 5 getter semantics).
 */
export const validateTapeChartQuery = (req, res, next) => {
  const { error, value } = tapeChartQuerySchema.validate(req.query || {}, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return next(new ApiError(400, "Validation failed", errors));
  }

  req.validatedQuery = value;
  Object.assign(req.query, value);
  next();
};
