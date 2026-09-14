import { ENV } from "../config/env.js";


const errorHandler = (err, req, res, next) => {
  // "Server terminal mein batao ke kis HTTP request/URL par error aaya aur actual error kya tha."
  console.error(
    // e.g : [Server Error] GET /api/hotels/123:
    `[Server Error] ${req.method} ${req.originalUrl}:`,
    // err:Actual error object.
    err
  );// Terminal mein kuch aisa nazar aa sakta hai:
// [Server Error] GET /api/hotels/123: ApiError: Hotel not found

  const statusCode = err.statusCode || err.status || 500;

  const message =
    statusCode >= 500 && ENV.NODE_ENV === "production"
      ? "An unexpected internal server error occurred"
      : err.message || "Internal Server Error";//Agar err.message available hai to woh use karo, warna "Internal Server Error" use karo

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],//Suppose validation ke multiple errors hain tu eslye ye lekha ha [].
     // Yahan ternary operator use hua hai.Agar:evelopment hai:response mein milega. 
    // agr Agar production hai:undefined milega.
    stack: ENV.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;