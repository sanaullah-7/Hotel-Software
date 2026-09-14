// chagpt
import ApiError from "../utils/apiError.js";

const hotelAccess = (req, res, next) => {
  // Logged-in user kisi hotel ke saath associated hai ya nahi?
  // Yahan ?. ko optional chaining operator kehte hain.
  if (!req.user?.hotelId) //"Pehle check karo req.user exist karta hai ya nahi. Agar karta hai to uska hotelId do. Agar nahi karta, to undefined return karo."
    {
    return next(
      new ApiError(403, "Hotel access is required")
    );
  }
// Ab middleware ye pata kar raha hai: Request kis hotel ke baare mein hai?
  const requestedHotelId =
    req.params.hotelId ||
    req.body.hotelId ||
    req.query.hotelId;

    // Agar request mein hotel ID di gayi hai, AND woh logged-in user's hotel ID ke equal nahi hai, to access deny karo.
  if (
    requestedHotelId &&
    requestedHotelId.toString() !==
      req.user.hotelId.toString()
  ) {
    return next(
      new ApiError(403, "You do not have access to this hotel")
    );
  }
// Hotel access successfully verify ho gaya. Ab next middleware/controller ko request de do.
  next();
};

export default hotelAccess;