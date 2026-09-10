import express from "express";
import chalk from "chalk";
import morgan from "morgan"
const app = express();

// MIDDLEWARES
app.use(morgan("dev")); // 2. Yeh line har request ko terminal par khubsoorat rangon mein log karegi!
app.use(express.json()); // (Optional: JSON data read karne ke liye)


// 404 CATCH-ALL HANDLER
// Unknown route ke liye generic response. it for all routes
// Backend ki unnecessary information expose nahi hogi.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
});






// ==========================================
// GLOBAL ERROR HANDLER
// Global Error Handler ka kaam hai:
// Server-side error ko ek predictable response mein convert karna.
// Unexpected server errors ko safely handle karega.
// ==========================================
// app.use((err, req, res, next) => {
//   console.error(
//     `[Server Error] ${req.method} ${req.originalUrl}:`,
//     err.message || err
//   );

//   const statusCode = err.status || err.statusCode || 500;

//   res.status(statusCode).json({
//     success: false,
//     message:
//       statusCode < 500
//         ? err.message || "Request could not be processed"
//         : "An unexpected internal server error occurred",
//   });
// });
export default app;
