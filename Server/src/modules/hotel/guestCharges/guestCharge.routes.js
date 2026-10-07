import { Router } from "express";
import * as guestChargeController from "./guestCharge.controller.js";
import validate from "../../../middlewares/validate.middleware.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import hotelContext from "../../../middlewares/hotelContext.middleware.js";
import authorize from "../../../middlewares/rbac.middleware.js";
import { ROLES } from "../../../constants/roles.js";
import { validateIdParam } from "../../../utils/query.js";
import { createGuestChargeSchema } from "./guestCharge.validation.js";

const router = Router();

router.use(authMiddleware, hotelContext);

router.post(
  "/guest-charges",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validate(createGuestChargeSchema),
  guestChargeController.createGuestCharge
);

router.get("/guest-charges", guestChargeController.getGuestCharges);

router.get("/guest-charges/:id", validateIdParam, guestChargeController.getGuestChargeById);

router.patch(
  "/guest-charges/:id/void",
  authorize(ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN, ROLES.HOTEL_USER),
  validateIdParam,
  guestChargeController.voidGuestCharge
);

export default router;
