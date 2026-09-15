import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateAccessToken = (payload) =>
  // Is package se hum:jwt.sign() use karke token banate hain.
//payload: Payload JWT ke andar rakhi hui information hai.
  jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRY,
  });

  // Ye refresh token generate karta hai.
export const generateRefreshToken = (payload) =>{
  return jwt.sign(payload,// WHAT DATA?,
     ENV.JWT_REFRESH_SECRET, // WHICH SECRET?,
   {
    expiresIn: ENV.JWT_REFRESH_EXPIRY,// HOW LONG?
  })};
