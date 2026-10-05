import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";

// Singleton: exactly one policies document per tenant (unique `_singleton` index).
const getOrCreatePolicies = async (hotelContext) => {
  const HotelPolicies = await getModel(hotelContext, "HotelPolicies");
  const existing = await HotelPolicies.findOne();
  if (existing) return existing;
  try {
    return await HotelPolicies.create({
      check_in_time: "14:00",
      check_out_time: "11:00",
      early_checkin_policy: "Allowed subject to availability",
      late_checkout_policy: "Allowed subject to availability with surcharge",
      cancellation_policy: "Standard 24-hour cancellation",
      no_show_policy: "Full first night charge",
      pet_policy: "No pets allowed",
      smoking_policy: "Strictly non-smoking",
      age_policy: "Minimum check-in age is 18",
      payment_methods_accepted: ["Credit Card", "Cash"]
    });
  } catch (err) {
    if (err.code === 11000) return HotelPolicies.findOne();
    throw err;
  }
};

export const getHotelPolicies = asyncHandler(async (req, res) => {
  const policies = await getOrCreatePolicies(req.hotelContext);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, policies, "Hotel policies retrieved successfully"));
});

export const updateHotelPolicies = asyncHandler(async (req, res) => {
  const HotelPolicies = await getModel(req.hotelContext, "HotelPolicies");
  const policies = await getOrCreatePolicies(req.hotelContext);

  const updated = await HotelPolicies.findByIdAndUpdate(policies._id, req.body, { returnDocument: "after", runValidators: true });

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, updated, "Hotel policies updated successfully"));
});
