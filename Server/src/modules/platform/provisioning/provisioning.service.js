import mongoose from "mongoose";
import Account from "../../../database/platform/models/account.model.js";
import Hotel from "../../../database/platform/models/hotel.model.js";
import ApiError from "../../../utils/apiError.js";
import logger from "../../../config/logger.js";
import { ROLES } from "../../../constants/roles.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { deleteHotelDocuments } from "../../../database/connectionManager.js";

/**
 * Onboards a new hotel for an existing user.
 *
 * Order of operations (each step is compensated if a later one fails):
 *   1. ATOMICALLY claim the account  (hotelId: null -> new hotelId, role -> HOTEL_ADMIN)
 *      Only ONE concurrent request can win this compare-and-set, so a losing request never
 *      creates a Hotel or hotel-owned documents at all.
 *   2. Create the Hotel record in the shared database
 *   3. Seed the hotel-owned HotelProfile
 *
 * On any failure after step 1 everything is rolled back:
 *   Hotel and owned documents deleted, account restored to its original hotelId/role.
 */
export const onboardHotel = async (user, data) => {
  const account = await Account.findById(user.id);
  if (!account) {
    throw new ApiError(401, "Account no longer exists");
  }
  if (account.hotelId) {
    throw new ApiError(400, "Account is already associated with a hotel");
  }
  if (account.role !== ROLES.HOTEL_USER) {
    throw new ApiError(403, "Only standard accounts can onboard a new hotel");
  }

  const originalRole = account.role;
  const hotelId = new mongoose.Types.ObjectId();

  // 1. Atomic claim (compare-and-set)
  const claimed = await Account.findOneAndUpdate(
    { _id: account._id, hotelId: null, role: originalRole },
    { $set: { hotelId, role: ROLES.HOTEL_ADMIN } },
    { returnDocument: "after" }
  );
  if (!claimed) {
    throw new ApiError(409, "Account is already associated with a hotel (concurrent request).");
  }

  let hotelCreated = false;
  try {
    // 2. Platform Hotel record
    await Hotel.create({
      _id: hotelId,
      property_name: data.property_name,
      ownerId: account._id,
      address: data.address,
      city: data.city,
      status: "active",
    });
    hotelCreated = true;

    // 3. Provision tenant profile & seed HotelProfile
    const HotelProfile = await getModel(hotelId.toString(), "HotelProfile");
    await HotelProfile.create({
      hotelId,
      property_name: data.property_name,
      legal_name: data.property_name,
      email: account.email || "info@hotel.com",
      phone: account.phone || "+920000000000",
      address: data.address,
      city: data.city,
      country: "Pakistan",
      currency: "PKR",
      timezone: "Asia/Karachi",
    });

    return {
      hotelId: hotelId.toString(),
      property_name: data.property_name,
      city: data.city,
      role: claimed.role,
    };
  } catch (error) {
    logger.error(`Hotel onboarding failed for user ${user.id}. Rolling back.`, error);

    // Compensating actions: each is independent so one failing cannot block the others.
    if (hotelCreated) {
      await Hotel.deleteOne({ _id: hotelId }).catch((e) => logger.error("Rollback: hotel delete failed", e));
    }
    await deleteHotelDocuments(hotelId.toString()).catch((e) => logger.error("Rollback: hotel document cleanup failed", e));
    // Only restore if the account still points at OUR hotel (never clobber a different state).
    await Account.updateOne(
      { _id: account._id, hotelId },
      { $set: { hotelId: null, role: originalRole } }
    ).catch((e) => logger.error("Rollback: account restore failed", e));

    // Internal details are logged, never returned to the client.
    throw new ApiError(500, "Failed to provision hotel");
  }
};
