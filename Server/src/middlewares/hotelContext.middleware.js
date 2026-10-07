import mongoose from "mongoose";
import ApiError from "../utils/apiError.js";
import { ROLES } from "../constants/roles.js";
import Hotel from "../database/platform/models/hotel.model.js";

/**
 * Resolves the tenant (hotel) context for the request.
 * STRICTLY derived from the authenticated account (req.user), never from request body/query.
 * PLATFORM_ADMIN may only target a hotel through the route param, which is validated.
 * The hotel must exist in the shared database and be active.
 */
const hotelContext = async (req, res, next) => {
  if (req.hotelContextVerified && req.hotelContext) return next();
  try {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    let hotelId;
    if (req.user.role === ROLES.PLATFORM_ADMIN) {
      if (!req.params.hotelId) {
        return next(new ApiError(403, "Platform Admin must specify a hotel context in URL parameters"));
      }
      hotelId = String(req.params.hotelId);
    } else {
      if (!req.user.hotelId) {
        return next(new ApiError(403, "Your account is not associated with any hotel"));
      }
      hotelId = String(req.user.hotelId);
    }

    if (!mongoose.Types.ObjectId.isValid(hotelId) || !/^[a-fA-F0-9]{24}$/.test(hotelId)) {
      return next(new ApiError(400, "Invalid hotel identifier"));
    }

    const hotel = await Hotel.findById(hotelId).select("status").lean();
    if (hotel && hotel.status !== "active") {
      return next(new ApiError(403, "Hotel is not active"));
    }
    if (!hotel) {
      return next(new ApiError(403, "Hotel does not exist or is not provisioned"));
    }

    req.hotelContext = hotelId;
    req.hotelContextVerified = true;
    next();
  } catch (err) {
    next(err);
  }
};

export default hotelContext;
