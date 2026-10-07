import "dotenv/config";

const platformMongoUri = process.env.PLATFORM_MONGO_URI || process.env.MONGO_URI;

if (!platformMongoUri) {
  throw new Error("Missing required environment variable: PLATFORM_MONGO_URI or MONGO_URI");
}
if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("Missing required environment variable: JWT_ACCESS_SECRET");
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("Missing required environment variable: JWT_REFRESH_SECRET");
}

// Object.freeze(): Configuration object ko modify hone se protect karta hai.
export const ENV = Object.freeze({
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  PLATFORM_MONGO_URI: platformMongoUri,
  MONGODB_HOTEL_BASE_URI: process.env.MONGODB_HOTEL_BASE_URI || "mongodb://localhost:27017/hotel_",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || "15m",
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || "7d",
});