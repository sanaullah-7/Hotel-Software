import express from "express";
import morgan from "morgan"
import cookieParser from "cookie-parser";
import cors from "cors";

import routes from "./routes/index.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/errorHandler.middleware.js";

const app = express();

// MIDDLEWARES
// Har incoming request ko terminal mein log karo.
app.use(morgan("dev")); // 2. Yeh line har request ko terminal par khubsoorat rangon mein log karegi!
app.use(express.json()); // (Optional: JSON data read karne ke liye)


// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));


//Iska kaam browser se aane wali cookies ko read karna hai.
app.use(cookieParser());


app.use(
  cors({ 
    origin: true,
    credentials: true
   }));

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use(notFound);

// Global error handler - MUST be last
app.use(errorHandler);



export default app;
