import { ENV } from "../config/env.js";

/**
 * Central error handler.
 *
 * Guarantees:
 *  - MongoDB duplicate-key errors (E11000) -> 409 Conflict (DB unique index is the final guarantee)
 *  - Mongoose CastError / ValidationError  -> 400 Bad Request
 *  - Malformed JSON body                   -> 400 Bad Request
 *  - Any 5xx never leaks internals (messages, stack traces, DB details) to the client
 */
const errorHandler = (err, req, res, next) => {
  // Full detail is logged server-side only.
  console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";
  let details = Array.isArray(err.errors) ? err.errors : [];
  let code = err.name || "Error";

  if (err.code === 11000 || err.code === 11001) {
    statusCode = 409;
    message = "Duplicate record already exists";
    details = [];
    code = "DuplicateKeyError";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path || "field"}`;
    details = [];
    code = "CastError";
  } else if (err.name === "ValidationError" && err.errors && !Array.isArray(err.errors)) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => e.message);
    code = "ValidationError";
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON body";
    details = [];
  }

  if (statusCode >= 500) {
    message = "An unexpected internal server error occurred";
    details = [];
    code = "InternalServerError";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

export default errorHandler;