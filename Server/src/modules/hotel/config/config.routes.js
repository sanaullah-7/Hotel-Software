import { Router } from "express";
import * as hotelProfileController from "./hotelProfile.controller.js";
import * as hotelPoliciesController from "./hotelPolicies.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { updateProfileSchema, updatePoliciesSchema } from "./config.validation.js";

const router = Router();

// All config routes require authentication and a valid hotel context
router.use(authMiddleware, hotelContext);

// ----------------------------------------------------
// Hotel Profile Routes
// ----------------------------------------------------
router.get("/profile", hotelProfileController.getHotelProfile);
router.put(
  "/profile", 
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN), 
  validate(updateProfileSchema), 
  hotelProfileController.updateHotelProfile
);

// ----------------------------------------------------
// Hotel Policies Routes
// ----------------------------------------------------
router.get("/policies", hotelPoliciesController.getHotelPolicies);
router.put(
  "/policies", 
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN), 
  validate(updatePoliciesSchema), 
  hotelPoliciesController.updateHotelPolicies
);

export default router;
