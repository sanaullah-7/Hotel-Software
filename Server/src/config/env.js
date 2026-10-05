import "dotenv/config";

// Validation
const requiredEnv = [
  "PLATFORM_MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Object.freeze(): Configuration object ko modify hone se protect karta hai.
export const ENV = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  PLATFORM_MONGO_URI: process.env.PLATFORM_MONGO_URI,
  MONGODB_HOTEL_BASE_URI: process.env.MONGODB_HOTEL_BASE_URI || "mongodb://localhost:27017/hotel_",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
});