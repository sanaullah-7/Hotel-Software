import ApiError from "../utils/apiError.js";

// Ye middleware karta kya hai?
// "Is user ko ye kaam karne ki permission hai?"
const authorize = (...allowedRoles) => {// Ye rest parameter hai.es ke andar array ban jayega:
  return (req, res, next) => {
    // Agar authenticated user ki information request mein nahi hai.
    if (!req.user) {
      return next(
        new ApiError(401, "Not authenticated")
      );
    }
// Kya req.user.role allowed roles ke array mein mawjod hai?
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You are not allowed to perform this action")
      );
    }
  //  aur request next middleware/controller ko chali jayegi.
    next();
  };
};

export default authorize;

