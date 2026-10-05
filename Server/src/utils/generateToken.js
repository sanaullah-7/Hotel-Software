import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

// Tokens carry an explicit `type` so a refresh token can never be replayed as an access token
// (and vice-versa), even if both secrets were configured identically.
export const generateAccessToken = (payload) =>
  jwt.sign({ ...payload, type: "access" }, ENV.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: ENV.JWT_ACCESS_EXPIRY,
  });

export const generateRefreshToken = (payload) =>
  jwt.sign({ ...payload, type: "refresh" }, ENV.JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: ENV.JWT_REFRESH_EXPIRY,
  });
