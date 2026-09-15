import mongoose from "mongoose";
import { ENV } from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
