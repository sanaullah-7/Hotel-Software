import ApiError from "../utils/apiError.js";
const notFound = (req, res, next) => {
  // Matlab ApiError class ka naya object banao
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export default notFound;
