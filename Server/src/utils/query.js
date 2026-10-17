import mongoose from "mongoose";
import ApiError from "./apiError.js";

/** Coerce any query-string value to a plain string (blocks `?x[$ne]=1` operator injection). */
export const asString = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

/** Escape user input before using it inside a RegExp (prevents ReDoS / invalid-regex 500s). */
export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Bounded, sanitized pagination. */
export const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

/** Validate a query-string ObjectId, throwing 400 when malformed. */
export const objectIdQuery = (value, name) => {
  const v = asString(value);
  if (v === undefined) return undefined;
  if (!mongoose.Types.ObjectId.isValid(v) || !/^[a-fA-F0-9]{24}$/.test(v)) {
    throw new ApiError(400, `Invalid ${name}`);
  }
  return v;
};

/** Express router.param handler: rejects malformed :id before it reaches MongoDB. */
export const validateIdParam = (req, res, next, value) => {
  if (!/^[a-fA-F0-9]{24}$/.test(String(value))) {
    return next(new ApiError(400, "Invalid ID format"));
  }
  next();
};
