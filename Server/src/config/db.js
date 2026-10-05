import { connectPlatformDB } from "../database/platform/platformConnection.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    await connectPlatformDB();
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;

