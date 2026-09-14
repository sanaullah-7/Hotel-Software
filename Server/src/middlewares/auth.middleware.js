import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import { ENV } from "../config/env.js";
import Account from "../modules/accounts/account.model.js";

// Ye middleware karta kya hai?
// "Ye user kaun hai?
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // Bearer basically server ko batata hai:"Main authentication token lekar aa raha hoon."
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    // [0] → Bearer [1] → abc123xyz
    const token = authHeader.split(" ")[1];
    // jwt.verify() check karta hai:token valid hai? token correctly signed hai?
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET);
    //  JWT valid hone ke baad bhi hum database check karte hain:"Kya ye account abhi bhi exist karta hai?"
    const account = await Account.findById(decoded.id).select("-password"); //Database se account lao, lekin password field mat lao.bcz Password ko  expose nahi karna.
    if (!account) {
      throw new ApiError(401, "Account no longer exists");
    }

    // Baad mein admin ne account suspend kar diya.JWT abhi technically valid hai.Lekin database status:suspendedhai.
    // To user ko protected resources access nahi denge.
    if (account.status === "suspended" || account.status === "banned") {
      throw new ApiError(403, "Account is not active");
    }

    req.user = {
      id: account._id,
      role: account.role,
      email: account.email,
      hotelId: account.hotelId,     
      isEmailVerified: account.isEmailVerified,
    }; // { id, role, email, ... }
    // Authentication successful hai, ab next middleware/controller ko request de do.
    next();
  } catch (err) {
    // jsonwebtoken invalid token par specific error deta hai.client ko clean response dete hain
    if (err.name === "JsonWebTokenError")
      return next(new ApiError(401, "Invalid token"));
    // Agar access token expire ho gaya:
    if (err.name === "TokenExpiredError")
      return next(new ApiError(401, "Token expired"));
    next(err); //Agar error JWT ka known error nahi hai, original error ko central error handler ko bhej do.
  }
};

export default authMiddleware;

