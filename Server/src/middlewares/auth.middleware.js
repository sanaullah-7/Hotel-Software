import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import { ENV } from "../config/env.js";
import Account from "../database/platform/models/account.model.js";

/**
 * Authentication: "Who is this user?"
 *  - verifies the JWT signature/expiry/type
 *  - re-loads the account from the DB (role/hotelId are NEVER trusted from the token)
 *  - rejects non-active accounts and revoked tokens (tokenVersion mismatch)
 */
const authMiddleware = async (req, res, next) => {
  // Already authenticated earlier in this request (flag is set server-side only).
  if (req.authVerified && req.user) return next();
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });

    if (decoded.type !== "access") {
      throw new ApiError(401, "Invalid token");
    }

    const account = await Account.findById(decoded.id).select("-password");
    if (!account) {
      throw new ApiError(401, "Account no longer exists");
    }

    // Only fully active accounts may use the API (blocks suspended, banned AND pending).
    if (account.status !== "active") {
      throw new ApiError(403, "Account is not active");
    }

    // Token revocation (logout / password reset bump tokenVersion).
    if ((decoded.tv ?? 0) !== (account.tokenVersion ?? 0)) {
      throw new ApiError(401, "Token has been revoked");
    }

    req.user = {
      id: account._id,
      role: account.role,
      email: account.email,
      hotelId: account.hotelId,
    };
    req.authVerified = true;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") return next(new ApiError(401, "Invalid token"));
    if (err.name === "TokenExpiredError") return next(new ApiError(401, "Token expired"));
    next(err);
  }
};

export default authMiddleware;
