import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";

// Exactly one profile per hotel (unique compound index on hotelId).
const getOrCreateProfile = async (hotelContext) => {
  const HotelProfile = await getModel(hotelContext, "HotelProfile");
  const existing = await HotelProfile.findOne({ hotelId: hotelContext });
  if (existing) return existing;
  try {
    return await HotelProfile.create({
      hotelId: hotelContext,
      property_name: "New Hotel",
      legal_name: "New Hotel LLC",
      email: "info@hotel.com",
      phone: "+923000000000",
      address: "123 Main Street",
      city: "Karachi",
      country: "Pakistan",
      currency: "PKR",
      timezone: "Asia/Karachi",
    });
  } catch (err) {
    if (err.code === 11000) return HotelProfile.findOne({ hotelId: hotelContext });
    throw err;
  }
};

export const getHotelProfile = asyncHandler(async (req, res) => {
  const profile = await getOrCreateProfile(req.hotelContext);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, profile, "Hotel profile retrieved successfully"));
});

export const updateHotelProfile = asyncHandler(async (req, res) => {
  const HotelProfile = await getModel(req.hotelContext, "HotelProfile");
  const profile = await getOrCreateProfile(req.hotelContext);

  const updateData = { ...req.body };
  delete updateData.hotelId;

  const updated = await HotelProfile.findOneAndUpdate(
    { _id: profile._id, hotelId: req.hotelContext },
    updateData,
    { returnDocument: "after", runValidators: true }
  );

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "Hotel profile updated successfully"));
});
